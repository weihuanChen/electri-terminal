import { headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  I18N_REQUEST_LOCALE_HEADER,
  isLocale,
  type Locale,
} from "./config";

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const locale = requestHeaders.get(I18N_REQUEST_LOCALE_HEADER);

  return locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
}
