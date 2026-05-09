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
  affiliate_commission_percent: 5.0,
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
        } else if (k === "affiliate_commission_percent") {
          const val = row[k];
          next[k] = (typeof val === "number" ? val : EMPTY[k]) as never;
        } else {
          const val = row[k];
          next[k] = (typeof val === "string" ? val : "") as never;
        }
      }
      settings = next;
    }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Store identity, integrations, and SEO defaults.
        </p>
      </header>
      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured.
        </div>
      )}
      <SettingsForm initial={settings} />
    </div>
  );
}
