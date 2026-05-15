import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClientOrError } from "@/lib/admin/api";
import { revalidateBlog } from "@/lib/admin/revalidate";

export const dynamic = "force-dynamic";

const ArticleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal("")),
  is_published: z.boolean().default(false),
});

export async function GET() {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;
  const { data, error } = await ctx.supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;

  try {
    const body = await req.json();
    const parsed = ArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from("articles")
      .insert({
        slug: parsed.data.slug,
        title: parsed.data.title,
        content: parsed.data.content,
        image_url: parsed.data.image_url || null,
        is_published: parsed.data.is_published,
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    revalidateBlog(parsed.data.slug);
    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
