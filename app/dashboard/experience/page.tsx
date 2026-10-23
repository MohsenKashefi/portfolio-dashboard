"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase, LANES, type Experience } from "@/lib/supabase";
import { Button, Card, Empty, Field, Notice, PageHeader, SAVED_NOTE, Toggle } from "@/components/ui";

const LANE_COLOR = ["#F3A847", "#72C6BE", "#B9C7C4", "#E3957E"];
const S0 = 2015;
const ym = (d: string) => { const [y, m] = d.slice(0, 7).split("-").map(Number); return (y - S0) * 12 + m - 1; };
const nowIdx = () => { const d = new Date(); return (d.getFullYear() - S0) * 12 + d.getMonth() + 1; };

type Draft = { id?: number; kind: "clip" | "marker"; lane: number; title: string; role: string; period_label: string; start: string; end: string; now: boolean; color: string; hollow: boolean; bullets: string };
const blank: Draft = { kind: "clip", lane: 0, title: "", role: "", period_label: "", start: "", end: "", now: false, color: LANE_COLOR[0], hollow: false, bullets: "" };
const toDraft = (e: Experience): Draft => ({ id: e.id, kind: e.kind, lane: e.lane, title: e.title, role: e.role || "", period_label: e.period_label || "",
  start: e.start_month.slice(0, 7), end: e.end_month ? e.end_month.slice(0, 7) : "", now: !e.end_month && e.kind === "clip", color: e.color || LANE_COLOR[e.lane] || "#86A09E", hollow: e.hollow, bullets: (e.bullets || []).join("\n") });

