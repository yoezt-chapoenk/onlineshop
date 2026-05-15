import Link from "next/link";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";
import { getCategories } from "@/lib/data";
import type { CategorySlug } from "@/lib/types";

interface Tile {
  match: CategorySlug;
  label: string;
  subtitle: string;
  href: string;
  color: string;
  shape: "aviator" | "round" | "cateye";
}

// Visual presentation for the 3 hero collection tiles. The actual product
// count for each tile is pulled from the categories table at render time —
// previously the counts were hardcoded ("24 styles" etc.) which drifted
// from the truth as the catalog grew.
const TILES: Tile[] = [
  {
    match: "sunglasses",
    label: "Sunglasses",
    subtitle: "Polarised & UV400",
    href: "/collections/sunglasses",
    color: "#c9a96e",
    shape: "aviator",
  },
  {
    match: "eyeglasses",
    label: "Optical",
    subtitle: "Prescription ready",
    href: "/collections/eyeglasses",
    color: "#e8ddd0",
    shape: "round",
  },
  {
    match: "accessories",
    label: "Limited",
    subtitle: "Archive editions",
    href: "/collections/accessories",
    color: "#4a3728",
    shape: "cateye",
  },
];

export default async function CollectionsSection() {
  const categories = await getCategories();
  const countBySlug = new Map(categories.map((c) => [c.slug, c.productCount]));

  return (
    <section className="collections-section">
      <div className="collections-section__header">
        <div>
          <div className="collections-section__eyebrow">Categories</div>
          <h2 className="collections-section__title">Shop by Collection</h2>
        </div>
        <Link href="/collections" className="collections-section__view-all">
          View All →
        </Link>
      </div>
      <div className="collections-section__grid">
        {TILES.map((tile) => {
          const count = countBySlug.get(tile.match) ?? 0;
          return (
            <Link key={tile.match} href={tile.href} className="collection-tile">
              <div className="collection-tile__art">
                <GlassesPlaceholder color={tile.color} shape={tile.shape} width={160} height={80} />
              </div>
              <div className="collection-tile__count">{count} styles</div>
              <div className="collection-tile__name">{tile.label}</div>
              <div className="collection-tile__subtitle">{tile.subtitle}</div>
              <div className="collection-tile__arrow">→</div>
              <div className="collection-tile__rule" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
