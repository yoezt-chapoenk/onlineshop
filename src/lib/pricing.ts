import type { CartItem, Product } from "./types";
import { products } from "./products";

export type AppliedPriceType = "retail" | "promo" | "wholesale" | "reseller";

export interface PriceCalculation {
  unitPrice: number;
  appliedType: AppliedPriceType;
  tierLabel: string | null;
  subtotal: number;
}

/**
 * Implements the pricing rules from PRD §7.4:
 *
 *   IF user_role = reseller AND reseller_price exists -> reseller_price
 *   ELSE IF quantity >= wholesale_tier.min_qty       -> matching wholesale tier
 *   ELSE IF promotional_price exists                 -> promotional_price
 *   ELSE                                              -> retail_price
 */
export function calculatePrice(
  product: Pick<
    Product,
    "retailPrice" | "promotionalPrice" | "resellerPrice" | "priceTiers"
  >,
  quantity: number,
  isReseller = false,
): PriceCalculation {
  const qty = Math.max(1, Math.floor(quantity));

  if (isReseller && product.resellerPrice) {
    return {
      unitPrice: product.resellerPrice,
      appliedType: "reseller",
      tierLabel: "Reseller price",
      subtotal: product.resellerPrice * qty,
    };
  }

  // Find the highest-min-qty tier that applies (tiers are sorted ascending).
  const applicableTier = [...product.priceTiers]
    .filter((tier) => qty >= tier.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];

  if (applicableTier) {
    return {
      unitPrice: applicableTier.unitPrice,
      appliedType: "wholesale",
      tierLabel: applicableTier.label,
      subtotal: applicableTier.unitPrice * qty,
    };
  }

  if (product.promotionalPrice && product.promotionalPrice < product.retailPrice) {
    return {
      unitPrice: product.promotionalPrice,
      appliedType: "promo",
      tierLabel: "Promo price",
      subtotal: product.promotionalPrice * qty,
    };
  }

  return {
    unitPrice: product.retailPrice,
    appliedType: "retail",
    tierLabel: null,
    subtotal: product.retailPrice * qty,
  };
}

export interface CartTotals {
  subtotal: number;
  itemCount: number;
  weightGram: number;
  lineItems: {
    item: CartItem;
    pricing: PriceCalculation;
  }[];
}

export function calculateCartTotals(
  items: CartItem[],
  isReseller = false,
): CartTotals {
  let subtotal = 0;
  let itemCount = 0;
  let weightGram = 0;

  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const pricing = calculatePrice(
      product ?? {
        retailPrice: item.retailPrice,
        promotionalPrice: undefined,
        resellerPrice: undefined,
        priceTiers: [],
      },
      item.quantity,
      isReseller,
    );
    subtotal += pricing.subtotal;
    itemCount += item.quantity;
    weightGram += item.weightGram * item.quantity;
    return { item, pricing };
  });

  return { subtotal, itemCount, weightGram, lineItems };
}
