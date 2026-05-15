import { NextResponse } from "next/server";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { adminClientOrError } from "@/lib/admin/api";
import { revalidateCatalog } from "@/lib/admin/revalidate";
import { ProductSchema, productToRow } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_COLUMNS = [
  "slug",
  "sku",
  "name",
  "short_description",
  "description",
  "category_slug",
  "category_label",
  "gender",
  "style",
  "frame",
  "retail_price",
  "stock",
  "weight_gram",
  "frame_color",
];

type RawRow = Record<string, string>;

function parseInteger(value: string | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(String(value).replace(/[^\d-]/g, ""));
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

function parseOptionalInt(value: string | undefined): number | null {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  const n = parseInteger(value);
  return Number.isNaN(n) ? null : n;
}

function parseBool(value: string | undefined): boolean {
  if (!value) return false;
  return /^(1|true|yes|y|t|ya)$/i.test(String(value).trim());
}

function parseFloatVal(value: string | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return String(value)
    .split(/[|,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitPipeList(value: string | undefined): string[] {
  if (value === undefined || value === null) return [];
  if (String(value).trim() === "") return [];
  return String(value).split("|").map((s) => s.trim());
}

async function rowsFromFile(
  file: File,
): Promise<{ rows: RawRow[]; error?: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
    const sheet = wb.worksheets[0];
    if (!sheet) return { rows: [], error: "Spreadsheet has no sheets." };
    const headerRow = sheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber - 1] = String(cell.value ?? "").trim();
    });
    const rows: RawRow[] = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const obj: RawRow = {};
      headers.forEach((h, idx) => {
        if (!h) return;
        const v = row.getCell(idx + 1).value;
        obj[h] =
          v === null || v === undefined
            ? ""
            : typeof v === "object" && "text" in (v as object)
              ? String((v as { text?: unknown }).text ?? "")
              : String(v);
      });
      rows.push(obj);
    });
    return { rows };
  }
  // CSV / TSV
  const text = buf.toString("utf-8").replace(/^\uFEFF/, "");
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });
  if (result.errors && result.errors.length > 0) {
    return {
      rows: [],
      error: `CSV parse error: ${result.errors[0].message}`,
    };
  }
  return { rows: result.data ?? [] };
}

