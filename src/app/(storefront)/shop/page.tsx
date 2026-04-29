import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Belanja",
  description:
    "Telusuri seluruh katalog kacamata Juragan Grosir dengan harga retail dan grosir bertingkat.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return <ShopClient products={products} categories={categories} />;
}
