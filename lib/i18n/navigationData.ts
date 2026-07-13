import "server-only";
import type { Locale } from "./config";
import type { LocalizationRecordV2 } from "./localizationModel";
import {
  buildNavigationEligibilitySnapshot,
  type NavigationEligibilitySnapshot,
} from "./navigationSafety";
import { queryPublicPage } from "@/lib/metadata";

export async function getNavigationEligibilitySnapshot(
  locale: Locale
): Promise<NavigationEligibilitySnapshot> {
  if (locale === "en") return buildNavigationEligibilitySnapshot(locale, []);
  const records = await queryPublicPage<LocalizationRecordV2[]>(
    "queries/modules/localizations:listLocalizations",
    { locale, status: "published", limit: 500 }
  );
  return buildNavigationEligibilitySnapshot(locale, records);
}
