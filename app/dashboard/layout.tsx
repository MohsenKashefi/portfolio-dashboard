"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, FolderOpen, Layers, Clock3, MessageSquare, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { supabase, SITE_URL } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard", label: "Visitors", icon: BarChart3 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/stack", label: "Stack", icon: Layers },
  { href: "/dashboard/experience", label: "Experience", icon: Clock3 },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
];

// Every dashboard page sits behind this gate: no session → back to sign-in.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/");
      else setEmail(data.session.user.email ?? "");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (!session) router.replace("/"); });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => setOpen(false), [path]);

  if (email === null) {
    return <div className="grid min-h-screen place-items-center text-sm text-mute">Checking sign-in…</div>;
  }

  const signOut = async () => { await supabase.auth.signOut(); router.replace("/"); };

  const nav = (
    <nav className="grid gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const on = href === "/dashboard" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${on ? "bg-panel2 text-fg" : "text-mute hover:text-fg"}`}>
            <Icon className={`h-4 w-4 ${on ? "text-acc" : ""}`} /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      {/* sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line p-5 md:flex">
        <Link href="/dashboard" className="font-disp text-3xl tracking-tight">Mohsen</Link>
        <p className="label mt-1">Dashboard</p>
        <div className="mt-8 flex-1">{nav}</div>
        <a href={SITE_URL} target="_blank" rel="noopener" className="mb-3 flex items-center gap-2 text-sm text-mute hover:text-fg">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
        <p className="truncate text-xs text-mute" title={email}>{email}</p>
        <button onClick={signOut} className="mt-2 flex items-center gap-2 text-sm text-mute hover:text-danger">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      {/* top bar (mobile) */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="font-disp text-2xl">Mohsen</Link>
        <button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="p-1">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="sticky top-[53px] z-10 border-b border-line bg-bg p-4 md:hidden">
          {nav}
          <div className="mt-4 flex items-center justify-between text-sm">
            <a href={SITE_URL} target="_blank" rel="noopener" className="text-mute">View website ↗</a>
            <button onClick={signOut} className="text-mute">Sign out</button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-10 md:py-12">{children}</main>
    </div>
  );
}
