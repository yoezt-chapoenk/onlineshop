"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import GlassesArt from "./GlassesArt";

interface Props {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: Props) {
  const { addItem } = useCart();
  const [favorited, setFavorited] = useState(false);
  const [added, setAdded] = useState(false);

  const showSale =
    product.promotionalPrice && product.promotionalPrice < product.retailPrice;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article
      className={clsx(
        "card group relative flex flex-col overflow-hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setFavorited((f) => !f);
        }}
        aria-label={favorited ? "Hapus dari favorit" : "Tambah ke favorit"}
        className="absolute right-3 top-3 z-10 h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur border border-[color:var(--color-line)] hover:bg-white transition-colors"
      >
        <Heart
          className={clsx(
            "h-4 w-4 transition-colors",
            favorited
              ? "fill-[color:var(--color-navy-900)] text-[color:var(--color-navy-900)]"
              : "text-[color:var(--color-navy-900)]",
          )}
        />
      </button>

      {showSale && (
        <span className="absolute left-3 top-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[color:var(--color-blue-500)] text-white">
          Promo
        </span>
      )}
      {!showSale && product.isNewArrival && (
        <span className="absolute left-3 top-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[color:var(--color-navy-900)] text-white">
          Baru
        </span>
      )}

      <Link
        href={`/shop/${product.slug}`}
        className="block bg-[color:var(--color-cloud-100)] aspect-[4/3] flex items-center justify-center p-4"
      >
        <GlassesArt product={product} size={180} />
      </Link>

      <div className="flex-1 flex flex-col p-4 sm:p-5 gap-3">
        <Link href={`/shop/${product.slug}`} className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)] line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
            {product.categoryLabel}
          </p>
        </Link>

        <div>
          {showSale ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base sm:text-[17px] font-bold text-[color:var(--color-navy-900)]">
                {formatRupiah(product.promotionalPrice ?? 0)}
              </span>
              <span className="text-xs text-[color:var(--color-muted)] line-through">
                {formatRupiah(product.retailPrice)}
              </span>
            </div>
          ) : (
            <div className="text-base sm:text-[17px] font-bold text-[color:var(--color-navy-900)]">
              {formatRupiah(product.retailPrice)}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="btn btn-primary w-full !py-2 text-xs"
          aria-label={`Tambahkan ${product.name} ke keranjang`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>{added ? "Ditambahkan" : "Tambah ke Keranjang"}</span>
        </button>

        {product.minWholesaleQty > 0 && (
          <div className="text-[11px] text-[color:var(--color-muted)]">
            Grosir mulai{" "}
            <span className="font-semibold text-[color:var(--color-ink)]">
              {product.minWholesaleQty} pcs
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
