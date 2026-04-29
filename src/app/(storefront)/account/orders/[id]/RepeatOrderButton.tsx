"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { products as seedProducts } from "@/lib/products";
import { t } from "@/lib/i18n";

interface OrderItem {
  product_slug: string;
  quantity: number;
}

export default function RepeatOrderButton({ items }: { items: OrderItem[] }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRepeat() {
    setPending(true);
    try {
      // Look up the freshest product data so the cart item carries
      // current pricing/stock. Fall back to seed data when the lookup
      // fails, so this still works in local dev without Supabase.
      for (const it of items) {
        const res = await fetch(`/api/products/${encodeURIComponent(it.product_slug)}`);
        let product = null;
        if (res.ok) {
          const j = await res.json();
          product = j?.product ?? null;
        }
        if (!product) {
          product = seedProducts.find((p) => p.slug === it.product_slug) ?? null;
        }
        if (product) addItem(product, it.quantity);
      }
      router.push("/cart");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRepeat}
      disabled={pending}
      className="btn btn-outline inline-flex items-center gap-2 text-sm"
    >
      <ShoppingBag className="h-4 w-4" />
      {pending ? t.common.loading : t.account.repeatOrder}
    </button>
  );
}
