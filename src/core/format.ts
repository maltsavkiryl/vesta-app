// Note the subpath imports from date-fns. Importing from the package root
// (`import { format } from "date-fns"`) pulls the ENTIRE library into the
// production bundle because react-native does not tree-shake.
import { format } from "date-fns/format"
import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict"
import type { Locale } from "date-fns/locale"
import { enGB } from "date-fns/locale/en-GB"
import { fr as frLocale } from "date-fns/locale/fr"
import { nl as nlLocale } from "date-fns/locale/nl"
import i18n from "i18next"

export type SupportedLocale = "en" | "nl" | "fr"

// BCP-47 tags used for Intl formatting. nl/fr are localised to Belgium.
const localeToBcp47: Record<SupportedLocale, string> = {
  en: "en-GB",
  fr: "fr-BE",
  nl: "nl-BE",
}

const dateFnsLocales: Record<SupportedLocale, Locale> = {
  en: enGB,
  fr: frLocale,
  nl: nlLocale,
}

/** Resolves the active app locale (explicit override → current i18n language → en). */
export function resolveSupportedLocale(locale?: string): SupportedLocale {
  const primaryTag = (locale ?? i18n.language ?? "en").split("-")[0]?.toLowerCase()
  if (primaryTag === "nl") return "nl"
  if (primaryTag === "fr") return "fr"
  return "en"
}

export function getDateFnsLocale(locale?: string): Locale {
  return dateFnsLocales[resolveSupportedLocale(locale)]
}

const dateFormats = {
  full: "EEEE d MMMM",
  short: "d MMM",
} as const

function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatLocalizedDate(
  value: string | number | Date,
  style: keyof typeof dateFormats = "short",
  locale?: string,
): string {
  const date = toDate(value)
  return date ? format(date, dateFormats[style], { locale: getDateFnsLocale(locale) }) : ""
}

/** A localized relative label for a timestamp, e.g. "3 hours ago" / "il y a 3 heures". */
export function toRelativeTime(value: string | number | Date, locale?: string): string {
  const date = toDate(value)
  return date
    ? formatDistanceToNowStrict(date, { addSuffix: true, locale: getDateFnsLocale(locale) })
    : ""
}

export function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(localeToBcp47[resolveSupportedLocale(locale)]).format(value)
}
