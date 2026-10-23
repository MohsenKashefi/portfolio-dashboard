"use client";

import { ReactNode } from "react";

export function PageHeader({ kicker, title, children }: { kicker: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="label !mb-2">{kicker}</p>
        <h1 className="font-disp text-4xl md:text-5xl leading-none tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-panel p-5 md:p-6 ${className}`}>{children}</section>;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" };
export function Button({ variant = "ghost", className = "", ...p }: BtnProps) {
  const v = {
    primary: "bg-acc text-bg border-acc hover:brightness-110",
    ghost: "bg-transparent text-fg border-line hover:border-fg/60",
    danger: "bg-transparent text-danger border-danger/40 hover:border-danger",
  }[variant];
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${v} ${className}`}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-mute hover:text-fg"
    >
      <span className={`relative h-5 w-9 rounded-full border transition ${checked ? "border-acc bg-acc/30" : "border-line bg-bg"}`}>
        <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${checked ? "left-[18px] bg-acc" : "left-0.5 bg-mute"}`} />
      </span>
      {label}
    </button>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <Card className="!p-5">
      <p className="label">{label}</p>
      <p className="font-disp text-4xl leading-none tracking-tight">{value}</p>
      {sub && <p className="mt-2 text-xs text-mute">{sub}</p>}
    </Card>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-mute">{children}</p>;
}

export function Notice({ kind = "ok", children }: { kind?: "ok" | "err"; children: ReactNode }) {
  return (
    <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${kind === "ok" ? "border-cool/40 text-cool" : "border-danger/40 text-danger"}`}>
      {children}
    </div>
  );
}

// The public site pre-renders content at deploy time and refreshes it live in the browser,
// so a saved change is visible to visitors on their next page load.
export const SAVED_NOTE = "Saved. Visitors see it on their next page load.";
