import { v } from "convex/values";

export const SITE_SETTINGS_GLOBAL_KEY = "global";

export const socialMediaLinkValidator = v.object({
  platform: v.string(),
  label: v.optional(v.string()),
  url: v.string(),
  enabled: v.boolean(),
});

export const socialMediaSettingsValidator = v.object({
  enabled: v.boolean(),
  items: v.array(socialMediaLinkValidator),
});

export const contactSettingsValidator = v.object({
  email: v.object({
    enabled: v.boolean(),
    value: v.string(),
  }),
  whatsapp: v.object({
    enabled: v.boolean(),
    value: v.string(),
    href: v.optional(v.string()),
  }),
  phone: v.object({
    enabled: v.boolean(),
    value: v.string(),
  }),
  address: v.object({
    enabled: v.boolean(),
    lines: v.array(v.string()),
  }),
  socialMedia: v.optional(socialMediaSettingsValidator),
});

type SocialMediaLink = {
  platform: string;
  label?: string;
  url: string;
  enabled: boolean;
};

type ContactSettings = {
  email: {
    enabled: boolean;
    value: string;
  };
  whatsapp: {
    enabled: boolean;
    value: string;
    href?: string;
  };
  phone: {
    enabled: boolean;
    value: string;
  };
  address: {
    enabled: boolean;
    lines: string[];
  };
  socialMedia?: {
    enabled: boolean;
    items: SocialMediaLink[];
  };
};

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
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

export function normalizeContactSettings(
  settings?: ContactSettings | null
): ContactSettings {
  const base = settings ?? DEFAULT_CONTACT_SETTINGS;
  const whatsappHref = base.whatsapp.href?.trim();
  const resolvedWhatsAppHref = whatsappHref || buildWhatsAppHref(base.whatsapp.value);

  return {
    email: {
      enabled: Boolean(base.email.enabled),
      value: (base.email.value || DEFAULT_CONTACT_SETTINGS.email.value).trim(),
    },
    whatsapp: {
      enabled: Boolean(base.whatsapp.enabled),
      value: (base.whatsapp.value || DEFAULT_CONTACT_SETTINGS.whatsapp.value).trim(),
      href: resolvedWhatsAppHref || DEFAULT_CONTACT_SETTINGS.whatsapp.href,
    },
    phone: {
      enabled: Boolean(base.phone.enabled),
      value: (base.phone.value || DEFAULT_CONTACT_SETTINGS.phone.value).trim(),
    },
    address: {
      enabled: Boolean(base.address.enabled),
      lines: normalizeAddressLines(base.address.lines),
    },
    socialMedia: {
      enabled: Boolean(base.socialMedia?.enabled),
      items: (base.socialMedia?.items ?? [])
        .map((item) => ({
          platform: item.platform.trim(),
          label: item.label?.trim() || undefined,
          url: item.url.trim(),
          enabled: Boolean(item.enabled),
        }))
        .filter((item) => Boolean(item.platform) && Boolean(item.url)),
    },
  };
}

function normalizeAddressLines(lines?: string[]) {
  const sanitized = (lines ?? []).map((line) => line.trim()).filter(Boolean);
  return sanitized.length > 0 ? sanitized : [...DEFAULT_CONTACT_SETTINGS.address.lines];
}

function buildWhatsAppHref(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}
