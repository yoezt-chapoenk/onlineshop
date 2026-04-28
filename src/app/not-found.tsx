import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
      <span className="eyebrow">404</span>
      <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
        We can&apos;t find that page
      </h1>
      <p className="mt-3 text-sm text-[color:var(--color-muted)]">
        The page you&apos;re looking for may have been moved or no longer
        exists. Try the home page or browse our catalog.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          <Home className="h-4 w-4" /> Back to home
        </Link>
        <Link href="/shop" className="btn btn-outline">
          Browse products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
