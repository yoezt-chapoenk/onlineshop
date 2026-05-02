import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-auth";

const ProductAgentSchema = z.object({
  slug: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1),
  short_description: z.string(),
  description: z.string(),
  category_slug: z.string(),
  retail_price: z.number().int(),
  reseller_price: z.number().int().optional(),
  stock: z.number().int().default(100),
  weight_gram: z.number().int().default(500),
  image_urls: z.array(z.string().url()).optional(),
});

export async function POST(req: Request) {
  if (!(await validateApiKey(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "DB Error" }, { status: 500 });

  try {
    const body = await req.json();
    const parsed = ProductAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("slug", parsed.data.category_slug)
      .maybeSingle();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    // Upsert product — image_urls stored directly on product (no fake variants)
    const { data: productData, error } = await supabase
      .from("products")
      .upsert({
        slug: parsed.data.slug,
        sku: parsed.data.sku,
        name: parsed.data.name,
        short_description: parsed.data.short_description,
        description: parsed.data.description,
        category_slug: parsed.data.category_slug,
        category_label: category.name,
        retail_price: parsed.data.retail_price,
        reseller_price: parsed.data.reseller_price ?? parsed.data.retail_price,
        stock: parsed.data.stock,
        weight_gram: parsed.data.weight_gram,
        image_urls: parsed.data.image_urls ?? [],
        // Defaults for required fields
        gender: "unisex",
        style: "casual",
        frame: "classic",
        min_wholesale_qty: 6,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: true,
        rating: 0,
        review_count: 0,
        frame_color: "black",
        lens_color: "clear",
        specs: [],
      }, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, id: productData.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
