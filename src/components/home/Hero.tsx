import Link from "next/link";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";

// Hero is a Server Component. All hover/animation state is driven by CSS
// in globals.css (`.hero-*` classes), so the 100vh markup ships as zero
// client JS. The decorative rings used to have 120px box-shadows + a
// drop-shadow filter on the glasses — together that triggered a heavy
// composite + paint pass on first frame. The simplified rings rely on
// border + radial-gradient instead.

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__ring hero__ring--lg" aria-hidden="true" />
      <div className="hero__ring hero__ring--sm" aria-hidden="true" />

      <div className="hero__product" aria-hidden="true">
        <GlassesPlaceholder color="#7eb3e8" shape="oval" width={280} height={140} />
        <span className="hero__product-caption">Riviera — Matte Noir</span>
      </div>

      <div className="hero__content">
        <div className="hero__eyebrow">SS 2026 Collection</div>
        <h1 className="hero__title">
          See the world<br />
          <em>differently.</em>
        </h1>
        <p className="hero__lede">
          Handcrafted eyewear for those who consider every detail. Italian acetate, Japanese hinges, lifetime craftsmanship.
        </p>
        <div className="hero__ctas">
          <Link href="/shop" className="hero__cta hero__cta--primary">
            Shop Now
          </Link>
          <Link href="/collections" className="hero__cta hero__cta--ghost">
            View Collections
          </Link>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
