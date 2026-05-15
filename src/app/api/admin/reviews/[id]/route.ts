import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { revalidateCatalog } from "@/lib/admin/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const { id } = await params;
  // Update + return product_id so we can invalidate the right detail page.
  const { data, error } = await ctx.supabase
    .from("product_reviews")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("product_id, products:products(slug)")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const slug = (data as { products?: { slug?: string } } | null)?.products?.slug;
  revalidateCatalog(slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  const { data: pre } = await ctx.supabase
    .from("product_reviews")
    .select("products:products(slug)")
    .eq("id", id)
    .maybeSingle();
  const { error } = await ctx.supabase
    .from("product_reviews")
    .delete()
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const slug = (pre as { products?: { slug?: string } } | null)?.products?.slug;
  revalidateCatalog(slug);
  return NextResponse.json({ ok: true });
}
