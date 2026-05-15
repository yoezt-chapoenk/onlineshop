import { getAdminClient } from "@/lib/supabase/admin";
import ResellerAppsClient, { type Application } from "./ResellerAppsClient";

export const dynamic = "force-dynamic";

export default async function AdminResellerAppsPage() {
  const supabase = getAdminClient();
  let configured = false;
  let apps: Application[] = [];
  if (supabase) {
    configured = true;
    const { data } = await supabase
      .from("reseller_applications")
      .select(
        "id, business_name, contact_name, email, phone, city, monthly_volume, notes, status, admin_note, reviewed_at, created_at",
      )
      .order("created_at", { ascending: false });
    apps = (data ?? []) as Application[];
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">Reseller applications</h1>
        <p className="text-sm text-[color:var(--color-navy-400)]">
          Review and approve wholesale partners. Approved emails are auto-promoted to the
          <span className="font-mono mx-1">reseller</span>role in the users table.
        </p>
      </header>
      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          Supabase isn&apos;t configured.
        </div>
      )}
      <ResellerAppsClient initial={apps} />
    </div>
  );
}
