"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, startOfDay, subDays } from "date-fns";
import { supabase, type PageView } from "@/lib/supabase";
import { Card, Empty, PageHeader, Stat } from "@/components/ui";

const RANGES = [7, 30, 90] as const;

// the website's sections, in the order a visitor scrolls through them
const SECTIONS: [string, string][] = [
  ["/home", "Opened the site"], ["/work", "Portfolio"], ["/stack", "Stack"], ["/experience", "Experience"],
  ["/contact", "Let's Talk"], ["/artist", "Artist side"], ["/artist/music", "Music"], ["/artist/photos", "Photos"], ["/artist/contact", "Artist contact"],
];

// "IT" → "🇮🇹 Italy"; visits recorded before location tracking have no country
const countryName = (code: string | null) => {
  if (!code) return "Unknown";
  let name = code; try { name = new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code; } catch {}
  const flag = /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map(c => 0x1f1a5 + c.charCodeAt(0))) : "";
  return `${flag} ${name}`.trim();
};
const placeOf = (v: PageView) => v.city ? `${v.city}${v.country ? `, ${countryName(v.country).replace(/^\S+\s/, "")}` : ""}` : v.country ? countryName(v.country) : "Unknown";

const hostOf = (r: string | null) => {
  if (!r) return "Direct";
  try { const h = new URL(r).hostname.replace(/^www\./, ""); return h.includes("google.") ? "Google" : h.includes("linkedin") || h === "lnkd.in" ? "LinkedIn" : h.includes("github") ? "GitHub" : h.includes("soundcloud") ? "SoundCloud" : h; }
  catch { return "Other"; }
};

// page_views can be larger than one request (1000 rows), so read it in pages
async function fetchSince(since: Date) {
  const rows: PageView[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("page_views")
      .select("id,page_path,session_id,device_type,referrer,country,region,city,created_at")
      .gte("created_at", since.toISOString()).order("created_at", { ascending: true }).range(from, from + 999);
    if (error) throw error;
    rows.push(...(data as PageView[]));
    if (!data || data.length < 1000 || rows.length > 50000) break;
  }
  return rows;
}