export default function ExperiencePage() {
  const [items, setItems] = useState<Experience[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("experience").select("*").order("order_index", { ascending: true });
    if (error) setMsg({ kind: "err", text: error.message }); else setItems(data as Experience[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) return setMsg({ kind: "err", text: "Add a title." });
    if (!/^\d{4}-\d{2}$/.test(draft.start)) return setMsg({ kind: "err", text: "Pick a start month." });
    if (draft.kind === "clip" && !draft.now && !/^\d{4}-\d{2}$/.test(draft.end)) return setMsg({ kind: "err", text: "Pick an end month, or switch on “Still ongoing”." });
    if (draft.kind === "clip" && !draft.now && draft.end < draft.start) return setMsg({ kind: "err", text: "The end month is before the start month." });
    if (+draft.start.slice(0, 4) < S0) return setMsg({ kind: "err", text: `The timeline starts in ${S0}.` });
    setBusy(true);
    const row = {
      kind: draft.kind, lane: draft.lane, title: draft.title.trim(), role: draft.role.trim() || null, period_label: draft.period_label.trim() || null,
      start_month: `${draft.start}-01`, end_month: draft.kind === "marker" || draft.now ? null : `${draft.end}-01`,
      color: draft.hollow ? null : draft.color, hollow: draft.hollow, bullets: draft.bullets.split("\n").map(s => s.trim()).filter(Boolean), updated_at: new Date().toISOString(),
    };
    const max = Math.max(0, ...(items || []).map(i => i.order_index));
    const { error } = draft.id ? await supabase.from("experience").update(row).eq("id", draft.id) : await supabase.from("experience").insert({ ...row, order_index: max + 1 });
    setBusy(false);
    if (error) return setMsg({ kind: "err", text: error.message });
    setDraft(null); setMsg({ kind: "ok", text: SAVED_NOTE }); load();
  };
  const remove = async (id: number) => {
    setConfirmId(null);
    const { error } = await supabase.from("experience").delete().eq("id", id);
    if (error) setMsg({ kind: "err", text: error.message }); else { setMsg({ kind: "ok", text: "Deleted." }); load(); }
  };

  const clips = (items || []).filter(i => i.kind === "clip");
  const marker = (items || []).find(i => i.kind === "marker");

  return (
    <>
      <PageHeader kicker="The session" title="Experience">
        <Button variant="primary" onClick={() => { setMsg(null); setDraft({ ...blank }); }}><Plus className="h-4 w-4" /> New role</Button>
      </PageHeader>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {items && <Timeline items={items} />}
      {draft && <Editor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setDraft(null)} busy={busy} />}

      {!items ? <Empty>Loading…</Empty> : (
        <div className="grid gap-5">
          {LANES.map((lane, l) => {
            const xs = clips.filter(c => c.lane === l).sort((a, b) => b.start_month.localeCompare(a.start_month));
            return (
              <Card key={lane}>
                <p className="label">{lane}</p>
                {xs.length === 0 ? <Empty>Nothing in this lane.</Empty> : (
                  <ul className="divide-y divide-line">
                    {xs.map(c => (
                      <li key={c.id} className="flex flex-wrap items-center gap-4 py-3">
                        <span className={`h-3 w-3 shrink-0 rounded-full ${c.hollow ? "border border-dashed border-mute" : ""}`} style={c.hollow ? undefined : { background: c.color || "#86A09E" }} />
                        <div className="min-w-0 flex-1">
                          <p className="font-disp text-lg leading-tight">{c.title} <span className="font-sans text-sm text-mute">· {c.role}</span></p>
                          <p className="font-mono text-xs text-mute">{c.period_label}</p>
                        </div>
                        <Row onEdit={() => { setMsg(null); setDraft(toDraft(c)); }} confirming={confirmId === c.id} onAsk={() => setConfirmId(c.id)} onDelete={() => remove(c.id)} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
          <Card>
            <p className="label">Marker on the timeline</p>
            {marker ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="h-3 w-3 rotate-45 bg-acc" />
                <div className="flex-1"><p className="font-disp text-lg">{marker.title}</p><p className="font-mono text-xs text-mute">{marker.role} · {marker.period_label}</p></div>
                <Row onEdit={() => { setMsg(null); setDraft(toDraft(marker)); }} confirming={confirmId === marker.id} onAsk={() => setConfirmId(marker.id)} onDelete={() => remove(marker.id)} />
              </div>
            ) : <Button onClick={() => setDraft({ ...blank, kind: "marker" })}>Add the “first code” marker</Button>}
          </Card>
        </div>
      )}
    </>
  );
}

function Row({ onEdit, onAsk, onDelete, confirming }: { onEdit: () => void; onAsk: () => void; onDelete: () => void; confirming: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button aria-label="Edit" title="Edit" onClick={onEdit} className="rounded-full p-2 text-mute hover:bg-panel2 hover:text-fg"><Pencil className="h-4 w-4" /></button>
      {confirming
        ? <Button variant="danger" className="!px-3 !py-1.5 text-xs" onClick={onDelete}>Delete?</Button>
        : <button aria-label="Delete" title="Delete" onClick={onAsk} className="rounded-full p-2 text-mute hover:bg-panel2 hover:text-danger"><Trash2 className="h-4 w-4" /></button>}
    </div>
  );
}

// the same layout as the website's timeline: years across, four lanes down
function Timeline({ items }: { items: Experience[] }) {
  const end = Math.max(nowIdx(), ...items.map(i => i.end_month ? ym(i.end_month) : 0));
  const pct = (v: number) => `${v / end * 100}%`;
  const years = useMemo(() => Array.from({ length: Math.floor(end / 12) + 1 }, (_, i) => S0 + i), [end]);
  const marker = items.find(i => i.kind === "marker");
  return (
    <Card className="mb-6 overflow-x-auto !p-0">
      <div className="relative min-w-[760px] pb-2">
        <div className="ml-28 flex h-8 border-b border-line">
          {years.map(y => <span key={y} className="absolute top-2 font-mono text-[.62rem] text-mute" style={{ left: `calc(7rem + (100% - 7rem) * ${(y - S0) * 12 / end})` }}>{y}</span>)}
        </div>
        {LANES.map((lane, l) => (
          <div key={lane} className="relative flex h-11 items-center border-b border-line/60">
            <span className="w-28 shrink-0 pl-4 font-mono text-[.58rem] uppercase tracking-wider text-mute">{lane}</span>
            <div className="relative h-full flex-1">
              {items.filter(i => i.kind === "clip" && i.lane === l).map(c => {
                const s = ym(c.start_month), e = c.end_month ? ym(c.end_month) : end;
                return <span key={c.id} title={`${c.title} · ${c.period_label}`}
                  className={`absolute top-2 h-7 truncate rounded-md px-1.5 font-mono text-[.6rem] leading-7 ${c.hollow ? "border border-dashed border-mute text-mute" : "text-bg"}`}
                  style={{ left: pct(s), width: `calc(${pct(e - s)} - 3px)`, background: c.hollow ? undefined : c.color || "#86A09E" }}>{c.title}</span>;
              })}
            </div>
          </div>
        ))}
        {marker && <span className="absolute bottom-2 top-8 border-l border-dashed border-acc" style={{ left: `calc(7rem + (100% - 7rem) * ${ym(marker.start_month) / end})` }} title={marker.title} />}
      </div>
    </Card>
  );
}

function Editor({ draft, setDraft, onSave, onCancel, busy }: { draft: Draft; setDraft: (d: Draft) => void; onSave: () => void; onCancel: () => void; busy: boolean }) {
  const set = (k: keyof Draft, v: Draft[keyof Draft]) => setDraft({ ...draft, [k]: v });
  const isMarker = draft.kind === "marker";
  return (
    <Card className="mb-6 border-acc/40">
      <p className="mb-5 font-disp text-2xl">{draft.id ? "Edit" : "New"} {isMarker ? "marker" : "role"}</p>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Title"><input className="field" value={draft.title} onChange={e => set("title", e.target.value)} placeholder={isMarker ? "First line of code" : "KTS Finance"} /></Field>
          <Field label={isMarker ? "Detail" : "Role"} hint={isMarker ? "Its first part is shown on the marker, e.g. “Java”." : undefined}>
            <input className="field" value={draft.role} onChange={e => set("role", e.target.value)} placeholder={isMarker ? "Java · High school" : "Full-Stack Developer"} /></Field>
          <Field label="Period (as shown)"><input className="field" value={draft.period_label} onChange={e => set("period_label", e.target.value)} placeholder="Jan 2026 – now · Brescia" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {!isMarker && (
            <Field label="Lane">
              <select className="field" value={draft.lane} onChange={e => { const l = +e.target.value; setDraft({ ...draft, lane: l, color: LANE_COLOR[l] }); }}>
                {LANES.map((n, i) => <option key={n} value={i}>{n}</option>)}
              </select>
            </Field>
          )}
          <Field label={isMarker ? "Month" : "Start"}><input className="field" type="month" min="2015-01" value={draft.start} onChange={e => set("start", e.target.value)} /></Field>
          {!isMarker && (
            <Field label="End">
              <input className="field" type="month" min={draft.start || "2015-01"} disabled={draft.now} value={draft.now ? "" : draft.end} onChange={e => set("end", e.target.value)} />
              <span className="mt-2 block"><Toggle checked={draft.now} onChange={v => set("now", v)} label="Still ongoing" /></span>
            </Field>
          )}
        </div>
        {!isMarker && (
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-2">
              {LANE_COLOR.map(c => <button type="button" key={c} aria-label={c} onClick={() => set("color", c)} className={`h-6 w-6 rounded-full border-2 ${draft.color === c ? "border-fg" : "border-transparent"}`} style={{ background: c }} />)}
              <input type="color" value={draft.color} onChange={e => set("color", e.target.value)} className="h-7 w-9 cursor-pointer rounded border border-line bg-bg" />
            </span>
            <Toggle checked={draft.hollow} onChange={v => set("hollow", v)} label="Dashed (a break, like Relocation)" />
          </div>
        )}
        <Field label="Bullet points (one per line)"><textarea className="field" rows={4} value={draft.bullets} onChange={e => set("bullets", e.target.value)} /></Field>
      </div>
      <div className="mt-6 flex gap-2">
        <Button variant="primary" onClick={onSave} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </Card>
  );
}
