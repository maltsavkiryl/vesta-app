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
  detailTitle: {
    fontSize: 20,
    lineHeight: 26,
  } satisfies TextStyle,
  heroValue: {
    fontSize: 38,
    lineHeight: 44,
  } satisfies TextStyle,
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
  } satisfies TextStyle,
  searchInput: {
    fontSize: 15,
    lineHeight: 20,
  } satisfies TextStyle,
} as const
