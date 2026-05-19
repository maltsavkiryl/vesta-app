import type { TextStyle } from "react-native"

export const appLayout = {
  cardGap: 14,
  groupedSectionGap: 10,
  rowGap: 12,
  screenGap: 12,
  screenPaddingHorizontal: 16,
  sheetGap: 16,
  sheetPaddingBottom: 36,
  sheetPaddingHorizontal: 22,
  sheetPaddingTop: 18,
} as const

export const appTypography = {
  authHeroTitle: {
    fontSize: 34,
    lineHeight: 39,
  } satisfies TextStyle,
  authSubtitle: {
    fontSize: 16,
    lineHeight: 21,
  } satisfies TextStyle,
  authTitle: {
    fontSize: 28,
    lineHeight: 34,
  } satisfies TextStyle,
  detailTitle: {
    fontSize: 20,
    lineHeight: 26,
  } satisfies TextStyle,
  heroLarge: {
    fontSize: 31,
    lineHeight: 36,
  } satisfies TextStyle,
  heroValue: {
    fontSize: 38,
    lineHeight: 44,
  } satisfies TextStyle,
  onboardingHeroTitle: {
    fontSize: 32,
    lineHeight: 38,
  } satisfies TextStyle,
  onboardingTitle: {
    fontSize: 26,
    lineHeight: 32,
  } satisfies TextStyle,
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
  } satisfies TextStyle,
  searchInput: {
    fontSize: 15,
    lineHeight: 20,
  } satisfies TextStyle,
  successTitle: {
    fontSize: 22,
    lineHeight: 28,
  } satisfies TextStyle,
} as const
export * from "./variants"
