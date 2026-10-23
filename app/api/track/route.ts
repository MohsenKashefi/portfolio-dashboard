// Visit tracking for mohsenkashefi.live.
// Vercel adds the visitor's approximate location (city, region, country) as request headers;
// only those are stored, never the IP address. The row is written with the public key, so this
// endpoint can do nothing more than any visitor can: insert one page_views row (RLS).
export const runtime = "edge";

const ALLOWED = new Set(["https://mohsenkashefi.live", "https://www.mohsenkashefi.live"]);
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED.has(origin) ? origin : "https://mohsenkashefi.live",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const clip = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : null);
const geo = (h: Headers, k: string) => { const v = h.get(k); if (!v) return null; try { return decodeURIComponent(v).slice(0, 80); } catch { return v.slice(0, 80); } };

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req.headers.get("origin")) });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const headers = cors(origin);
  if (!origin || !ALLOWED.has(origin)) return new Response("forbidden", { status: 403, headers });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return new Response("bad request", { status: 400, headers }); }
  const page = clip(b.page_path, 100);
  if (!page || !/^\/[a-z0-9/_-]*$/.test(page)) return new Response("bad request", { status: 400, headers });
  const device = ["mobile", "tablet", "desktop"].includes(b.device_type as string) ? (b.device_type as string) : null;

  const row = {
    page_path: page,
    session_id: clip(b.session_id, 64),
    device_type: device,
    referrer: clip(b.referrer, 300),
    user_agent: clip(req.headers.get("user-agent"), 400),
    country: geo(req.headers, "x-vercel-ip-country"),
    region: geo(req.headers, "x-vercel-ip-country-region"),
    city: geo(req.headers, "x-vercel-ip-city"),
  };

  const r = await fetch(`${SB_URL}/rest/v1/page_views`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  return new Response(null, { status: r.ok ? 204 : 502, headers });
}
