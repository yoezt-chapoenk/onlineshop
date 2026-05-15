import { getAdminClient } from "@/lib/supabase/admin";
import ContactMessagesClient, { type Message } from "./ContactMessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminContactMessagesPage() {
  const supabase = getAdminClient();
  let configured = false;
  let messages: Message[] = [];
  if (supabase) {
    configured = true;
    const { data } = await supabase
      .from("contact_messages")
      .select("id, name, email, subject, message, status, admin_note, created_at")
      .order("created_at", { ascending: false });
    messages = (data ?? []) as Message[];
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">Customer messages</h1>
        <p className="text-sm text-[color:var(--color-navy-400)]">
          {messages.length} message{messages.length === 1 ? "" : "s"}
        </p>
      </header>
      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          Supabase isn&apos;t configured.
        </div>
      )}
      <ContactMessagesClient initial={messages} />
    </div>
  );
}
