import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
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
        quantity: z.number().int().positive().max(999),
      }),
    )
    .min(1),
});

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
}

async function resolveProducts(
  productIds: string[],
): Promise<Map<string, ResolvedProduct>> {
  const supabase = getAdminClient();
  if (!supabase) {
    const map = new Map<string, ResolvedProduct>();
    for (const p of seedProducts) {
      if (productIds.includes(p.id)) map.set(p.id, p);
    }
    return map;
  }
  // Seed product ids (e.g. "p-classic-black") won't match Supabase uuids, so
  // we always also look up by slug. We issue two parameterized queries
  // (.in() escapes values internally) and merge the results, instead of
  // building a manual .or() filter string that would be vulnerable to
  // PostgREST filter injection.
  const PRODUCT_COLUMNS =
    "id, slug, sku, name, retail_price, promotional_price, reseller_price, weight_gram, stock, product_price_tiers(min_qty, max_qty, unit_price, label)";
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

  // Server-side stock validation. The /cart and /shop/[slug] pages
  // already cap quantity at product.stock, but those limits run in the
  // browser and can be trivially bypassed by hitting this endpoint
  // directly. Reject any line whose quantity exceeds available stock
  // before we reserve an order number or write rows.
  const overstocked = items
    .map((line) => ({ line, product: resolved.get(line.productId)! }))
    .filter(({ line, product }) => line.quantity > product.stock);
  if (overstocked.length > 0) {
    return NextResponse.json(
      {
        error: "Some items exceed available stock",
        items: overstocked.map(({ line, product }) => ({
          productId: line.productId,
          name: product.name,
          requested: line.quantity,
          available: product.stock,
        })),
      },
      { status: 400 },
    );
  }

  // Recompute pricing server-side so the cart cannot inject prices.
  let subtotal = 0;
  let itemCount = 0;
  let weightGram = 0;
  const lineItems = items.map((line) => {
    const product = resolved.get(line.productId)!;
    const pricing = calculatePrice(
      {
        retailPrice: product.retailPrice,
        promotionalPrice: product.promotionalPrice,
        resellerPrice: product.resellerPrice,
        priceTiers: product.priceTiers,
      },
      line.quantity,
      false,
    );
    subtotal += pricing.subtotal;
    itemCount += line.quantity;
    weightGram += product.weightGram * line.quantity;
    return { product, line, pricing };
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
    lineItems.map(({ product, line, pricing }) => ({
      order_id: orderRow.id,
      product_id: product.rowId ?? null,
      product_slug: product.slug,
      product_sku: product.sku,
      product_name: product.name,
      quantity: line.quantity,
      unit_price: pricing.unitPrice,
      tier_label: pricing.tierLabel,
      subtotal: pricing.subtotal,
    })),
  );
  if (itemsErr) {
    // Best-effort rollback so we don't leave a headless order.
    await supabase.from("orders").delete().eq("id", orderRow.id);
    return NextResponse.json(
      { error: `order items insert failed: ${itemsErr.message}` },
      { status: 500 },
    );
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
