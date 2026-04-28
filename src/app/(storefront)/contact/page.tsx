import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ContactForm from "./ContactForm";
import {
  STORE_ADDRESS,
  STORE_PHONE,
  SUPPORT_EMAIL,
  whatsappLink,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Juragan Grosir — WhatsApp support, email, or in-person at our Jakarta warehouse.",
};

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Contact"
        title="We're here to help."
        description="Reach our team via WhatsApp for the fastest response, or send us a message and we'll get back within one business day."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Get in touch</h2>
          <ul className="mt-6 space-y-4">
            <li className="card p-5 flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#25D366]/10 text-[#1a8b4a] flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">WhatsApp support</div>
                <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                  Fastest way to reach us. Average reply time 5 min during
                  business hours (9am–6pm WIB).
                </p>
                <a
                  href={whatsappLink("Halo Juragan Grosir, saya butuh bantuan tentang…")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex btn !bg-[#25D366] !text-white !border-[#25D366] !py-2 !px-3 text-xs"
                >
                  Chat with us
                </a>
              </div>
            </li>
            <li className="card p-5 flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[color:var(--color-cloud-100)] text-[color:var(--color-navy-900)] flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Phone</div>
                <a
                  href={`tel:${STORE_PHONE.replace(/\s+/g, "")}`}
                  className="text-sm text-[color:var(--color-navy-900)] hover:underline"
                >
                  {STORE_PHONE}
                </a>
              </div>
            </li>
            <li className="card p-5 flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[color:var(--color-cloud-100)] text-[color:var(--color-navy-900)] flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Email</div>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-sm text-[color:var(--color-navy-900)] hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </li>
            <li className="card p-5 flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[color:var(--color-cloud-100)] text-[color:var(--color-navy-900)] flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Warehouse & office</div>
                <p className="text-sm text-[color:var(--color-muted)] mt-0.5">
                  {STORE_ADDRESS}
                </p>
                <p className="text-xs text-[color:var(--color-muted)] mt-1">
                  Open Mon–Sat, 9am–6pm WIB. Visits by appointment.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
