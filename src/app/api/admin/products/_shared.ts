import { z } from "zod";

export const ProductSchema = z.object({
  slug: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1),
  short_description: z.string().min(1),
  description: z.string().min(1),
  category_slug: z.string().min(1),
  category_label: z.string().min(1),
  gender: z.enum(["men", "women", "unisex", "kids"]),
  style: z.enum(["fashion", "casual", "sport", "vintage", "premium"]),
  frame: z.enum(["classic", "round", "aviator", "rectangle", "cateye", "browline"]),
  retail_price: z.number().int().nonnegative(),
  promotional_price: z.number().int().nonnegative().nullable(),
  reseller_price: z.number().int().nonnegative().nullable(),
  min_wholesale_qty: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  weight_gram: z.number().int().nonnegative(),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
  is_new_arrival: z.boolean(),
  rating: z.number().min(0).max(5),
  review_count: z.number().int().nonnegative(),
  colors: z.array(z.string()),
  frame_color: z.enum(["black", "gold", "silver", "tortoise", "navy", "rose", "olive"]),
  lens_color: z
    .enum(["clear", "smoke", "green", "amber", "blue", "mirror"])
    .nullable(),
  specs: z.array(z.object({ label: z.string(), value: z.string() })),
  image_urls: z.array(z.string().url()).default([]),
  price_tiers: z.array(
    z.object({
      min_qty: z.number().int().positive(),
      max_qty: z.number().int().positive().nullable(),
      unit_price: z.number().int().nonnegative(),
      label: z.string().min(1),
    }),
  ),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        sku: z.string().min(1),
        color: z.string().nullable().optional(),
        variant_type: z.string().nullable().optional(),
        size: z.string().nullable().optional(),
        stock: z.number().int().nonnegative(),
        price_override: z.number().int().nonnegative().nullable().optional(),
        sort_order: z.number().int().nonnegative().optional(),
      }),
    )
    .default([]),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export function productToRow(p: ProductInput) {
  // The database row excludes price_tiers and variants, which live in
  // their own tables and are replaced via dedicated RPC calls.
  const { price_tiers: _tiers, variants: _variants, ...row } = p;
  void _tiers;
  void _variants;
  return row;
}