export async function POST(request: Request) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File terlalu besar (maksimal 5MB)" },
      { status: 400 },
    );
  }

  const { rows, error: parseErr } = await rowsFromFile(file);
  if (parseErr) {
    return NextResponse.json({ error: parseErr }, { status: 400 });
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: "File kosong" }, { status: 400 });
  }
  const missingCols = REQUIRED_COLUMNS.filter(
    (c) => !Object.prototype.hasOwnProperty.call(rows[0], c),
  );
  if (missingCols.length > 0) {
    return NextResponse.json(
      { error: `Kolom wajib hilang: ${missingCols.join(", ")}` },
      { status: 400 },
    );
  }

  // Pre-load existing slug/SKU index so we can decide insert vs update
  // and surface duplicate errors per row instead of letting the DB
  // unique constraint reject the whole batch.
  const { data: existing, error: existingErr } = await ctx.supabase
    .from("products")
    .select("id, slug, sku");
  if (existingErr) {
    return NextResponse.json({ error: existingErr.message }, { status: 500 });
  }
  const slugToId = new Map<string, string>();
  const skuToId = new Map<string, string>();
  for (const r of (existing ?? []) as { id: string; slug: string; sku: string }[]) {
    slugToId.set(r.slug, r.id);
    skuToId.set(r.sku, r.id);
  }

  const failed: { row: number; sku?: string; reason: string }[] = [];
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNumber = i + 2; // header is row 1
    const sku = String(raw.sku ?? "").trim();
    const slug = String(raw.slug ?? "").trim();
    if (!slug || !sku) {
      failed.push({ row: rowNumber, sku, reason: "slug atau sku kosong" });
      continue;
    }

    // Cross-row collision: same SKU mapped to a different slug somewhere
    // else in the existing catalog.
    const existingBySlug = slugToId.get(slug);
    const existingBySku = skuToId.get(sku);
    if (existingBySlug && existingBySku && existingBySlug !== existingBySku) {
      failed.push({
        row: rowNumber,
        sku,
        reason: `slug "${slug}" dan sku "${sku}" merujuk ke produk berbeda`,
      });
      continue;
    }
    const targetId = existingBySlug ?? existingBySku ?? null;

    const candidate = {
      slug,
      sku,
      name: String(raw.name ?? "").trim(),
      short_description: String(raw.short_description ?? "").trim(),
      description: String(raw.description ?? "").trim(),
      category_slug: String(raw.category_slug ?? "").trim(),
      category_label: String(raw.category_label ?? "").trim(),
      gender: String(raw.gender ?? "unisex")
        .trim()
        .toLowerCase(),
      style: String(raw.style ?? "casual")
        .trim()
        .toLowerCase(),
      frame: String(raw.frame ?? "classic")
        .trim()
        .toLowerCase(),
      retail_price: parseInteger(raw.retail_price),
      promotional_price: parseOptionalInt(raw.promotional_price),
      reseller_price: parseOptionalInt(raw.reseller_price),
      min_wholesale_qty: parseInteger(raw.min_wholesale_qty),
      stock: parseInteger(raw.stock),
      weight_gram: parseInteger(raw.weight_gram),
      is_featured: parseBool(raw.is_featured),
      is_best_seller: parseBool(raw.is_best_seller),
      is_new_arrival: parseBool(raw.is_new_arrival),
      rating: Math.min(5, Math.max(0, parseFloatVal(raw.rating))),
      review_count: parseInteger(raw.review_count),
      image_urls: splitList(raw.image_urls).filter((u) => /^https?:\/\//i.test(u)),
      frame_color: String(raw.frame_color ?? "black")
        .trim()
        .toLowerCase(),
      lens_color: raw.lens_color
        ? String(raw.lens_color).trim().toLowerCase()
        : null,
      specs: [],
      price_tiers: [],
      variants: (() => {
        const vSkus = splitPipeList(raw.variant_skus);
        if (vSkus.length === 0) return [];
        const vColors = splitPipeList(raw.variant_colors);
        const vTypes = splitPipeList(raw.variant_types);
        const vSizes = splitPipeList(raw.variant_sizes);
        const vStocks = splitPipeList(raw.variant_stocks);
        const vPrices = splitPipeList(raw.variant_prices);
        const vImages = splitPipeList(raw.variant_images);
        
        return vSkus.map((vSku, idx) => ({
          sku: vSku,
          color: vColors[idx] || null,
          variant_type: vTypes[idx] || null,
          size: vSizes[idx] || null,
          stock: parseInteger(vStocks[idx]),
          price_override: parseOptionalInt(vPrices[idx]),
          image_url: vImages[idx] || null,
          sort_order: idx,
        }));
      })(),
    };

    const parsed = ProductSchema.safeParse(candidate);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      failed.push({
        row: rowNumber,
        sku,
        reason: `${first.path.join(".") || "row"}: ${first.message}`,
      });
      continue;
    }

    const dbRow = productToRow(parsed.data);
    if (targetId) {
      const { error: upErr } = await ctx.supabase
        .from("products")
        .update(dbRow)
        .eq("id", targetId);
      if (upErr) {
        failed.push({ row: rowNumber, sku, reason: upErr.message });
        continue;
      }
      updated += 1;
    } else {
      const { data: ins, error: insErr } = await ctx.supabase
        .from("products")
        .insert(dbRow)
        .select("id")
        .maybeSingle<{ id: string }>();
      if (insErr || !ins) {
        failed.push({
          row: rowNumber,
          sku,
          reason: insErr?.message ?? "insert failed",
        });
        continue;
      }
      slugToId.set(slug, ins.id);
      skuToId.set(sku, ins.id);
      inserted += 1;
    }
    
    const finalId = targetId ?? slugToId.get(slug);
    if (finalId) {
      const { error: varErr } = await ctx.supabase.rpc("replace_product_variants", {
        p_product_id: finalId,
        p_variants: parsed.data.variants.map((v, idx) => ({
          id: v.id ?? null,
          sku: v.sku,
          color: v.color ?? null,
          variant_type: v.variant_type ?? null,
          size: v.size ?? null,
          stock: v.stock,
          price_override: v.price_override ?? null,
          image_url: v.image_url ?? null,
          sort_order: v.sort_order ?? idx,
        })),
      });
      if (varErr) {
        failed.push({
          row: rowNumber,
          sku,
          reason: `Variants import failed: ${varErr.message}`,
        });
      }
    }
  }

  if (inserted > 0 || updated > 0) {
    revalidateCatalog();
  }
  return NextResponse.json({ inserted, updated, failed });
}
