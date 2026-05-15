import { NextResponse } from "next/server";
import { z } from "zod";
import { getCourierRates, ENABLED_COURIERS } from "@/lib/biteship";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fallback per-unit weight used when a cart item's `weight` arrives as 0 or
 * is missing. Eyewear is light (typically 30–90 g) but Biteship's rate
 * endpoint expects a positive weight, so we substitute a conservative
 * default rather than refusing the request. In testing this also lets the
 * shipping picker work even when products haven't had a weight configured
 * via the admin yet.
 */
const FALLBACK_ITEM_WEIGHT_G = 100;

const RateRequestSchema = z.object({
  destinationPostalCode: z.string().min(3),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        value: z.number().int().nonnegative(),
        // Allow 0 from the client. We clamp to a sensible minimum before
        // calling Biteship so a misconfigured weight never breaks checkout.
        weight: z.number().int().nonnegative(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

/**
 * POST /api/shipping/rates
 *
 * Client sends destination postal code + cart items.
 * Origin postal code is always read from server config.
 * Returns courier options with prices.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const parsed = RateRequestSchema.safeParse(body);
  if (!parsed.success) {
    // Surface the first concrete validation issue so the UI can show a
    // helpful message instead of a generic "Invalid payload". The full
    // flatten() output is still returned under `details` for debugging.
    const flat = parsed.error.flatten();
    const firstFieldError =
      Object.values(flat.fieldErrors).flat()[0] ??
      flat.formErrors[0] ??
      "Data pengiriman tidak valid.";
    return NextResponse.json(
      { error: firstFieldError, details: flat },
      { status: 400 },
    );
  }

  const items = parsed.data.items.map((it) => ({
    ...it,
    weight: it.weight > 0 ? it.weight : FALLBACK_ITEM_WEIGHT_G,
  }));

  try {
    const rates = await getCourierRates({
      destinationPostalCode: parsed.data.destinationPostalCode,
      items,
      couriers: ENABLED_COURIERS,
    });

    const options = rates
      .filter((r) => r.price > 0)
      .map((r) => ({
        courierCode: r.courier_code,
        courierName: r.courier_name,
        courierServiceCode: r.courier_service_code,
        courierServiceName: r.courier_service_name,
        description: r.description,
        price: r.price,
        duration: r.duration,
        durationRange: r.shipment_duration_range,
        durationUnit: r.shipment_duration_unit,
        type: r.type,
      }))
      .sort((a, b) => a.price - b.price);

    return NextResponse.json({ rates: options });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[shipping/rates] error:", message);
    return NextResponse.json(
      { error: "Gagal memuat tarif pengiriman. Coba lagi sesaat." },
      { status: 500 },
    );
  }
}
