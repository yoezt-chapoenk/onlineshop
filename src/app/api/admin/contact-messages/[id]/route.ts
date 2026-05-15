import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  status: z.string().min(1),
  admin_note: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { data, error } = await ctx.supabase
    .from("contact_messages")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
