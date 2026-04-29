import "server-only";

const BITESHIP_BASE = "https://api.biteship.com/v1";

function getApiKey(): string {
  const key = process.env.BITESHIP_API_KEY;
  if (!key) {
    throw new Error(
      "BITESHIP_API_KEY is not set. Add it to .env.local or Vercel env vars.",
    );
  }
  return key;
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

  const url = new URL(`${BITESHIP_BASE}/maps/areas`);
  url.searchParams.set("countries", "ID");
  url.searchParams.set("input", query);
  url.searchParams.set("type", "single");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: getApiKey(),
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 }, // cache area lookups for 1 hour
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
  object: string;
  message: string;
  pricing: BiteshipCourierRate[];
}

export interface GetRatesParams {
  originPostalCode: string;
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
  const body = {
    origin_postal_code: Number(params.originPostalCode),
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
      Authorization: getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[biteship] getCourierRates failed:", res.status, text);
    throw new Error(`Biteship rates request failed (${res.status})`);
  }

  const json = (await res.json()) as RatesResponse;
  return json.pricing ?? [];
}
