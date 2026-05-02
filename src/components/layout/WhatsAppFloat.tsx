"use client";

import { whatsappLink } from "@/lib/constants";

import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  const href = whatsappLink(
    "Halo Juragan Grosir, saya ingin bertanya tentang produknya.",
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat dengan kami"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[color:var(--color-navy-900)] text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition-transform"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline text-sm font-semibold">Chat dengan kami</span>
    </a>
  );
}
