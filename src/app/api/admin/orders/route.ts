import { NextResponse } from "next/server";
import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  let q = ctx.supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, total, item_count, status, payment_method, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}
