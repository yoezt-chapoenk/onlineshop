import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms and conditions that govern your use of the Juragan Grosir website and services."
      breadcrumbLabel="Terms of Service"
      sections={[
        {
          heading: "1. Acceptance of terms",
          body: [
            "By accessing or using the Juragan Grosir website, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.",
          ],
        },
        {
          heading: "2. Account registration",
          body: [
            "You are responsible for maintaining the confidentiality of your account credentials. We reserve the right to suspend accounts that violate these terms or engage in fraudulent activity.",
          ],
        },
        {
          heading: "3. Pricing & orders",
          body: [
            "Retail pricing applies by default. Wholesale tier pricing applies automatically when minimum quantities are reached. Reseller pricing requires an approved reseller account.",
            "Order amounts are recalculated server-side before payment is created. We reserve the right to cancel orders with pricing errors before payment confirmation.",
          ],
        },
        {
          heading: "4. Intellectual property",
          body: [
            "All content on this site — including product photography, illustrations, and brand assets — is the property of Juragan Grosir or its licensors.",
          ],
        },
        {
          heading: "5. Limitation of liability",
          body: [
            "Juragan Grosir is not liable for indirect, incidental, or consequential damages arising from the use of our products or services.",
          ],
        },
      ]}
    />
  );
}
