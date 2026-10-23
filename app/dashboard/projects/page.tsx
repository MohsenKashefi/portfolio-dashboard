"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { supabase, siteAsset, TAGS, type Project } from "@/lib/supabase";
import { uploadProjectImage } from "@/lib/uploadImage";
import { Button, Card, Empty, Field, Notice, PageHeader, SAVED_NOTE, Toggle } from "@/components/ui";

const TAG_LABEL: Record<string, string> = { work: "Work", personal: "Personal", web: "Web", mobile: "Mobile", ai: "AI" };
const SITE_IMAGES = ["kts", "fotovoltaico", "academy", "sahand", "foody", "pcp", "codesnack"].map(n => `media/p/${n}.jpg`);
const COLORS = ["#F3A847", "#2DD4BF", "#FACC15", "#6E8BFF", "#B57BFF", "#FF7A45", "#3EE08F", "#38BDF8", "#F472B6"];

type Draft = { id?: number; title: string; meta: string; description: string; tags: string[]; tech: string; live_url: string; github_url: string; accent: string; image_path: string; is_featured: boolean };
const blank: Draft = { title: "", meta: "", description: "", tags: [], tech: "", live_url: "", github_url: "", accent: "#F3A847", image_path: "", is_featured: true };
const toDraft = (p: Project): Draft => ({ id: p.id, title: p.title, meta: p.meta || "", description: p.description || "", tags: p.tags || [], tech: (p.technologies || []).join(", "),
  live_url: p.live_url || "", github_url: p.github_url || "", accent: p.accent || "#F3A847", image_path: p.image_path || "", is_featured: !!p.is_featured });

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("projects").select("*").order("order_index", { ascending: true });
    if (error) setMsg({ kind: "err", text: error.message }); else setItems(data as Project[]);
  };
  useEffect(() => { load(); }, []);

  const site = (items || []).filter(p => p.is_featured && p.tags?.length);
  const other = (items || []).filter(p => !(p.is_featured && p.tags?.length));

  const save = async () => {
    if (!draft) return;
    const bad = [draft.live_url, draft.github_url].find(u => u && !/^https:\/\//.test(u));
    if (!draft.title.trim()) return setMsg({ kind: "err", text: "A project needs a title." });
    if (!draft.tags.length) return setMsg({ kind: "err", text: "Pick at least one tag, so the website can filter it." });
    if (bad) return setMsg({ kind: "err", text: `Links must start with https:// (${bad})` });
    if (!/^#[0-9a-f]{6}$/i.test(draft.accent)) return setMsg({ kind: "err", text: "The colour must look like #F3A847." });
    setBusy(true);
    const row = {
      title: draft.title.trim(), meta: draft.meta.trim() || null, description: draft.description.trim() || null, tags: draft.tags,
      category: draft.tags.includes("work") ? "Work" : "Personal",
      technologies: draft.tech.split(",").map(t => t.trim()).filter(Boolean), live_url: draft.live_url.trim() || null, github_url: draft.github_url.trim() || null,
      accent: draft.accent, image_path: draft.image_path || null, is_featured: draft.is_featured, updated_at: new Date().toISOString(),
    };
    const maxOrder = Math.max(0, ...(items || []).map(p => p.order_index || 0));
    const { error } = draft.id
      ? await supabase.from("projects").update(row).eq("id", draft.id)
      : await supabase.from("projects").insert({ ...row, order_index: maxOrder + 1 });
    setBusy(false);
    if (error) return setMsg({ kind: "err", text: error.message });
    setDraft(null); setMsg({ kind: "ok", text: SAVED_NOTE }); load();
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    setConfirmId(null);
    if (error) setMsg({ kind: "err", text: error.message }); else { setMsg({ kind: "ok", text: "Project deleted." }); load(); }
  };

  // swap order with the neighbour in the visible list
  const move = async (list: Project[], i: number, dir: -1 | 1) => {
    const a = list[i], b = list[i + dir]; if (!a || !b) return;
    await Promise.all([
      supabase.from("projects").update({ order_index: b.order_index }).eq("id", a.id),
      supabase.from("projects").update({ order_index: a.order_index }).eq("id", b.id),
    ]);
    load();
  };

  const toggleSite = async (p: Project) => {
    if (!p.is_featured && !p.tags?.length) { setDraft(toDraft(p)); setMsg({ kind: "err", text: "Add tags first, then switch it on." }); return; }
    const { error } = await supabase.from("projects").update({ is_featured: !p.is_featured }).eq("id", p.id);
    if (error) setMsg({ kind: "err", text: error.message }); else { setMsg({ kind: "ok", text: SAVED_NOTE }); load(); }
  };

  const row = (p: Project, list: Project[], i: number) => (
    <li key={p.id} className="flex flex-wrap items-center gap-4 py-4">
      <Thumb src={p.image_path} ring={p.accent} />
      <div className="min-w-0 flex-1">
        <p className="font-disp text-xl leading-tight">{p.title}</p>
        <p className="mt-1 font-mono text-[.66rem] uppercase tracking-[.14em] text-mute">{p.meta || "—"} · {(p.tags || []).map(t => TAG_LABEL[t] || t).join(" · ") || "no tags"}</p>
      </div>
      <Toggle checked={!!p.is_featured && !!p.tags?.length} onChange={() => toggleSite(p)} label="On site" />
      <div className="flex items-center gap-1">
        <IconBtn label="Move up" onClick={() => move(list, i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></IconBtn>
        <IconBtn label="Move down" onClick={() => move(list, i, 1)} disabled={i === list.length - 1}><ArrowDown className="h-4 w-4" /></IconBtn>
        <IconBtn label="Edit" onClick={() => { setMsg(null); setDraft(toDraft(p)); }}><Pencil className="h-4 w-4" /></IconBtn>
        {confirmId === p.id
          ? <Button variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => remove(p.id)}>Delete?</Button>
          : <IconBtn label="Delete" onClick={() => setConfirmId(p.id)}><Trash2 className="h-4 w-4" /></IconBtn>}
      </div>
    </li>
  );

  return (
    <>
      <PageHeader kicker="Things I built" title="Projects">
        <Button variant="primary" onClick={() => { setMsg(null); setDraft({ ...blank }); }}><Plus className="h-4 w-4" /> New project</Button>
      </PageHeader>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {draft && <Editor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setDraft(null)} busy={busy} />}

      <Card className="mb-5">
        <p className="label">On the website · in this order</p>
        {!items ? <Empty>Loading…</Empty> : site.length === 0 ? <Empty>No projects on the site yet.</Empty> : <ul className="divide-y divide-line">{site.map((p, i) => row(p, site, i))}</ul>}
      </Card>
      <Card>
        <p className="label">Not shown on the website</p>
        {!items ? <Empty>Loading…</Empty> : other.length === 0 ? <Empty>Every project is on the site.</Empty> : <ul className="divide-y divide-line">{other.map((p, i) => row(p, other, i))}</ul>}
      </Card>
    </>
  );
}

function Editor({ draft, setDraft, onSave, onCancel, busy }: { draft: Draft; setDraft: (d: Draft) => void; onSave: () => void; onCancel: () => void; busy: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState("");
  const set = (k: keyof Draft, v: Draft[keyof Draft]) => setDraft({ ...draft, [k]: v });
  const upload = async (f?: File) => {
    if (!f) return; setUploading(true); setUpErr("");
    if (f.size > 2 * 1024 * 1024) { setUploading(false); setUpErr("Please use an image under 2 MB."); return; }
    try { set("image_path", await uploadProjectImage(f)); } catch { setUpErr("Upload failed, please try again."); } finally { setUploading(false); }
  };
  return (
    <Card className="mb-6 border-acc/40">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-disp text-2xl">{draft.id ? "Edit project" : "New project"}</p>
        <Toggle checked={draft.is_featured} onChange={v => set("is_featured", v)} label="Show on website" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><input className="field" value={draft.title} onChange={e => set("title", e.target.value)} placeholder="Insurance CRM" /></Field>
            <Field label="Label above the title"><input className="field" value={draft.meta} onChange={e => set("meta", e.target.value)} placeholder="KTS Finance · 2026" /></Field>
          </div>
          <Field label="Description"><textarea className="field" value={draft.description} onChange={e => set("description", e.target.value)} placeholder="One or two short sentences." /></Field>
          <Field label="Tags (website filters)">
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => {
                const on = draft.tags.includes(t);
                return <button type="button" key={t} onClick={() => set("tags", on ? draft.tags.filter(x => x !== t) : [...draft.tags, t])}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${on ? "border-acc bg-acc/15 text-acc" : "border-line text-mute hover:text-fg"}`}>{TAG_LABEL[t]}</button>;
              })}
            </div>
          </Field>
          <Field label="Tech (comma separated)"><input className="field" value={draft.tech} onChange={e => set("tech", e.target.value)} placeholder="Angular, Ionic, Firebase" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Live link" hint="Shown on the site if set."><input className="field" value={draft.live_url} onChange={e => set("live_url", e.target.value)} placeholder="https://…" /></Field>
            <Field label="GitHub link" hint="Used when there is no live link."><input className="field" value={draft.github_url} onChange={e => set("github_url", e.target.value)} placeholder="https://github.com/…" /></Field>
          </div>
          <Field label="Aura colour">
            <div className="flex flex-wrap items-center gap-2">
              {COLORS.map(c => <button type="button" key={c} aria-label={c} onClick={() => set("accent", c)}
                className={`h-7 w-7 rounded-full border-2 ${draft.accent.toLowerCase() === c.toLowerCase() ? "border-fg" : "border-transparent"}`} style={{ background: c }} />)}
              <input type="color" value={draft.accent} onChange={e => set("accent", e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-line bg-bg" />
              <input className="field !w-28" value={draft.accent} onChange={e => set("accent", e.target.value)} />
            </div>
          </Field>
          <Field label="Image">
            <div className="flex flex-wrap items-center gap-2">
              {SITE_IMAGES.map(src => <button type="button" key={src} onClick={() => set("image_path", src)}
                className={`rounded-xl border-2 ${draft.image_path === src ? "border-acc" : "border-transparent"}`}><Thumb src={src} size={44} /></button>)}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-2 text-xs text-mute hover:text-fg">
                <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
                <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => upload(e.target.files?.[0])} />
              </label>
              {draft.image_path && <button type="button" className="text-xs text-mute hover:text-danger" onClick={() => set("image_path", "")}>Remove</button>}
            </div>
            {upErr && <p className="mt-2 text-xs text-danger">{upErr}</p>}
          </Field>
        </div>

        {/* preview, styled like the details panel on the website */}
        <div>
          <p className="label">Preview</p>
          <div className="rounded-2xl border border-line p-5" style={{ background: `radial-gradient(ellipse at 30% 0%, ${draft.accent}22, transparent 60%), var(--bg)` }}>
            {draft.image_path && <Thumb src={draft.image_path} ring={draft.accent} size={64} />}
            <p className="mt-4 font-mono text-[.62rem] uppercase tracking-[.14em] text-mute">{draft.meta || "Label"}</p>
            <p className="mt-1 font-disp text-2xl leading-tight">{draft.title || "Title"}</p>
            <p className="mt-2 text-sm text-fg/80">{draft.description || "Description"}</p>
            <p className="mt-3 font-mono text-xs text-cool">{draft.tech.split(",").map(t => t.trim()).filter(Boolean).join(" · ") || "Tech"}</p>
            {(draft.live_url || draft.github_url) && <p className="mt-3 text-sm text-acc">{(draft.live_url || draft.github_url).replace(/^https:\/\//, "")} ↗</p>}
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <Button variant="primary" onClick={onSave} disabled={busy || uploading}>{busy ? "Saving…" : "Save"}</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </Card>
  );
}

function Thumb({ src, ring, size = 52 }: { src?: string | null; ring?: string | null; size?: number }) {
  const r = Math.round(size * .28);
  return src
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={siteAsset(src)} alt="" width={size} height={size} className="shrink-0 object-cover" style={{ width: size, height: size, borderRadius: r, boxShadow: ring ? `0 0 0 2px var(--bg), 0 0 0 3.5px ${ring}` : undefined }} />
    : <span className="grid shrink-0 place-items-center bg-panel2 text-xs text-mute" style={{ width: size, height: size, borderRadius: r }}>—</span>;
}

function IconBtn({ label, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button {...p} aria-label={label} title={label} className="rounded-full p-2 text-mute transition hover:bg-panel2 hover:text-fg disabled:opacity-25">{children}</button>;
}
