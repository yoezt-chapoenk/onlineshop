import { adminClientOrError } from "@/lib/admin/api";
import { redirect } from "next/navigation";
import AdminPaymentsClient from "./AdminPaymentsClient";

export const metadata = {
  title: "Payment Confirmations",
};

export default async function AdminPaymentsPage() {
  const ctx = adminClientOrError();
  if (!ctx.ok) redirect("/admin/login");

  // Fetch pending confirmations
  const { data: pendingConfirmations } = await ctx.supabase
    .from("payment_confirmations")
    .select("*, orders!inner(customer_name, customer_email, total)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch recently processed ones
  const { data: recentHistory } = await ctx.supabase
    .from("payment_confirmations")
    .select("*, orders!inner(customer_name, customer_email, total)")
    .neq("status", "pending")
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-navy-900)]">
          Konfirmasi Pembayaran
        </h1>
      </div>

      <AdminPaymentsClient 
        pending={pendingConfirmations || []} 
        history={recentHistory || []} 
      />
    </div>
  );
}
