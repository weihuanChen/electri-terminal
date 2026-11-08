"use client";

import { usePathname } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";

interface FloatingContactClientProps {
  whatsappHref?: string;
  email?: string;
}

function shouldHide(pathname: string | null) {
  if (!pathname) return false;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  // The contact page already shows every channel next to the form.
  return /(^|\/)contact\/?$/.test(pathname);
}

/**
 * Persistent one-tap contact for B2B buyers who prefer chat/email over forms.
 * Clicks on wa.me / mailto links are tracked automatically by RouteAwareAnalytics
 * (whatsapp_click / email_click), tagged here with placement=floating.
 */
export default function FloatingContactClient({ whatsappHref, email }: FloatingContactClientProps) {
  const pathname = usePathname();

  if (shouldHide(pathname) || (!whatsappHref && !email)) {
    return null;
  }

  return (
    // Mobile: sits above FilterPanel's bottom-right filter button on catalog pages.
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      {email && (
        <a
          href={`mailto:${email}`}
          data-ga-event="floating_contact_click"
          data-ga-param-channel="email"
          aria-label={`Email us at ${email}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition-colors hover:border-primary hover:text-primary"
        >
          <Mail className="h-5 w-5" />
        </a>
      )}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-ga-event="floating_contact_click"
          data-ga-param-channel="whatsapp"
          className="flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#1EBE5A]"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">WhatsApp</span>
          <span className="sr-only sm:hidden">Chat on WhatsApp</span>
        </a>
      )}
    </div>
  );
}
