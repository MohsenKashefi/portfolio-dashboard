"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Mail, Trash2 } from "lucide-react";
import { supabase, type Message } from "@/lib/supabase";
import { Button, Card, Empty, Notice, PageHeader } from "@/components/ui";

const FILTERS = ["all", "unread", "read", "replied"] as const;

export default function MessagesPage() {
  const [items, setItems] = useState<Message[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [open, setOpen] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [err, setErr] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("messages").select("id,name,email,subject,message,status,created_at").order("created_at", { ascending: false });
    if (error) setErr(error.message); else setItems(data as Message[]);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (m: Message, status: Message["status"]) => {
    const { error } = await supabase.from("messages").update({ status }).eq("id", m.id);
    if (error) setErr(error.message); else setItems(items!.map(x => x.id === m.id ? { ...x, status } : x));
  };
  const remove = async (id: number) => {
    setConfirmId(null);
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) setErr(error.message); else setItems(items!.filter(x => x.id !== id));
  };
  const toggle = (m: Message) => { setOpen(open === m.id ? null : m.id); if (m.status === "unread") setStatus(m, "read"); };

  const shown = (items || []).filter(m => filter === "all" || m.status === filter);
  const unread = (items || []).filter(m => m.status === "unread").length;

  return (
    <>
      <PageHeader kicker={unread ? `${unread} unread` : "Inbox"} title="Messages">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${filter === f ? "border-acc text-acc" : "border-line text-mute hover:text-fg"}`}>{f}</button>
        ))}
      </PageHeader>
      {err && <Notice kind="err">{err}</Notice>}
      <Card>
        {!items ? <Empty>Loading…</Empty> : shown.length === 0 ? <Empty>No messages{filter !== "all" ? ` marked ${filter}` : ""}.</Empty> : (
          <ul className="divide-y divide-line">
            {shown.map(m => (
              <li key={m.id} className="py-4">
                <button onClick={() => toggle(m)} className="flex w-full flex-wrap items-baseline gap-x-4 gap-y-1 text-left">
                  <span className={`h-2 w-2 shrink-0 self-center rounded-full ${m.status === "unread" ? "bg-acc" : m.status === "replied" ? "bg-cool" : "bg-line"}`} />
                  <span className={`w-44 truncate ${m.status === "unread" ? "font-medium" : ""}`}>{m.name}</span>
                  <span className="min-w-0 flex-1 truncate text-mute">{m.subject || m.message}</span>
                  <span className="font-mono text-xs text-mute">{format(new Date(m.created_at), "d MMM yyyy, HH:mm")}</span>
                </button>
                {open === m.id && (
                  <div className="mt-4 rounded-xl border border-line bg-bg p-4">
                    <p className="text-sm text-mute">{m.email}</p>
                    {m.subject && <p className="mt-2 font-medium">{m.subject}</p>}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent("Re: " + (m.subject || "your message"))}`} onClick={() => setStatus(m, "replied")}
                        className="inline-flex items-center gap-2 rounded-full bg-acc px-4 py-2 text-sm text-bg"><Mail className="h-4 w-4" /> Reply by email</a>
                      {m.status !== "unread" && <Button onClick={() => setStatus(m, "unread")}>Mark unread</Button>}
                      {confirmId === m.id
                        ? <Button variant="danger" onClick={() => remove(m.id)}>Delete for good?</Button>
                        : <Button variant="danger" onClick={() => setConfirmId(m.id)}><Trash2 className="h-4 w-4" /> Delete</Button>}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
