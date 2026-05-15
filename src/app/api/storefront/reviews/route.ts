import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

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

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    // --- SECURITY: Verify the order belongs to this user AND is fulfilled ---
    const { data: order } = await admin
      .from("orders")
      .select("id, status, customer_email, order_items(product_id)")
      .eq("id", parsed.data.order_id)
      .eq("customer_email", authUser.email ?? "")
      .eq("status", "fulfilled")
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan, belum selesai, atau bukan milik Anda." },
        { status: 403 }
      );
    }

    // Verify the product is actually part of this order
    const productInOrder = (order.order_items as { product_id: string }[]).some(
      (item) => item.product_id === parsed.data.product_id
    );
    if (!productInOrder) {
      return NextResponse.json(
        { error: "Produk ini tidak ada dalam pesanan tersebut." },
        { status: 403 }
      );
    }

    // Insert the review via admin client (bypasses RLS)
    const { error: insErr } = await admin.from("product_reviews").insert({
      product_id: parsed.data.product_id,
      user_id: authUser.id,
      order_id: parsed.data.order_id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    if (insErr) {
      if (insErr.code === "23505") {
        return NextResponse.json(
          { error: "Anda sudah mengulas produk ini untuk pesanan ini." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    // Recalculate product aggregate rating
    const { data: reviews } = await admin
      .from("product_reviews")
      .select("rating")
      .eq("product_id", parsed.data.product_id);

    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = sum / reviews.length;
      await admin
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
