import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { revalidateBlog } from "@/lib/admin/revalidate";

const ArticleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal("")),
  is_published: z.boolean().default(false),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;

  try {
    const body = await req.json();
    const parsed = ArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { error } = await ctx.supabase
      .from("articles")
      .update({
        slug: parsed.data.slug,
        title: parsed.data.title,
        content: parsed.data.content,
        image_url: parsed.data.image_url || null,
        is_published: parsed.data.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    revalidateBlog(parsed.data.slug);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;

  const { error } = await ctx.supabase.from("articles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidateBlog();
  return NextResponse.json({ success: true });
}
