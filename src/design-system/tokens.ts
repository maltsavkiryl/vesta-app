import { useMemo } from "react"

import { useAppTheme } from "@/theme/context"

export interface DesignTokens {
  isDark: boolean
  background: string
  backgroundMuted: string
  surface: string
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
}

export function useDesignTokens() {
  const { theme } = useAppTheme()

  return useMemo<DesignTokens>(() => {
    if (theme.isDark) {
      return {
        isDark: true,
        background: "#000000",
        backgroundMuted: "#101012",
        surface: "#1C1C1E",
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
      }
    }

    return {
      isDark: false,
      background: "#FFFFFF",
      backgroundMuted: "#F6F6F8",
      surface: "#FFFFFF",
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
    }
  }, [theme.isDark])
}
