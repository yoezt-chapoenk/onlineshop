import type { Metadata } from "next";
import { getCategories, getProductSummaries } from "@/lib/data";
import ShopClient from "./ShopClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Belanja",
  description:
    "Telusuri seluruh katalog kacamata Juragan Grosir dengan harga retail dan grosir bertingkat.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProductSummaries(),
    getCategories(),
  ]);
  return <ShopClient products={products} categories={categories} />;
}