export default function VisitorsPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [rows, setRows] = useState<PageView[] | null>(null);
  const [allTime, setAllTime] = useState<number | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setRows(null); setErr("");
    fetchSince(startOfDay(subDays(new Date(), days - 1))).then(setRows).catch(e => setErr(e.message || "Could not load visits"));
  }, [days]);
  useEffect(() => {
    supabase.from("page_views").select("id", { count: "exact", head: true }).then(({ count }) => setAllTime(count ?? 0));
  }, []);

  const s = useMemo(() => {
    if (!rows) return null;
    const sessionOf = (r: PageView) => r.session_id || `row-${r.id}`;
    const today = format(new Date(), "yyyy-MM-dd");
    const byDay = new Map<string, { views: number; visitors: Set<string> }>();
    for (let i = days - 1; i >= 0; i--) byDay.set(format(subDays(new Date(), i), "yyyy-MM-dd"), { views: 0, visitors: new Set() });
    const sessions = new Map<string, { first: PageView; paths: Set<string>; last: string }>();
    for (const r of rows) {
      const d = format(new Date(r.created_at), "yyyy-MM-dd"), sid = sessionOf(r);
      const b = byDay.get(d); if (b) { b.views++; b.visitors.add(sid); }
      const ss = sessions.get(sid);
      if (!ss) sessions.set(sid, { first: r, paths: new Set([r.page_path]), last: r.created_at });
      else { ss.paths.add(r.page_path); ss.last = r.created_at; }
    }
    const visits = [...sessions.values()];
    const count = (f: (v: (typeof visits)[number]) => string) => {
      const m = new Map<string, number>(); visits.forEach(v => { const k = f(v); m.set(k, (m.get(k) || 0) + 1); });
      return [...m].sort((a, b) => b[1] - a[1]);
    };
    return {
      chart: [...byDay].map(([d, v]) => ({ day: format(new Date(d), "d MMM"), views: v.views, visitors: v.visitors.size })),
      views: rows.length,
      visitors: sessions.size,
      today: byDay.get(today)?.visitors.size ?? 0,
      perVisit: sessions.size ? rows.length / sessions.size : 0,
      devices: count(v => v.first.device_type || "unknown"),
      sources: count(v => hostOf(v.first.referrer)).slice(0, 8),
      cities: count(v => placeOf(v.first)).slice(0, 10),
      countries: count(v => countryName(v.first.country)).slice(0, 8),
      located: visits.filter(v => v.first.city || v.first.country).length,
      reach: SECTIONS.map(([p, label]) => [label, visits.filter(v => v.paths.has(p) || (p === "/home" && v.paths.size > 0)).length] as [string, number]),
      recent: visits.sort((a, b) => b.last.localeCompare(a.last)).slice(0, 12),
    };
  }, [rows, days]);

  return (
    <>
      <PageHeader kicker="mohsenkashefi.live" title={<>Visitors</>}>
        {/* the flag lives in the website's own storage, so it is set by opening the site once on each device */}
        <a href="https://mohsenkashefi.live/?me" target="_blank" rel="noopener" title="Open this on each of your devices (Mac, laptop, phone) once"
          className="mr-2 rounded-full border border-line px-3 py-1.5 text-xs text-mute transition hover:border-acc hover:text-acc">Don’t count this device ↗</a>
        {RANGES.map(r => (
          <button key={r} onClick={() => setDays(r)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${days === r ? "border-acc text-acc" : "border-line text-mute hover:text-fg"}`}>
            {r} days
          </button>
        ))}
      </PageHeader>

      {err && <Card><p className="text-sm text-danger">{err}</p></Card>}
      {!s && !err && <Empty>Loading visits…</Empty>}

      {s && (
        <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Visitors today" value={s.today} />
            <Stat label={`Visitors · ${days} days`} value={s.visitors} sub={`${s.views} page and section views`} />
            <Stat label="Sections per visit" value={s.perVisit.toFixed(1)} sub="how far people scroll" />
            <Stat label="All-time views" value={allTime ?? "…"} sub="since tracking began" />
          </div>

          <Card>
            <p className="label">Daily visitors and views</p>
            {s.views === 0 ? <Empty>No visits in this period yet.</Empty> : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.chart} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3A847" stopOpacity={.35} /><stop offset="1" stopColor="#F3A847" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#72C6BE" stopOpacity={.25} /><stop offset="1" stopColor="#72C6BE" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1F3337" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#86A09E", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis allowDecimals={false} tick={{ fill: "#86A09E", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#0F1B1E", border: "1px solid #1F3337", borderRadius: 10, color: "#F2EEE6" }} labelStyle={{ color: "#86A09E" }} />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#72C6BE" fill="url(#gw)" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#F3A847" fill="url(#gv)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <p className="label">Where they are · cities</p>
              {s.located === 0 ? <Empty>Locations appear for new visits from now on.</Empty> : <Bars rows={s.cities.filter(([k]) => k !== "Unknown")} total={s.located} accent="#B57BFF" />}
            </Card>
            <Card>
              <p className="label">Where they are · countries</p>
              {s.located === 0 ? <Empty>Locations appear for new visits from now on.</Empty> : <Bars rows={s.countries.filter(([k]) => k !== "Unknown")} total={s.located} accent="#B57BFF" />}
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card><p className="label">Where they come from</p><Bars rows={s.sources} total={s.visitors} /></Card>
            <Card><p className="label">Devices</p><Bars rows={s.devices} total={s.visitors} /></Card>
            <Card><p className="label">How far they get</p><Bars rows={s.reach} total={s.visitors} accent="#72C6BE" /></Card>
          </div>

          <Card>
            <p className="label">Recent visits</p>
            {s.recent.length === 0 ? <Empty>No visits yet.</Empty> : (
              <ul className="divide-y divide-line">
                {s.recent.map(v => (
                  <li key={v.first.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                    <span className="w-36 text-mute">{format(new Date(v.last), "d MMM, HH:mm")}</span>
                    <span className="w-20 capitalize">{v.first.device_type || "—"}</span>
                    <span className="w-44 truncate" title={[v.first.city, v.first.region, v.first.country].filter(Boolean).join(", ")}>{placeOf(v.first)}</span>
                    <span className="w-24 text-mute">{hostOf(v.first.referrer)}</span>
                    <span className="flex-1 text-xs text-cool">{[...v.paths].map(p => SECTIONS.find(x => x[0] === p)?.[1] || p).join(" → ")}</span>
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

function Bars({ rows, total, accent = "#F3A847" }: { rows: [string, number][]; total: number; accent?: string }) {
  if (!rows.length || !total) return <Empty>Nothing yet.</Empty>;
  return (
    <ul className="grid gap-3">
      {rows.map(([k, n]) => (
        <li key={k}>
          <div className="mb-1 flex justify-between text-sm"><span className="capitalize">{k}</span><span className="text-mute">{n} · {Math.round(n / total * 100)}%</span></div>
          <div className="h-1.5 rounded-full bg-bg"><div className="h-full rounded-full" style={{ width: `${Math.max(2, n / total * 100)}%`, background: accent }} /></div>
        </li>
      ))}
    </ul>
  );
}
