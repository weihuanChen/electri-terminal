import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  generateLocalizedRouteMetadata,
  isLocale,
  normalizePublicPath,
  renderLocalizedRoutePage,
} from "@/lib/i18n";

type LocaleRoutePageProps = {
  params: Promise<{
    locale: string;
    path?: string[];
  }>;
};

function getRequestedPath(path?: string[]) {
  return normalizePublicPath(path && path.length > 0 ? `/${path.join("/")}` : "/");
}

export async function generateMetadata({
  params,
}: LocaleRoutePageProps): Promise<Metadata> {
  const { locale, path } = await params;
  if (!isLocale(locale)) {
    return {
      title: "Not found",
      alternates: undefined,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return generateLocalizedRouteMetadata({
    locale,
    path: getRequestedPath(path),
  });
}

export default async function LocaleRoutePage({ params }: LocaleRoutePageProps) {
  const { locale, path } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return renderLocalizedRoutePage({
    locale,
    path: getRequestedPath(path),
  });
}
