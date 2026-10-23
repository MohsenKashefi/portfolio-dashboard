"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // already signed in → straight to the dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace("/dashboard"); });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setError("Wrong email or password."); return; }
    router.replace("/dashboard");
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,#16262a,transparent_70%)]" />
      <div className="relative w-full max-w-sm">
        <p className="label text-center !mb-3">Software Engineer · Artist</p>
        <h1 className="font-disp text-center text-6xl leading-none tracking-tight">Mohsen</h1>
        <p className="mt-3 text-center text-sm text-mute">Dashboard</p>

        <form onSubmit={submit} className="mt-10 grid gap-4 rounded-2xl border border-line bg-panel/80 p-6 backdrop-blur">
          <label className="block">
            <span className="label">Email</span>
            <input className="field" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="field" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button disabled={busy} className="mt-2 rounded-full bg-acc px-4 py-3 font-mono text-xs uppercase tracking-[.25em] text-bg transition hover:brightness-110 disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-mute">
          <a className="hover:text-fg" href="https://mohsenkashefi.live" target="_blank" rel="noopener">mohsenkashefi.live ↗</a>
        </p>
      </div>
    </main>
  );
}
