import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: Props) {
  return (
    <section className="bg-[color:var(--color-cloud-100)] border-b border-[color:var(--color-line)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center flex-wrap gap-1 text-xs text-[color:var(--color-muted)]">
              <li>
                <Link href="/" className="inline-flex items-center hover:text-[color:var(--color-navy-900)]">
                  <Home className="h-3.5 w-3.5" />
                </Link>
              </li>
              {breadcrumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-[color:var(--color-cloud-300)]" />
                  {c.href ? (
                    <Link href={c.href} className="hover:text-[color:var(--color-navy-900)]">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-[color:var(--color-ink)] font-medium">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[color:var(--color-ink)]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-[color:var(--color-muted)]">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
