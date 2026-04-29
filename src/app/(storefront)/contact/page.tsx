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
  title: "Kontak",
  description:
    "Hubungi Juragan Grosir — dukungan WhatsApp, email, atau langsung di gudang Jakarta kami.",
};

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Kontak"
        title="Kami siap membantu."
        description="Hubungi tim kami via WhatsApp untuk respons tercepat, atau kirim pesan dan kami akan membalas dalam satu hari kerja."
        breadcrumbs={[{ label: "Kontak" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Hubungi kami</h2>
          <ul className="mt-6 space-y-4">
            <li className="card p-5 flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#25D366]/10 text-[#1a8b4a] flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Dukungan WhatsApp</div>
                <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                  Cara tercepat menghubungi kami. Rata-rata balas 5 menit
                  pada jam kerja (09.00–18.00 WIB).
                </p>
                <a
                  href={whatsappLink("Halo Juragan Grosir, saya butuh bantuan tentang…")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex btn !bg-[#25D366] !text-white !border-[#25D366] !py-2 !px-3 text-xs"
                >
                  Chat dengan kami
                </a>
              </div>
            </li>
            <li className="card p-5 flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-[color:var(--color-cloud-100)] text-[color:var(--color-navy-900)] flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Telepon</div>
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
                <div className="text-sm font-semibold">Gudang & kantor</div>
                <p className="text-sm text-[color:var(--color-muted)] mt-0.5">
                  {STORE_ADDRESS}
                </p>
                <p className="text-xs text-[color:var(--color-muted)] mt-1">
                  Buka Sen–Sab, 09.00–18.00 WIB. Kunjungan dengan janji temu.
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
