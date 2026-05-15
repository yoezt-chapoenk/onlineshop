import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";

export interface SiteSettings {
  store_name: string | null;
  store_logo_url: string | null;
  contact_email: string | null;
  whatsapp_number: string | null;
  pixel_meta_id: string | null;
  pixel_tiktok_id: string | null;
  pixel_google_id: string | null;
  seo_default_title: string | null;
  seo_default_description: string | null;
}

const EMPTY: SiteSettings = {
  store_name: null,
  store_logo_url: null,
  contact_email: null,
  whatsapp_number: null,
  pixel_meta_id: null,
  pixel_tiktok_id: null,
  pixel_google_id: null,
  seo_default_title: null,
  seo_default_description: null,
};

/**
 * Returns the public site_settings row. Cached per-request via React's cache
 * so multiple components in the same render tree share one DB roundtrip.
 *
 * Safe for static rendering — uses the anon client, no cookies access.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = getPublicClient();
  if (!supabase) return EMPTY;
  const { data } = await supabase
    .from("site_settings")
    .select(
      "store_name, store_logo_url, contact_email, whatsapp_number, pixel_meta_id, pixel_tiktok_id, pixel_google_id, seo_default_title, seo_default_description",
    )
    .eq("id", 1)
    .maybeSingle();
  if (!data) return EMPTY;
  return { ...EMPTY, ...(data as Partial<SiteSettings>) };
});
