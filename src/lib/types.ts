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
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  quantity: number;
  retailPrice: number;
  promotionalPrice?: number;
  resellerPrice?: number;
  priceTiers: PriceTier[];
  weightGram: number;
  frameColor: Product["frameColor"];
  lensColor?: Product["lensColor"];
  category: Product["category"];
}

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  productCount: number;
}
