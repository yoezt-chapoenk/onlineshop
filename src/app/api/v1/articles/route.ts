import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-auth";

const ArticleAgentSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal("")),
  is_published: z.boolean().default(true),
});

export async function POST(req: Request) {
  if (!(await validateApiKey(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "DB Error" }, { status: 500 });

  try {
    const body = await req.json();
    const parsed = ArticleAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    // Upsert article based on slug
    const { data, error } = await supabase
      .from("articles")
      .upsert({
        slug: parsed.data.slug,
        title: parsed.data.title,
        content: parsed.data.content,
        image_url: parsed.data.image_url || null,
        is_published: parsed.data.is_published,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
