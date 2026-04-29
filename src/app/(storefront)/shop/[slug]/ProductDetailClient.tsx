"use client";

import { Minus, Plus, ShoppingCart, MessageCircle } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { calculatePrice } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { whatsappLink, SITE_URL } from "@/lib/constants";

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const { isReseller } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pricing = calculatePrice(product, quantity, isReseller);

  const showSale =
    product.promotionalPrice && product.promotionalPrice < product.retailPrice;

  const wa = whatsappLink(
    `Halo Juragan Grosir, saya ingin bertanya tentang produk: ${product.name} - ${SITE_URL}/shop/${product.slug}`,
  );

  function handleAdd() {
    addItem(product, quantity);
    setFeedback(`${quantity} × ${product.name} ditambahkan ke keranjang.`);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-baseline gap-3 flex-wrap">
        <div className="text-3xl sm:text-4xl font-bold text-[color:var(--color-navy-900)]">
          {formatRupiah(pricing.unitPrice)}
        </div>
        <div className="text-sm text-[color:var(--color-muted)]">/ pcs</div>
        {showSale && pricing.appliedType === "promo" && (
          <div className="text-sm text-[color:var(--color-muted)] line-through">
            {formatRupiah(product.retailPrice)}
          </div>
        )}
        {pricing.tierLabel && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]">
            {pricing.tierLabel}
          </span>
        )}
      </div>
      <div className="text-sm">
        Subtotal:{" "}
        <span className="font-semibold text-[color:var(--color-ink)]">
          {formatRupiah(pricing.subtotal)}
        </span>{" "}
        <span className="text-[color:var(--color-muted)]">
          ({quantity} × {formatRupiah(pricing.unitPrice)})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-lg border border-[color:var(--color-line)] overflow-hidden">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            className="h-10 w-10 flex items-center justify-center hover:bg-[color:var(--color-cloud-100)]"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v)) {
                setQuantity(Math.max(1, Math.min(product.stock, Math.floor(v))));
              }
            }}
            className="h-10 w-14 text-center text-sm font-semibold border-x border-[color:var(--color-line)] focus:outline-none"
          />
          <button
            type="button"
            aria-label="Tambah jumlah"
            className="h-10 w-10 flex items-center justify-center hover:bg-[color:var(--color-cloud-100)]"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="btn btn-primary"
        >
          <ShoppingCart className="h-4 w-4" /> Tambah ke Keranjang
        </button>

        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          <MessageCircle className="h-4 w-4" /> Tanya via WhatsApp
        </a>
      </div>

      <div
        className={clsx(
          "text-sm font-medium transition-opacity",
          feedback ? "opacity-100 text-[color:var(--color-success)]" : "opacity-0",
        )}
        aria-live="polite"
      >
        {feedback ?? "."}
      </div>
    </div>
  );
}
