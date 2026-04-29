"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, Product, ProductVariant } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
  isHydrated: boolean;
}

// v2: cart lines carry variant info, so the key is now `lineId`
// instead of `productId`. Older v1 entries are dropped on load.
const STORAGE_KEY = "jg.cart.v2";
const LEGACY_KEYS = ["jg.cart.v1"];

const CartContext = createContext<CartContextValue | undefined>(undefined);

function lineIdFor(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

function variantLabel(v: ProductVariant | undefined): string | undefined {
  if (!v) return undefined;
  const parts = [v.color, v.type, v.size].filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount. localStorage is not available during
  // SSR, so we read it once on the client and sync it into React state.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(parsed);
        }
      }
      // Clear legacy v1 entries so the schema mismatch can't confuse callers.
      for (const k of LEGACY_KEYS) {
        if (window.localStorage.getItem(k)) window.localStorage.removeItem(k);
      }
    } catch {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isHydrated]);

  const addItem = useCallback(
    (product: Product, quantity = 1, variant?: ProductVariant) => {
      const id = lineIdFor(product.id, variant?.id);
      const maxStock = variant ? variant.stock : product.stock;
      setItems((current) => {
        const existing = current.find((i) => i.lineId === id);
        if (existing) {
          return current.map((i) =>
            i.lineId === id
              ? { ...i, quantity: Math.min(i.quantity + quantity, maxStock) }
              : i,
          );
        }
        const unit = variant?.priceOverride ?? product.retailPrice;
        const newItem: CartItem = {
          lineId: id,
          productId: product.id,
          variantId: variant?.id,
          variantLabel: variantLabel(variant),
          variantColor: variant?.color,
          variantType: variant?.type,
          variantSize: variant?.size,
          variantSku: variant?.sku,
          slug: product.slug,
          name: product.name,
          sku: variant?.sku ?? product.sku,
          quantity: Math.min(quantity, maxStock),
          retailPrice: unit,
          promotionalPrice: variant?.priceOverride
            ? undefined
            : product.promotionalPrice,
          resellerPrice: variant?.priceOverride
            ? undefined
            : product.resellerPrice,
          priceTiers: variant?.priceOverride ? [] : product.priceTiers,
          weightGram: product.weightGram,
          frame: product.frame,
          stock: maxStock,
          frameColor: product.frameColor,
          lensColor: product.lensColor,
          category: product.category,
        };
        return [...current, newItem];
      });
    },
    [],
  );

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((i) =>
          i.lineId === lineId ? { ...i, quantity: Math.max(0, quantity) } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((current) => current.filter((i) => i.lineId !== lineId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, itemCount, addItem, updateQuantity, removeItem, clear, isHydrated }),
    [items, itemCount, addItem, updateQuantity, removeItem, clear, isHydrated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
