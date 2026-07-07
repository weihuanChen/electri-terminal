import { blogPageUrl } from "@/lib/routes";

export const BLOG_PAGE_SIZE = 9;

export function getBlogPageCount(totalItems: number, pageSize = BLOG_PAGE_SIZE) {
  return Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize));
}

export function getBlogPagePath(page: number) {
  return blogPageUrl(page);
}

export function parseBlogPageParam(value: string) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}
