import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Juragan Grosir collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="We respect your privacy and are committed to protecting the personal information you share with us."
      breadcrumbLabel="Privacy Policy"
      sections={[
        {
          heading: "1. Information we collect",
          body: [
            "When you place an order or create an account, we collect identifying information such as your name, phone number, email, and shipping address.",
            "We also collect technical information such as IP address, device type, and browsing behaviour for analytics and fraud prevention.",
          ],
        },
        {
          heading: "2. How we use your information",
          body: [
            "Your information is used to fulfill orders, calculate shipping, process payments, send order updates, and improve our products and services.",
            "We never sell your personal information to third parties. We share data with service providers (payment, shipping, analytics) only to the extent required to operate our business.",
          ],
        },
        {
          heading: "3. Marketing communications",
          body: [
            "We may send marketing emails and WhatsApp messages about new collections, promotions, and reseller updates. You can opt out at any time via the unsubscribe link or by contacting support.",
          ],
        },
        {
          heading: "4. Cookies & tracking",
          body: [
            "We use cookies and pixels (Google Analytics, Meta Pixel, TikTok Pixel) to understand how customers use the site and to measure advertising effectiveness.",
          ],
        },
        {
          heading: "5. Your rights",
          body: [
            "You can request to access, update, or delete your personal information at any time by contacting us at support@juragangrosir.id.",
          ],
        },
      ]}
    />
  );
}
