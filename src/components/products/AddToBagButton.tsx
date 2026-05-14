"use client";

import { useState } from "react";
import type { ProductCartInput } from "@/lib/types";
import { useCart } from "@/components/cart/CartProvider";

interface Props {
  product: ProductCartInput;
  className?: string;
}

/**
 * Tiny client island for the "Add to Bag" action on a product card. Lets the
 * surrounding card stay a Server Component so we don't ship its markup as JS.
 */
export default function AddToBagButton({ product, className }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock === 0;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={outOfStock}
      className={className}
      style={{
        marginTop: 6,
        background: "none",
        border: "none",
        cursor: outOfStock ? "not-allowed" : "pointer",
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--text-dim)",
        fontFamily: "var(--font-sans)",
        transition: "color 0.2s",
        padding: 0,
        opacity: outOfStock ? 0.5 : 1,
      }}
    >
      {added ? "Added" : outOfStock ? "Out of Stock" : "Add to Bag"}
    </button>
  );
}
