import { NextResponse } from "next/server";
import { z } from "zod";
import { getCourierRates, ENABLED_COURIERS } from "@/lib/biteship";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RateRequestSchema = z.object({
  destinationPostalCode: z.string().min(3),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        value: z.number().int().nonnegative(),
        weight: z.number().int().positive(),
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
 * Returns Biteship courier options with prices.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const rates = await getCourierRates({
      destinationPostalCode: parsed.data.destinationPostalCode,
      items: parsed.data.items,
      couriers: ENABLED_COURIERS,
    });

    // Normalize and sort by price ascending
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
      { error: message },
      { status: 500 },
    );
  }
}
