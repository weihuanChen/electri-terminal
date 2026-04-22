export const PUBLIC_ASSET_HOST = "assets.electriterminal.com";

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
