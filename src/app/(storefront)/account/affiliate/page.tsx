import { getServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AffiliateDashboardClient from "./AffiliateDashboardClient";
import { SITE_URL } from "@/lib/constants";

export const metadata = {
  title: "Affiliate Dashboard",
};

export default async function AffiliatePage() {
  const supabase = await getServerSupabase();
  if (!supabase) return <div>Database not configured</div>;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("affiliate_code, balance")
    .eq("id", session.user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: commissions } = await supabase
    .from("commissions")
    .select("amount, created_at, orders(order_number)")
    .eq("affiliate_id", session.user.id)
    .order("created_at", { ascending: false });

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("affiliate_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Affiliate Program</h1>
      </div>

      <AffiliateDashboardClient 
        profile={profile} 
        commissions={commissions || []} 
        withdrawals={withdrawals || []} 
        siteUrl={SITE_URL}
      />
    </div>
  );
}
