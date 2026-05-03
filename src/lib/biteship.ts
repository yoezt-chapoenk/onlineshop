import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { STORE_ORIGIN_POSTAL_CODE } from "@/lib/constants";

const BITESHIP_BASE = "https://api.biteship.com/v1";

async function getBiteshipConfig(): Promise<{ apiKey: string; originPostalCode: string }> {
  let dbApiKey: string | null = null;
  let dbPostalCode: string | null = null;

  try {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("site_settings")
        .select("biteship_api_key, origin_postal_code")
        .eq("id", 1)
        .single();
      
      if (data) {
        dbApiKey = data.biteship_api_key;
        dbPostalCode = data.origin_postal_code;
      }
    }
  } catch (e) {
    console.error("[biteship] failed to fetch config from db", e);
  }

  const apiKey = dbApiKey || process.env.BITESHIP_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BITESHIP_API_KEY is not set in DB or env vars.",
    );
  }

  const originPostalCode = dbPostalCode || STORE_ORIGIN_POSTAL_CODE;

  return { apiKey, originPostalCode };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BiteshipArea {
  id: string;
  name: string;
  country_name: string;
  country_code: string;
  administrative_division_level_1_name: string; // Province
  administrative_division_level_1_type: string;
  administrative_division_level_2_name: string; // City/Kabupaten
  administrative_division_level_2_type: string;
  administrative_division_level_3_name: string; // Kecamatan
  administrative_division_level_3_type: string;
  postal_code: number;
}

export interface BiteshipCourierRate {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  description: string;
  duration: string;
  shipment_duration_range: string;
  shipment_duration_unit: string;
  price: number;
  type: string;
}

export interface BiteshipRateItem {
  name: string;
  description?: string;
  value: number;
  weight: number;
  quantity: number;
  length?: number;
  width?: number;
  height?: number;
}

// ---------------------------------------------------------------------------
// Area search (autocomplete)
// ---------------------------------------------------------------------------

interface AreasResponse {
  success: boolean;
  areas: BiteshipArea[];
}

/**
 * Search for areas (kecamatan / kota / provinsi) by query string.
 * Used to power the checkout address autocomplete.
 *
 * @see https://biteship.com/en/docs/api#maps-search-area
 */
export async function searchAreas(query: string): Promise<BiteshipArea[]> {
  if (!query || query.length < 3) return [];

  let apiKey: string;
  try {
    const config = await getBiteshipConfig();
    apiKey = config.apiKey;
  } catch {
    console.warn("[biteship] BITESHIP_API_KEY not configured, skipping area search");
    return [];
  }

  const url = new URL(`${BITESHIP_BASE}/maps/areas`);
  url.searchParams.set("countries", "ID");
  url.searchParams.set("input", query);
  url.searchParams.set("type", "single");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[biteship] searchAreas failed:", res.status, await res.text());
    return [];
  }

  const json = (await res.json()) as AreasResponse;
  return json.areas ?? [];
}

// ---------------------------------------------------------------------------
// Courier rates
// ---------------------------------------------------------------------------

/** Couriers enabled for Juragan Grosir. */
export const ENABLED_COURIERS = "jne,jnt,sentralcargo";

interface RatesResponse {
  success: boolean;
  object?: string;
  message?: string;
  pricing?: BiteshipCourierRate[];
  data?: {
    pricing: BiteshipCourierRate[];
  };
}

export interface GetRatesParams {
  originPostalCode?: string;
  destinationPostalCode: string;
  items: BiteshipRateItem[];
  couriers?: string; // comma-separated courier codes
}

/**
 * Fetch live courier rates from Biteship.
 *
 * @see https://biteship.com/en/docs/api#rates-couriers
 */
export async function getCourierRates(
  params: GetRatesParams,
): Promise<BiteshipCourierRate[]> {
  const config = await getBiteshipConfig();

  const body = {
    origin_postal_code: Number(params.originPostalCode ?? config.originPostalCode),
    destination_postal_code: Number(params.destinationPostalCode),
    couriers: params.couriers ?? ENABLED_COURIERS,
    items: params.items.map((item) => ({
      name: item.name,
      description: item.description ?? "",
      value: item.value,
      weight: item.weight,
      quantity: item.quantity,
      length: item.length ?? 15,
      width: item.width ?? 10,
      height: item.height ?? 5,
    })),
  };

  const res = await fetch(`${BITESHIP_BASE}/rates/couriers`, {
    method: "POST",
    headers: {
      Authorization: config.apiKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[biteship] getCourierRates failed:", res.status, text);
    throw new Error(`Biteship rates request failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as RatesResponse;
  return json.data?.pricing ?? json.pricing ?? [];
}
