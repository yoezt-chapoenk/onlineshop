import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ product: null }, { status: 404 });
  }
  return NextResponse.json({ product });
}
