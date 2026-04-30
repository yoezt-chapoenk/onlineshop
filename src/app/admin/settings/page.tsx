import { getAdminClient } from "@/lib/supabase/admin";
import SettingsForm, { type Settings, type BankAccount } from "./SettingsForm";

export const dynamic = "force-dynamic";

const EMPTY: Settings = {
  store_name: "Juragan Grosir",
  store_logo_url: "",
  contact_email: "",
  whatsapp_number: "",
  store_address: "",
  biteship_api_key: "",
  origin_postal_code: "68168",
  payment_banks: [],
  payment_qris_url: "",
  pixel_meta_id: "",
  pixel_tiktok_id: "",
  pixel_google_id: "",
  seo_default_title: "",
  seo_default_description: "",
};

export default async function AdminSettingsPage() {
  const supabase = getAdminClient();
  let configured = false;
  let settings: Settings = EMPTY;
  if (supabase) {
    configured = true;
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (data) {
      const row = data as Record<string, unknown>;
      const next = { ...EMPTY };
      for (const k of Object.keys(EMPTY) as (keyof Settings)[]) {
        if (k === "payment_banks") {
          // JSONB field — parse array
          const raw = row[k];
          next[k] = Array.isArray(raw) ? (raw as BankAccount[]) : [];
        } else {
          const val = row[k];
          next[k] = (typeof val === "string" ? val : "") as never;
        }
      }
      settings = next;
    }
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">Settings</h1>
        <p className="text-sm text-[color:var(--color-navy-400)]">
          Store identity, integrations, and SEO defaults.
        </p>
      </header>
      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          Supabase isn&apos;t configured.
        </div>
      )}
      <SettingsForm initial={settings} />
    </div>
  );
}
