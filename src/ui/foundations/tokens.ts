import { useMemo } from "react"

import { useAppTheme } from "@/theme/context"

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
}

export function useDesignTokens() {
  const { theme } = useAppTheme()

  return useMemo<DesignTokens>(() => {
    if (theme.isDark) {
      return {
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
        textMuted: "#8E8E93",
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
      }
    }

    return {
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
      textMuted: "#AEAEB2",
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
    }
  }, [theme.isDark])
}
