import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = [
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
  "promotional_price",
  "reseller_price",
  "min_wholesale_qty",
  "stock",
  "weight_gram",
  "is_featured",
  "is_best_seller",
  "is_new_arrival",
  "rating",
  "review_count",
  "colors",
  "frame_color",
  "lens_color",
  "image_urls",
];

const EXAMPLE = [
  "jg-classic-black",
  "JG-CLB-001",
  "JG Classic Black",
  "Bingkai klasik hitam matte untuk gaya sehari-hari.",
  "Bingkai full-frame asetat hitam matte dengan engsel ringan dan lensa polikarbonat anti-gores. Cocok untuk wajah oval hingga persegi.",
  "eyeglasses",
  "Eyeglasses",
  "unisex",
  "casual",
  "classic",
  "145000",
  "",
  "110000",
  "6",
  "120",
  "32",
  "true",
  "false",
  "false",
  "4.7",
  "128",
  "Hitam|Coklat",
  "black",
  "clear",
  "https://example.com/uploads/jg-classic-black-1.jpg|https://example.com/uploads/jg-classic-black-2.jpg",
];

function csvEscape(value: string): string {
  // Wrap in quotes if value contains comma, quote, or newline. Always
  // prefix with single quote when starting with =,+,-,@ to avoid CSV
  // formula injection in spreadsheet apps.
  let v = value;
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET() {
  const lines = [
    HEADERS.map(csvEscape).join(","),
    EXAMPLE.map(csvEscape).join(","),
  ];
  const body = lines.join("\n") + "\n";
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="juragan-grosir-products-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
