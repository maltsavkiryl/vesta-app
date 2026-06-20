import { useMemo } from "react"

import { useAppTheme } from "@/theme/context"

export interface ElevationStyle {
  shadowColor: string
  shadowOffset: { width: number; height: number }
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

export interface DesignTokens {
  isDark: boolean
  background: string
  backgroundMuted: string
  groupedBackground: string
  surface: string
  surfaceElevated: string
  surfaceSecondary: string
  surfaceTertiary: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  accent: string
  accentForeground: string
  accentSoft: string
  success: string
  warning: string
  danger: string
  shadow: string
  transparent: string
  heroStart: string
  heroEnd: string
  heroText: string
  heroTextMuted: string
  tabBar: string
  tabBarBorder: string
  avatarBackground: string
  avatarText: string
  searchBackground: string
  separator: string
  pressed: string
  overlay: string
  successSoft: string
  warningSoft: string
  dangerSoft: string
  // Elevation scale (platform-correct shadows)
  elevation0: ElevationStyle
  elevation1: ElevationStyle
  elevation2: ElevationStyle
  elevation3: ElevationStyle
  // Radius scale
  radiusSm: number
  radiusMd: number
  radiusLg: number
  radiusXl: number
  radiusFull: number
  // Semantic additions
  accentMuted: string
  surfaceSheet: string
}

// Exported for design-system tests (e.g. WCAG contrast checks). These are the
// source-of-truth palettes returned by `useDesignTokens`.
//
// Contrast note: `textMuted` is used for body-secondary / metadata copy, so it
// must clear WCAG AA (>=4.5:1) against the surface it sits on. Light targets
// #FFFFFF; dark targets the card `surface`. Keep that invariant when retuning.
export const DARK_DESIGN_TOKENS: DesignTokens = {
  isDark: true,
  background: "#000000",
  backgroundMuted: "#101012",
  groupedBackground: "#000000",
  surface: "#1C1C1E",
  surfaceElevated: "#242426",
  surfaceSecondary: "#2C2C2E",
  surfaceTertiary: "#3A3A3C",
  textPrimary: "#FFFFFF",
  textSecondary: "#D1D1D6",
  // WCAG AA: 6.08:1 on `surface` (#1C1C1E); was #8E8E93 (5.22:1, thin margin).
  textMuted: "#9A9AA0",
  border: "rgba(255, 255, 255, 0.10)",
  accent: "#0A84FF",
  accentForeground: "#FFFFFF",
  accentSoft: "rgba(10, 132, 255, 0.14)",
  success: "#30D158",
  warning: "#FFD60A",
  danger: "#FF453A",
  shadow: "rgba(0, 0, 0, 0.28)",
  transparent: "transparent",
  heroStart: "#1C1C1E",
  heroEnd: "#2C2C2E",
  heroText: "#FFFFFF",
  heroTextMuted: "rgba(255, 255, 255, 0.68)",
  tabBar: "rgba(28, 28, 30, 0.94)",
  tabBarBorder: "rgba(255, 255, 255, 0.10)",
  avatarBackground: "#2C2C2E",
  avatarText: "#FFFFFF",
  searchBackground: "#1C1C1E",
  separator: "rgba(84, 84, 88, 0.56)",
  pressed: "rgba(255, 255, 255, 0.08)",
  overlay: "rgba(0, 0, 0, 0.52)",
  successSoft: "rgba(48, 209, 88, 0.14)",
  warningSoft: "rgba(255, 214, 10, 0.14)",
  dangerSoft: "rgba(255, 69, 58, 0.14)",
  elevation0: {
    shadowColor: "rgba(0,0,0,0)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  elevation1: {
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  elevation2: {
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
    elevation: 6,
  },
  elevation3: {
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.34,
    shadowRadius: 24,
    elevation: 12,
  },
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 999,
  accentMuted: "rgba(10, 132, 255, 0.08)",
  surfaceSheet: "#1C1C1E",
}

export const LIGHT_DESIGN_TOKENS: DesignTokens = {
  isDark: false,
  background: "#FFFFFF",
  backgroundMuted: "#F6F6F8",
  groupedBackground: "#F2F2F7",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceSecondary: "#F1F1F6",
  surfaceTertiary: "#E8E8EE",
  textPrimary: "#1C1C1E",
  textSecondary: "#6E6E73",
  // WCAG AA: 5.30:1 on #FFFFFF; was #AEAEB2 (2.21:1, failed AA).
  textMuted: "#6B6B70",
  border: "rgba(60, 60, 67, 0.13)",
  accent: "#007AFF",
  accentForeground: "#FFFFFF",
  accentSoft: "rgba(0, 122, 255, 0.10)",
  success: "#34C759",
  warning: "#FF9F0A",
  danger: "#FF3B30",
  shadow: "rgba(60, 60, 67, 0.10)",
  transparent: "transparent",
  heroStart: "#F1F1F6",
  heroEnd: "#FFFFFF",
  heroText: "#1C1C1E",
  heroTextMuted: "#6E6E73",
  tabBar: "rgba(255, 255, 255, 0.94)",
  tabBarBorder: "rgba(60, 60, 67, 0.12)",
  avatarBackground: "#EAF3FF",
  avatarText: "#007AFF",
  searchBackground: "#F1F1F6",
  separator: "rgba(60, 60, 67, 0.18)",
  pressed: "rgba(60, 60, 67, 0.08)",
  overlay: "rgba(0, 0, 0, 0.36)",
  successSoft: "rgba(52, 199, 89, 0.12)",
  warningSoft: "rgba(255, 159, 10, 0.12)",
  dangerSoft: "rgba(255, 59, 48, 0.12)",
  elevation0: {
    shadowColor: "rgba(0,0,0,0)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  elevation1: {
    shadowColor: "rgba(60,60,67,0.14)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  elevation2: {
    shadowColor: "rgba(60,60,67,0.14)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  elevation3: {
    shadowColor: "rgba(60,60,67,0.14)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 999,
  accentMuted: "rgba(0, 122, 255, 0.07)",
  surfaceSheet: "#FFFFFF",
}

export function useDesignTokens() {
  const { theme } = useAppTheme()

  return useMemo<DesignTokens>(
    () => (theme.isDark ? DARK_DESIGN_TOKENS : LIGHT_DESIGN_TOKENS),
    [theme.isDark],
  )
}
