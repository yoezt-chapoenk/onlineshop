import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { calculatePrice } from "@/lib/pricing";
import { products as seedProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHIPPING_OPTIONS = [
  { id: "jne-reg", courier: "JNE", service: "Reguler", costPerKg: 18000 },
  { id: "jne-yes", courier: "JNE", service: "YES (Next Day)", costPerKg: 32000 },
  { id: "jnt-reg", courier: "J&T", service: "EZ", costPerKg: 16000 },
  { id: "sicepat-best", courier: "SiCepat", service: "BEST", costPerKg: 22000 },
] as const;

const PAYMENT_METHODS = ["qris", "va", "transfer"] as const;

const OrderSchema = z.object({
  customer: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(6),
    email: z.string().email(),
  }),
  address: z.object({
    province: z.string().min(1),
    city: z.string().min(1),
    district: z.string().min(1),
    postalCode: z.string().min(1),
    address: z.string().min(1),
    notes: z.string().optional().nullable(),
  }),
  shippingId: z.string().min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional().nullable(),
        quantity: z.number().int().positive().max(999),
      }),
    )
    .min(1),
});

interface ResolvedVariant {
  id: string;
  sku: string;
  color?: string;
  type?: string;
  size?: string;
  stock: number;
  priceOverride?: number;
}

interface ResolvedProduct
  extends Pick<
    Product,
    | "id"
    | "slug"
    | "sku"
    | "name"
    | "retailPrice"
    | "promotionalPrice"
    | "resellerPrice"
    | "priceTiers"
    | "weightGram"
    | "stock"
  > {
  rowId?: string;
  variants: ResolvedVariant[];
}

async function resolveProducts(
  productIds: string[],
): Promise<Map<string, ResolvedProduct>> {
  const supabase = getAdminClient();
  if (!supabase) {
    const map = new Map<string, ResolvedProduct>();
    for (const p of seedProducts) {
      if (productIds.includes(p.id)) {
        map.set(p.id, {
          ...p,
          variants: (p.variants ?? []).map((v) => ({
            id: v.id,
            sku: v.sku,
            color: v.color,
            type: v.type,
            size: v.size,
            stock: v.stock,
            priceOverride: v.priceOverride,
          })),
        });
      }
    }
    return map;
  }
  // Seed product ids (e.g. "p-classic-black") won't match Supabase uuids, so
  // we always also look up by slug. We issue two parameterized queries
  // (.in() escapes values internally) and merge the results, instead of
  // building a manual .or() filter string that would be vulnerable to
  // PostgREST filter injection.
  const PRODUCT_COLUMNS =
    "id, slug, sku, name, retail_price, promotional_price, reseller_price, weight_gram, stock, product_price_tiers(min_qty, max_qty, unit_price, label), product_variants(id, sku, color, variant_type, size, stock, price_override)";
  const uuids = productIds.filter((i) => /^[0-9a-f-]{36}$/i.test(i));
  const slugQuery = supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .in("slug", productIds);
  const idQuery = uuids.length > 0
    ? supabase.from("products").select(PRODUCT_COLUMNS).in("id", uuids)
    : null;
  const results = await Promise.all(
    idQuery ? [slugQuery, idQuery] : [slugQuery],
  );
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) {
    throw new Error(firstError.message);
  }
  const seen = new Set<string>();
  const data: unknown[] = [];
  for (const r of results) {
    for (const row of r.data ?? []) {
      const id = (row as { id: string }).id;
      if (seen.has(id)) continue;
      seen.add(id);
      data.push(row);
    }
  }
  const map = new Map<string, ResolvedProduct>();
  type Row = {
    id: string;
    slug: string;
    sku: string;
    name: string;
    retail_price: number;
    promotional_price: number | null;
    reseller_price: number | null;
    weight_gram: number;
    stock: number;
    product_price_tiers: {
      min_qty: number;
      max_qty: number | null;
      unit_price: number;
      label: string;
    }[];
    product_variants: {
      id: string;
      sku: string;
      color: string | null;
      variant_type: string | null;
      size: string | null;
      stock: number;
      price_override: number | null;
    }[];
  };
  for (const row of data as Row[]) {
    const resolved: ResolvedProduct = {
      id: row.id,
      slug: row.slug,
      sku: row.sku,
      name: row.name,
      retailPrice: row.retail_price,
      promotionalPrice: row.promotional_price ?? undefined,
      resellerPrice: row.reseller_price ?? undefined,
      priceTiers: (row.product_price_tiers ?? [])
        .map((t) => ({
          minQty: t.min_qty,
          maxQty: t.max_qty,
          unitPrice: t.unit_price,
          label: t.label,
        }))
        .sort((a, b) => a.minQty - b.minQty),
      weightGram: row.weight_gram,
      stock: row.stock,
      rowId: row.id,
      variants: (row.product_variants ?? []).map((v) => ({
        id: v.id,
        sku: v.sku,
        color: v.color ?? undefined,
        type: v.variant_type ?? undefined,
        size: v.size ?? undefined,
        stock: v.stock,
        priceOverride: v.price_override ?? undefined,
      })),
    };
    if (productIds.includes(row.id)) map.set(row.id, resolved);
    if (productIds.includes(row.slug)) map.set(row.slug, resolved);
  }
  return map;
}

