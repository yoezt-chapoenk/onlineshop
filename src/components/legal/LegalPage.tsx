import PageHeader from "@/components/ui/PageHeader";

interface Section {
  heading: string;
  body: string[];
}

interface Props {
  title: string;
  description: string;
  breadcrumbLabel: string;
  sections: Section[];
  lastUpdated?: string;
}

export default function LegalPage({
  title,
  description,
  breadcrumbLabel,
  sections,
  lastUpdated = "January 2026",
}: Props) {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Legal", href: "/legal/privacy" },
          { label: breadcrumbLabel },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-xs text-[color:var(--color-muted)] uppercase tracking-wider">
          Last updated {lastUpdated}
        </p>
        <div className="mt-8 space-y-9">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">{s.heading}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[color:var(--color-muted)]">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
