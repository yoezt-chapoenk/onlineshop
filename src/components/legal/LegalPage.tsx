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
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PageHeader
        eyebrow="Legal"
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Legal", href: "/legal/privacy" },
          { label: breadcrumbLabel },
        ]}
      />
      <article style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", width: "100%" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 32 }}>
          Last updated {lastUpdated}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 style={{ fontSize: 20, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 16 }}>{s.heading}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>
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
