import { revalidatePath } from "next/cache";

/**
 * Revalidate every storefront route that depends on the product catalog.
 * Call this from admin product/category/import mutations so changes appear
 * on the public site without waiting for the ISR window (currently 1h).
 *
 * Pass a product slug to also invalidate the detail page for that product.
 */
export function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath("/collections/[category]", "page");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/shop/${slug}`);
  } else {
    // Bulk import / category rename — invalidate all product detail pages
    revalidatePath("/shop/[slug]", "page");
  }
}

/** Revalidate blog routes after article create/update/delete. */
export function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  } else {
    revalidatePath("/blog/[slug]", "page");
  }
}