function generateOrderNumber(): string {
  // Base36 timestamp + 6 random chars. Avoids the ~2.78h collision window of
  // a 7-digit decimal-millis suffix while staying short enough to print.
  // `Math.random().toString(36).slice(2)` can be unexpectedly short for some
  // values (e.g. 0.5 -> "0.i" -> "i"), so pad and take exactly 6 chars.
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random()
    .toString(36)
    .slice(2)
    .padEnd(6, "0")
    .slice(0, 6)
    .toUpperCase();
  return `JG-${ts}-${rand}`;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { customer, address, shippingId, paymentMethod, items } = parsed.data;
  const shipping = SHIPPING_OPTIONS.find((s) => s.id === shippingId);
  if (!shipping) {
    return NextResponse.json({ error: "Unknown shipping option" }, { status: 400 });
  }

  // Determine reseller status from the authenticated session, never
  // from the client request body. Only approved reseller/wholesale
  // accounts get reseller pricing.
  const { profile } = await getCurrentUser();
  const isReseller =
    (profile?.role === "reseller" || profile?.role === "wholesale") &&
    profile?.reseller_status === "approved";

  let resolved: Map<string, ResolvedProduct>;
  try {
    resolved = await resolveProducts(items.map((i) => i.productId));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lookup failed" },
      { status: 500 },
    );
  }
  const missing = items.filter((i) => !resolved.has(i.productId));
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: "Some products were not found",
        missing: missing.map((m) => m.productId),
      },
      { status: 400 },
    );
  }

  // Aggregate quantities by (productId, variantId) before validating
  // stock and pricing. Without this step, a malicious client could
  // POST [{productId: X, qty: 50}, {productId: X, qty: 50}] against
  // a product with stock=60: each line individually passes the check,
  // but together they oversell. Aggregating per-variant also lets two
  // different variants of the same product be ordered together while
  // each respects its own stock cap.
  type AggLine = {
    productId: string;
    variantId: string | null;
    quantity: number;
  };
  const aggregated = new Map<string, AggLine>();
  for (const line of items) {
    const variantId = line.variantId ?? null;
    const key = `${line.productId}::${variantId ?? ""}`;
    const existing = aggregated.get(key);
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      aggregated.set(key, {
        productId: line.productId,
        variantId,
        quantity: line.quantity,
      });
    }
  }
  const dedupedItems = Array.from(aggregated.values());

  // Reject lines whose declared variantId doesn't actually belong to the
  // resolved product. Prevents stuffing a variantId from product B onto
  // product A to dodge stock caps or price overrides.
  const variantMismatch = dedupedItems
    .map((line) => ({
      line,
      product: resolved.get(line.productId)!,
      variant: line.variantId
        ? resolved
            .get(line.productId)!
            .variants.find((v) => v.id === line.variantId)
        : undefined,
    }))
    .filter(({ line, variant }) => line.variantId && !variant);
  if (variantMismatch.length > 0) {
    return NextResponse.json(
      {
        error: "Unknown variant for product",
        items: variantMismatch.map(({ line, product }) => ({
          productId: line.productId,
          variantId: line.variantId,
          name: product.name,
        })),
      },
      { status: 400 },
    );
  }

  // Reject lines that omit variantId for products that have variants.
  // Without this, a malicious client could POST {productId, qty} for a
  // variant-product to spend product-level stock instead of per-variant
  // stock — leading to overselling (product.stock=100 but each variant
  // only has 50 each, the order would succeed against the product row
  // and the variant rows would still be untouched).
  const variantRequired = dedupedItems
    .map((line) => ({ line, product: resolved.get(line.productId)! }))
    .filter(({ line, product }) => product.variants.length > 0 && !line.variantId);
  if (variantRequired.length > 0) {
    return NextResponse.json(
      {
        error: "Variant selection required",
        items: variantRequired.map(({ line, product }) => ({
          productId: line.productId,
          name: product.name,
        })),
      },
      { status: 400 },
    );
  }

  // Server-side stock validation. The /cart and /shop/[slug] pages
  // already cap quantity at the active stock, but those limits run in
  // the browser and can be trivially bypassed by hitting this endpoint
  // directly. Reject any line whose aggregated quantity exceeds
  // available stock (per-variant when present, otherwise per-product).
  const overstocked = dedupedItems
    .map((line) => {
      const product = resolved.get(line.productId)!;
      const variant = line.variantId
        ? product.variants.find((v) => v.id === line.variantId)
        : undefined;
      const available = variant ? variant.stock : product.stock;
      return { line, product, variant, available };
    })
    .filter(({ line, available }) => line.quantity > available);
  if (overstocked.length > 0) {
    return NextResponse.json(
      {
        error: "Some items exceed available stock",
        items: overstocked.map(({ line, product, variant, available }) => ({
          productId: line.productId,
          variantId: line.variantId,
          name: product.name,
          variantSku: variant?.sku,
          requested: line.quantity,
          available,
        })),
      },
      { status: 400 },
    );
  }

  // Recompute pricing server-side so the cart cannot inject prices.
  // Variant `priceOverride` (when set) wins over tier/promo/reseller
  // pricing — it's an explicit per-variant override.
  let subtotal = 0;
  let itemCount = 0;
  let weightGram = 0;
  const lineItems = dedupedItems.map((line) => {
    const product = resolved.get(line.productId)!;
    const variant = line.variantId
      ? product.variants.find((v) => v.id === line.variantId)
      : undefined;
    // Use `!= null` (not truthy) so a legitimate priceOverride of 0
    // is honoured. The cart already uses `?? product.retailPrice` for
    // its display, so without this fix the cart would show 0 while
    // the server charges full price.
    const pricing = variant?.priceOverride != null
      ? {
          unitPrice: variant.priceOverride,
          subtotal: variant.priceOverride * line.quantity,
          appliedType: "retail" as const,
          tierLabel: null,
        }
      : calculatePrice(
          {
            retailPrice: product.retailPrice,
            promotionalPrice: product.promotionalPrice,
            resellerPrice: product.resellerPrice,
            priceTiers: product.priceTiers,
          },
          line.quantity,
          isReseller,
        );
    subtotal += pricing.subtotal;
    itemCount += line.quantity;
    weightGram += product.weightGram * line.quantity;
    return { product, variant, line, pricing };
  });

  const weightKg = Math.max(0.5, weightGram / 1000);
  const shippingCost = Math.ceil(weightKg) * shipping.costPerKg;
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const supabase = getAdminClient();

  if (!supabase) {
    // Dev fallback: no Supabase configured. Return a stub response so the
    // checkout flow keeps working without persistence.
    return NextResponse.json({
      orderNumber,
      subtotal,
      shippingCost,
      total,
      itemCount,
      shippingLabel: `${shipping.courier} ${shipping.service}`,
      paymentMethod,
      persisted: false,
    });
  }

  // Upsert customer (matched by email).
  const { data: customerRow, error: customerErr } = await supabase
    .from("customers")
    .upsert(
      {
        email: customer.email,
        full_name: customer.fullName,
        phone: customer.phone,
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();
  if (customerErr) {
    return NextResponse.json(
      { error: `customer upsert failed: ${customerErr.message}` },
      { status: 500 },
    );
  }

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerRow.id,
      customer_email: customer.email,
      customer_name: customer.fullName,
      customer_phone: customer.phone,
      shipping_province: address.province,
      shipping_city: address.city,
      shipping_district: address.district,
      shipping_postal_code: address.postalCode,
      shipping_address: address.address,
      shipping_notes: address.notes ?? null,
      shipping_courier: shipping.courier,
      shipping_service: shipping.service,
      shipping_cost: shippingCost,
      payment_method: paymentMethod,
      subtotal,
      total,
      item_count: itemCount,
      weight_gram: weightGram,
      status: "pending",
    })
    .select("id")
    .single();
  if (orderErr) {
    return NextResponse.json(
      { error: `order insert failed: ${orderErr.message}` },
      { status: 500 },
    );
  }

  const { error: itemsErr } = await supabase.from("order_items").insert(
    lineItems.map(({ product, variant, line, pricing }) => {
      const variantLabel = variant
        ? [variant.color, variant.type, variant.size].filter(Boolean).join(" · ")
        : null;
      return {
        order_id: orderRow.id,
        product_id: product.rowId ?? null,
        product_slug: product.slug,
        product_sku: product.sku,
        product_name: product.name,
        variant_id: variant?.id ?? null,
        variant_label: variantLabel || null,
        variant_color: variant?.color ?? null,
        variant_type: variant?.type ?? null,
        variant_size: variant?.size ?? null,
        quantity: line.quantity,
        unit_price: pricing.unitPrice,
        tier_label: pricing.tierLabel,
        subtotal: pricing.subtotal,
      };
    }),
  );
  if (itemsErr) {
    // Best-effort rollback so we don't leave a headless order.
    await supabase.from("orders").delete().eq("id", orderRow.id);
    return NextResponse.json(
      { error: `order items insert failed: ${itemsErr.message}` },
      { status: 500 },
    );
  }

  // Atomically decrement stock now that the order is persisted.
  // The earlier per-line stock check (around line 322) only rules
  // out obvious overselling at the time of the request; between that
  // check and the inserts above, another concurrent order could have
  // depleted the same product/variant. The RPC re-checks each row
  // under its own UPDATE (`stock >= quantity`) and raises if any
  // item no longer has enough, which lets us roll the order back
  // instead of silently overselling.
  const { error: decErr } = await supabase.rpc("decrement_stock_atomic", {
    p_items: lineItems.map(({ product, variant, line }) => ({
      product_id: variant ? null : product.rowId ?? null,
      variant_id: variant?.id ?? null,
      quantity: line.quantity,
    })),
  });
  if (decErr) {
    // Roll back order + items (items cascade on order delete).
    await supabase.from("order_items").delete().eq("order_id", orderRow.id);
    await supabase.from("orders").delete().eq("id", orderRow.id);
    const msg = decErr.message.includes("insufficient stock")
      ? "Stok tidak mencukupi, silakan coba lagi."
      : `stock decrement failed: ${decErr.message}`;
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  return NextResponse.json({
    orderNumber,
    subtotal,
    shippingCost,
    total,
    itemCount,
    shippingLabel: `${shipping.courier} ${shipping.service}`,
    paymentMethod,
    persisted: true,
  });
}
