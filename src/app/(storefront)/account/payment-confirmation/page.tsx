import { getServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PaymentConfirmationClient from "./PaymentConfirmationClient";

export const metadata = {
  title: "Konfirmasi Pembayaran",
};

export default async function PaymentConfirmationPage(props: { searchParams: Promise<{ order?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await getServerSupabase();
  if (!supabase) return <div>Database not configured</div>;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Fetch pending orders for this user to populate a dropdown
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("order_number, total, created_at")
    .eq("customer_email", session.user.email)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Check if they already have pending confirmations
  const { data: myConfirmations } = await supabase
    .from("payment_confirmations")
    .select("*, orders!inner(customer_email)")
    .eq("orders.customer_email", session.user.email)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 900 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>Konfirmasi Pembayaran</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>
          Unggah bukti transfer Anda agar pesanan dapat segera kami proses.
        </p>
      </div>

      <PaymentConfirmationClient 
        initialOrderNumber={searchParams.order || ""} 
        pendingOrders={pendingOrders || []} 
        history={myConfirmations || []}
      />
    </div>
  );
}
