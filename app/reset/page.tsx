"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Landing page for the "Reset your password" email: the link signs you in for this one step,
// then you choose a new password here.
export default function ResetPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    // a link that is expired or already used comes back with an error in the address
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("error")) setMsg({ kind: "err", text: "This reset link has expired or was already used. Ask for a new one." });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 10) return setMsg({ kind: "err", text: "Use at least 10 characters." });
    if (pw !== pw2) return setMsg({ kind: "err", text: "The two passwords don't match." });
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ kind: "err", text: error.message });
    setMsg({ kind: "ok", text: "Password changed. Opening your dashboard…" });
    setTimeout(() => router.replace("/dashboard"), 1200);
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-disp text-center text-5xl leading-none tracking-tight">Mohsen</h1>
        <p className="mt-3 text-center text-sm text-mute">Choose a new password</p>
        <form onSubmit={submit} className="mt-10 grid gap-4 rounded-2xl border border-line bg-panel p-6">
          {!ready && !msg && <p className="text-sm text-mute">Checking your reset link…</p>}
          <label className="block">
            <span className="label">New password</span>
            <input className="field" type="password" autoComplete="new-password" minLength={10} required disabled={!ready} value={pw} onChange={e => setPw(e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Repeat it</span>
            <input className="field" type="password" autoComplete="new-password" minLength={10} required disabled={!ready} value={pw2} onChange={e => setPw2(e.target.value)} />
          </label>
          {msg && <p className={`text-sm ${msg.kind === "ok" ? "text-cool" : "text-danger"}`}>{msg.text}</p>}
          <button disabled={!ready || busy} className="mt-2 rounded-full bg-acc px-4 py-3 font-mono text-xs uppercase tracking-[.25em] text-bg transition hover:brightness-110 disabled:opacity-40">
            {busy ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </main>
  );
}
