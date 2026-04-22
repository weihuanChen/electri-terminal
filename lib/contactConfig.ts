export interface PublicContactChannel {
  enabled: boolean;
  value: string;
}

export interface PublicWhatsAppChannel extends PublicContactChannel {
  href?: string;
}

export interface PublicAddressChannel {
  enabled: boolean;
  lines: string[];
}

export interface PublicSocialMediaLink {
  platform: string;
  label?: string;
  url: string;
  enabled: boolean;
}

export interface PublicSocialMediaChannel {
  enabled: boolean;
  items: PublicSocialMediaLink[];
}

export interface PublicContactSettings {
  email: PublicContactChannel;
  whatsapp: PublicWhatsAppChannel;
  phone: PublicContactChannel;
  address: PublicAddressChannel;
  socialMedia: PublicSocialMediaChannel;
}

export const DEFAULT_PUBLIC_CONTACT_SETTINGS: PublicContactSettings = {
  email: {
    enabled: true,
    value: "sales@electriterminal.com",
  },
  whatsapp: {
    enabled: true,
    value: "+1 555 123 4567",
    href: "https://wa.me/15551234567",
  },
  phone: {
    enabled: false,
    value: "+1 (555) 123-4567",
  },
  address: {
    enabled: true,
    lines: [
      "123 Industrial Avenue",
      "Technology District",
      "City, State 12345",
      "United States",
    ],
  },
  socialMedia: {
    enabled: false,
    items: [],
  },
};

export function normalizePublicContactSettings(
  settings?: Partial<PublicContactSettings> | null
): PublicContactSettings {
  const email = settings?.email;
  const whatsapp = settings?.whatsapp;
  const phone = settings?.phone;
  const address = settings?.address;
  const socialMedia = settings?.socialMedia;

  return {
    email: {
      enabled:
        typeof email?.enabled === "boolean"
          ? email.enabled
          : DEFAULT_PUBLIC_CONTACT_SETTINGS.email.enabled,
      value: (email?.value || DEFAULT_PUBLIC_CONTACT_SETTINGS.email.value).trim(),
    },
    whatsapp: {
      enabled:
        typeof whatsapp?.enabled === "boolean"
          ? whatsapp.enabled
          : DEFAULT_PUBLIC_CONTACT_SETTINGS.whatsapp.enabled,
      value: (whatsapp?.value || DEFAULT_PUBLIC_CONTACT_SETTINGS.whatsapp.value).trim(),
      href: whatsapp?.href?.trim() || DEFAULT_PUBLIC_CONTACT_SETTINGS.whatsapp.href,
    },
    phone: {
      enabled:
        typeof phone?.enabled === "boolean"
          ? phone.enabled
          : DEFAULT_PUBLIC_CONTACT_SETTINGS.phone.enabled,
      value: (phone?.value || DEFAULT_PUBLIC_CONTACT_SETTINGS.phone.value).trim(),
    },
    address: {
      enabled:
        typeof address?.enabled === "boolean"
          ? address.enabled
          : DEFAULT_PUBLIC_CONTACT_SETTINGS.address.enabled,
      lines: normalizeAddressLines(address?.lines, DEFAULT_PUBLIC_CONTACT_SETTINGS.address.lines),
    },
    socialMedia: {
      enabled:
        typeof socialMedia?.enabled === "boolean"
          ? socialMedia.enabled
          : DEFAULT_PUBLIC_CONTACT_SETTINGS.socialMedia.enabled,
      items: Array.isArray(socialMedia?.items)
        ? socialMedia.items
            .filter((item): item is PublicSocialMediaLink => Boolean(item?.platform && item?.url))
            .map((item) => ({
              platform: item.platform.trim(),
              label: item.label?.trim() || undefined,
              url: item.url.trim(),
              enabled: Boolean(item.enabled),
            }))
        : DEFAULT_PUBLIC_CONTACT_SETTINGS.socialMedia.items,
    },
  };
}

function normalizeAddressLines(lines: string[] | undefined, fallback: string[]) {
  if (!Array.isArray(lines)) {
    return [...fallback];
  }

  const sanitized = lines.map((line) => line.trim()).filter(Boolean);
  return sanitized.length > 0 ? sanitized : [...fallback];
}

export function toSingleLineAddress(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean).join(", ");
}
