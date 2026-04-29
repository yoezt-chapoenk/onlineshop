export type CategorySlug =
  | "eyeglasses"
  | "sunglasses"
  | "blue-light"
  | "accessories";

export type Gender = "men" | "women" | "unisex" | "kids";

export type Style = "fashion" | "casual" | "sport" | "vintage" | "premium";

export type FrameStyle = "classic" | "round" | "aviator" | "rectangle" | "cateye" | "browline";

export interface PriceTier {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
  label: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color?: string;
  type?: string;
  size?: string;
  stock: number;
  priceOverride?: number;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  category: CategorySlug;
  categoryLabel: string;
  gender: Gender;
  style: Style;
  frame: FrameStyle;
  retailPrice: number;
  promotionalPrice?: number;
  resellerPrice?: number;
  priceTiers: PriceTier[];
  minWholesaleQty: number;
  stock: number;
  weightGram: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  colors: string[]; // hex
  frameColor: "black" | "gold" | "silver" | "tortoise" | "navy" | "rose" | "olive";
  lensColor?: "clear" | "smoke" | "green" | "amber" | "blue" | "mirror";
  specs: { label: string; value: string }[];
  variants: ProductVariant[];
  /**
   * Optional uploaded product photos (Supabase Storage URLs). When
   * empty, storefront falls back to the procedural `GlassesArt` SVG.
   * The first entry is used for cards / OG images; the rest populate
   * the detail-page gallery.
   */
  imageUrls: string[];
}

export interface CartItem {
  /**
   * Stable client-side key identifying this line. Either the product id
   * (single-SKU products) or `${productId}::${variantId}` when a variant
   * is selected, so two sizes of the same product appear as two rows.
   */
  lineId: string;
  productId: string;
  variantId?: string;
  variantLabel?: string;
  variantColor?: string;
  variantType?: string;
  variantSize?: string;
  variantSku?: string;
  slug: string;
  name: string;
  sku: string;
  quantity: number;
  retailPrice: number;
  promotionalPrice?: number;
  resellerPrice?: number;
  priceTiers: PriceTier[];
  weightGram: number;
  // The cart needs `frame` and `stock` to render the correct
  // GlassesArt thumbnail and to clamp the quantity stepper. Storing
  // them on the cart item itself keeps the cart self-contained: the
  // /cart page (a client component) doesn't need to look the product
  // up in the seed array, which would break for Supabase-sourced
  // products whose ids are uuids that never match the seed slug-ids.
  frame: Product["frame"];
  stock: number;
  frameColor: Product["frameColor"];
  lensColor?: Product["lensColor"];
  category: Product["category"];
  /** Primary uploaded photo URL, if any. Cart falls back to GlassesArt when absent. */
  imageUrl?: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  productCount: number;
}
