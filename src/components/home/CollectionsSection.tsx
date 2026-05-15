import Link from "next/link";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";

const COLLECTIONS = [
  { id: "sunglasses", name: "Sunglasses", href: "/collections/sunglasses", count: 24, subtitle: "Polarised & UV400", color: "#c9a96e", shape: "aviator" as const },
  { id: "optical", name: "Optical", href: "/collections/eyeglasses", count: 18, subtitle: "Prescription ready", color: "#e8ddd0", shape: "round" as const },
  { id: "limited", name: "Limited", href: "/collections/accessories", count: 6, subtitle: "Archive editions", color: "#4a3728", shape: "cateye" as const },
];

export default function CollectionsSection() {
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
        {COLLECTIONS.map((col) => (
          <Link key={col.id} href={col.href} className="collection-tile">
            <div className="collection-tile__art">
              <GlassesPlaceholder color={col.color} shape={col.shape} width={160} height={80} />
            </div>
            <div className="collection-tile__count">{col.count} styles</div>
            <div className="collection-tile__name">{col.name}</div>
            <div className="collection-tile__subtitle">{col.subtitle}</div>
            <div className="collection-tile__arrow">→</div>
            <div className="collection-tile__rule" />
          </Link>
        ))}
      </div>
    </section>
  );
}
