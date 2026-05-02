"use client";

import { whatsappLink } from "@/lib/constants";

export default function WhatsAppFloat() {
  const href = whatsappLink(
    "Halo Juragan Grosir, saya ingin bertanya tentang produknya.",
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp dengan kami"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition-transform"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        aria-hidden
        fill="currentColor"
      >
        <path d="M19.11 17.4c-.34-.17-2.02-.99-2.33-1.1-.31-.11-.54-.17-.77.17-.23.34-.88 1.1-1.08 1.33-.2.23-.4.26-.74.09-.34-.17-1.45-.53-2.76-1.7-1.02-.91-1.7-2.04-1.9-2.38-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.06-2.55-.28-.67-.57-.58-.77-.59-.2-.01-.43-.01-.66-.01-.23 0-.6.09-.91.43-.31.34-1.2 1.18-1.2 2.86 0 1.69 1.23 3.31 1.4 3.54.17.23 2.42 3.7 5.86 5.18.82.35 1.46.57 1.96.73.82.26 1.57.22 2.16.13.66-.1 2.02-.83 2.31-1.63.29-.8.29-1.49.2-1.63-.09-.14-.31-.23-.65-.4Z" />
        <path d="M12 2a10 10 0 0 0-8.5 15.27L2 22l4.85-1.47A10 10 0 1 0 12 2Zm0 18.18a8.18 8.18 0 0 1-4.17-1.14l-.3-.18-2.88.88.92-2.81-.2-.31A8.18 8.18 0 1 1 12 20.18Z" />
      </svg>
      <span className="hidden sm:inline text-sm font-semibold">Chat dengan kami</span>
    </a>
  );
}
