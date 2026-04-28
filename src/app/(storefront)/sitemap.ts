import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  const lastModified = new Date();
  const staticRoutes = [
    "/",
    "/shop",
    "/collections",
    "/about",
    "/wholesale",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/returns",
    "/legal/shipping",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }));

  const productRoutes = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.slug}`,
    lastModified,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
