export const PUBLIC_ASSET_HOST = "assets.electriterminal.com";

export function buildPublicAssetUrl(objectKey: string) {
  return `https://${PUBLIC_ASSET_HOST}/${objectKey.replace(/^\/+/, "")}`;
}

export function shouldBypassNextImageOptimization(src?: string) {
  return Boolean(src?.trim());
}
