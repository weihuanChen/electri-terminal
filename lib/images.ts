export const PUBLIC_ASSET_HOST = "assets.electriterminal.com";
const NEXT_IMAGE_OPTIMIZABLE_HOSTS = new Set([
  PUBLIC_ASSET_HOST,
  "images.unsplash.com",
  "plus.unsplash.com",
]);

export function buildPublicAssetUrl(objectKey: string) {
  return `https://${PUBLIC_ASSET_HOST}/${objectKey.replace(/^\/+/, "")}`;
}

export function shouldBypassNextImageOptimization(src?: string) {
  if (!src) {
    return false;
  }

  try {
    const url = new URL(src);
    return url.hostname === PUBLIC_ASSET_HOST;
  } catch {
    return false;
  }
}

export function shouldUseUnoptimizedImage(src?: string) {
  if (!src?.trim()) {
    return false;
  }

  const normalized = src.trim();
  if (normalized.startsWith("/")) {
    return false;
  }

  try {
    const url = new URL(normalized);
    return !NEXT_IMAGE_OPTIMIZABLE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
