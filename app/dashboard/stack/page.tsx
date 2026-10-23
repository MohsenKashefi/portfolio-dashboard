"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, Plus, Trash2, X } from "lucide-react";
import { supabase, LAYERS, type Skill } from "@/lib/supabase";
import { Button, Card, Empty, Notice, PageHeader, SAVED_NOTE } from "@/components/ui";

export default function StackPage() {
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [adding, setAdding] = useState<Record<string, string>>({});
  const [newLayer, setNewLayer] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("skills").select("id,name,category,order_index,is_visible").order("order_index", { ascending: true });
    if (error) setMsg({ kind: "err", text: error.message }); else setSkills(data as Skill[]);
  };
  useEffect(() => { load(); }, []);

  // visible skills grouped into layers, in website order
  const layers = useMemo(() => {
    const m = new Map<string, Skill[]>();
    (skills || []).filter(s => s.is_visible).forEach(s => { const k = s.category || "Other"; if (!m.has(k)) m.set(k, []); m.get(k)!.push(s); });
    return [...m];
  }, [skills]);
  const hidden = (skills || []).filter(s => !s.is_visible);
  const done = (error: { message: string } | null, text = SAVED_NOTE) => { if (error) setMsg({ kind: "err", text: error.message }); else { setMsg({ kind: "ok", text }); load(); } };

  // write a whole new order for the visible skills (small table, so a few updates is fine)
  const renumber = async (ordered: Skill[]) => {
    const res = await Promise.all(ordered.map((s, i) => supabase.from("skills").update({ order_index: 100 + i }).eq("id", s.id)));
    done(res.find(r => r.error)?.error ?? null);
  };
  const flat = (ls: [string, Skill[]][]) => ls.flatMap(([, xs]) => xs);

  const moveTech = (li: number, ti: number, dir: -1 | 1) => {
    const ls = layers.map(([k, xs]) => [k, [...xs]] as [string, Skill[]]); const xs = ls[li][1];
    if (!xs[ti + dir]) return; [xs[ti], xs[ti + dir]] = [xs[ti + dir], xs[ti]]; renumber(flat(ls));
  };
  const moveLayer = (li: number, dir: -1 | 1) => {
    const ls = [...layers]; if (!ls[li + dir]) return; [ls[li], ls[li + dir]] = [ls[li + dir], ls[li]]; renumber(flat(ls));
  };
  const add = (layer: string) => { const name = (adding[layer] || "").trim(); if (name) { setAdding({ ...adding, [layer]: "" }); addTo(layer, name); } };
  const addTo = async (layer: string, name: string) => {
    const max = Math.max(100, ...(skills || []).map(s => s.order_index || 0));
    // name is unique: re-use a hidden row with the same name instead of failing
    const { error } = await supabase.from("skills").upsert({ name, category: layer, is_visible: true, order_index: max + 1 }, { onConflict: "name" });
    done(error);
  };
  const hide = async (s: Skill) => done((await supabase.from("skills").update({ is_visible: false }).eq("id", s.id)).error, "Removed from the website (kept under Hidden).");
  const show = async (s: Skill) => {
    const max = Math.max(100, ...(skills || []).map(x => x.order_index || 0));
    done((await supabase.from("skills").update({ is_visible: true, order_index: max + 1, category: s.category && layers.some(([k]) => k === s.category) ? s.category : layers[0]?.[0] || "AI" }).eq("id", s.id)).error);
  };
  const del = async (s: Skill) => { setConfirmId(null); done((await supabase.from("skills").delete().eq("id", s.id)).error, "Deleted."); };

  return (
    <>
      <PageHeader kicker="Full-stack, literally" title="Stack" />
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {!skills ? <Empty>Loading…</Empty> : (
        <div className="grid gap-4">
          {layers.map(([layer, xs], li) => (
            <Card key={layer}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-disp text-2xl">{layer}</p>
                <div className="flex items-center gap-1">
                  <Icon label="Layer up" onClick={() => moveLayer(li, -1)} disabled={li === 0}><ArrowUp className="h-4 w-4" /></Icon>
                  <Icon label="Layer down" onClick={() => moveLayer(li, 1)} disabled={li === layers.length - 1}><ArrowDown className="h-4 w-4" /></Icon>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2">
                {xs.map((s, ti) => (
                  <li key={s.id} className="group flex items-center gap-1 rounded-full border border-line bg-bg py-1 pl-3 pr-1 font-mono text-xs">
                    {s.name}
                    <Icon label="Earlier" onClick={() => moveTech(li, ti, -1)} disabled={ti === 0}><ArrowLeft className="h-3 w-3" /></Icon>
                    <Icon label="Later" onClick={() => moveTech(li, ti, 1)} disabled={ti === xs.length - 1}><ArrowRight className="h-3 w-3" /></Icon>
                    <Icon label="Remove from website" onClick={() => hide(s)}><X className="h-3 w-3" /></Icon>
                  </li>
                ))}
              </ul>
              <form className="mt-4 flex gap-2" onSubmit={e => { e.preventDefault(); add(layer); }}>
                <input className="field !w-56" placeholder={`Add to ${layer}…`} value={adding[layer] || ""} onChange={e => setAdding({ ...adding, [layer]: e.target.value })} />
                <Button type="submit"><Plus className="h-4 w-4" /> Add</Button>
              </form>
              <p className="mt-3 font-mono text-xs text-mute">On the site: {xs.map(s => s.name).join(" · ")}</p>
            </Card>
          ))}

          <Card>
            <p className="label">New layer</p>
            <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); const l = newLayer.trim(), t = (adding.__new || "").trim(); if (l && t) { setAdding({ ...adding, [l]: t, __new: "" }); setNewLayer(""); addTo(l, t); } }}>
              <input className="field !w-48" list="layer-names" placeholder="Layer, e.g. Cloud" value={newLayer} onChange={e => setNewLayer(e.target.value)} />
              <datalist id="layer-names">{LAYERS.map(l => <option key={l} value={l} />)}</datalist>
              <input className="field !w-48" placeholder="First tech, e.g. AWS" value={adding.__new || ""} onChange={e => setAdding({ ...adding, __new: e.target.value })} />
              <Button type="submit"><Plus className="h-4 w-4" /> Create</Button>
            </form>
          </Card>

          <Card>
            <p className="label">Hidden (not on the website)</p>
            {hidden.length === 0 ? <Empty>Nothing hidden.</Empty> : (
              <ul className="flex flex-wrap gap-2">
                {hidden.map(s => (
                  <li key={s.id} className="flex items-center gap-1 rounded-full border border-line py-1 pl-3 pr-1 font-mono text-xs text-mute">
                    {s.name}
                    <Icon label="Show on website" onClick={() => show(s)}><Eye className="h-3 w-3" /></Icon>
                    {confirmId === s.id
                      ? <button onClick={() => del(s)} className="rounded-full px-2 text-danger">delete?</button>
                      : <Icon label="Delete" onClick={() => setConfirmId(s.id)}><Trash2 className="h-3 w-3" /></Icon>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

function Icon({ label, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button type="button" {...p} aria-label={label} title={label} className="rounded-full p-1.5 text-mute transition hover:bg-panel2 hover:text-fg disabled:opacity-20">{children}</button>;
}
