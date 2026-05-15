import { adminClientOrError } from "@/lib/admin/api";
import { redirect } from "next/navigation";
import AdminAffiliatesClient from "./AdminAffiliatesClient";

export const metadata = {
  title: "Affiliates",
};

export default async function AdminAffiliatesPage() {
  const ctx = adminClientOrError();
  if (!ctx.ok) redirect("/admin/login");

  // Fetch pending withdrawals
  const { data: pendingWithdrawals } = await ctx.supabase
    .from("withdrawals")
    .select("*, affiliate:users(full_name, email, affiliate_code)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch top affiliates (simplified query to get users with highest balance or commission)
  const { data: topAffiliates } = await ctx.supabase
    .from("users")
    .select("id, full_name, email, affiliate_code, balance")
    .not("affiliate_code", "is", null)
    .order("balance", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-navy-900)]">
          Manajemen Affiliate
        </h1>
      </div>

      <AdminAffiliatesClient 
        pendingWithdrawals={pendingWithdrawals || []} 
        topAffiliates={topAffiliates || []} 
      />
    </div>
  );
}
