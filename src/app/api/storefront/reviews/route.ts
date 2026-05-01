import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, getServerSupabase } from "@/lib/supabase/server";

const ReviewSchema = z.object({
  product_id: z.string().uuid(),
  order_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { authUser } = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const supabase = await getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    // Insert the review
    const { error: insErr } = await supabase.from("product_reviews").insert({
      product_id: parsed.data.product_id,
      user_id: authUser.id,
      order_id: parsed.data.order_id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    if (insErr) {
      // 23505 is unique violation (already reviewed)
      if (insErr.code === "23505") {
        return NextResponse.json(
          { error: "Anda sudah mengulas produk ini untuk pesanan ini." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    // Now update the product's aggregate rating via RPC or directly.
    // For simplicity, we can do a quick recalculation in Edge/Node since traffic is low
    // or just increment the count and do a rolling average.
    // Let's do a direct calculation.
    const { data: reviews } = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", parsed.data.product_id);

    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = sum / reviews.length;
      await supabase
        .from("products")
        .update({
          rating: Number(avg.toFixed(1)),
          review_count: reviews.length,
        })
        .eq("id", parsed.data.product_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
