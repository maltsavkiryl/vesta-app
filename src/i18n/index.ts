import { I18nManager } from "react-native"
import * as Localization from "expo-localization"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import "intl-pluralrules"

import { loadString, saveString } from "@/utils/storage"

import en, { Translations } from "./en"
import fr from "./fr"
import nl from "./nl"

// The Belgian market locales the app ships with. `nl` is treated as nl-BE and
// `fr` as fr-BE in copy and formatting; English is the fallback.
export const supportedLocales = ["en", "nl", "fr"] as const
export type AppLocale = (typeof supportedLocales)[number]

const fallbackLocale: AppLocale = "en"

// Where a user-chosen language override is persisted so it survives restarts.
export const LANGUAGE_STORAGE_KEY = "vesta.language"

const resources = { en, fr, nl }

const isSupportedLocale = (value: string | null | undefined): value is AppLocale =>
  !!value && (supportedLocales as readonly string[]).includes(value)

/** Maps any BCP-47 tag (e.g. "nl-BE", "fr-FR") to a supported locale, else the fallback. */
export const mapToSupportedLocale = (languageTag?: string | null): AppLocale => {
  const primaryTag = languageTag?.split("-")[0]?.toLowerCase()
  return isSupportedLocale(primaryTag) ? primaryTag : fallbackLocale
}

const detectDeviceLocale = (): AppLocale => {
  const match = Localization.getLocales().find((locale) =>
    isSupportedLocale(locale.languageTag?.split("-")[0]?.toLowerCase()),
  )
  return match ? mapToSupportedLocale(match.languageTag) : fallbackLocale
}

/** Resolution order: persisted user override → device locale → fallback (en). */
export const resolveInitialLocale = (): AppLocale => {
  const stored = loadString(LANGUAGE_STORAGE_KEY)
  return isSupportedLocale(stored) ? stored : detectDeviceLocale()
}

// None of the supported locales are RTL, but we keep the export for callers.
export const isRTL = false
I18nManager.allowRTL(false)

export const initI18n = async () => {
  i18n.use(initReactI18next)

  await i18n.init({
    resources,
    lng: resolveInitialLocale(),
    fallbackLng: fallbackLocale,
    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

/** Switches the in-app language and persists the override for the next launch. */
export const changeAppLanguage = async (locale: AppLocale) => {
  saveString(LANGUAGE_STORAGE_KEY, locale)
  await i18n.changeLanguage(locale)
}

/**
 * Builds up valid keypaths for translations.
 */

export type TxKeyPath = RecursiveKeyOf<Translations>

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, true>
}[keyof TObj & (string | number)]

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, false>
}[keyof TObj & (string | number)]

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean,
> = TValue extends any[]
  ? Text
  : TValue extends object
    ? IsFirstLevel extends true
      ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
      : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
    : Text
