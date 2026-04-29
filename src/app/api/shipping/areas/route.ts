import { NextResponse } from "next/server";
import { searchAreas } from "@/lib/biteship";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/shipping/areas?q=<search>
 *
 * Proxy to Biteship Maps API. Returns a simplified list of areas
 * for the checkout address autocomplete. The raw Biteship response
 * is trimmed to only the fields the frontend needs.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 3) {
    return NextResponse.json({ areas: [] });
  }

  try {
    const raw = await searchAreas(q);

    // Simplify for frontend
    const areas = raw.map((a) => ({
      id: a.id,
      label: [
        a.administrative_division_level_3_name,
        a.administrative_division_level_2_name,
        a.administrative_division_level_1_name,
      ]
        .filter(Boolean)
        .join(", "),
      province: a.administrative_division_level_1_name,
      city: a.administrative_division_level_2_name,
      district: a.administrative_division_level_3_name,
      postalCode: String(a.postal_code),
    }));

    return NextResponse.json({ areas });
  } catch (err) {
    console.error("[shipping/areas] error:", err);
    return NextResponse.json(
      { error: "Failed to search areas", areas: [] },
      { status: 500 },
    );
  }
}
