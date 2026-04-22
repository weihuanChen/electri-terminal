const DEFAULT_SITE_URL = "https://electriterminal.com";

export function getSiteUrl() {
  const configuredSiteUrl =
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  return configuredSiteUrl.replace(/\/+$/, "");
}

export function toAbsoluteSiteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, `${getSiteUrl()}/`).toString();
}
