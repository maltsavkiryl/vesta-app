import type { DesignTokens } from "@/ui/foundations/tokens"

export type AppTone = "neutral" | "accent" | "success" | "warning" | "danger"

export function getTonePalette(
  tokens: DesignTokens,
  tone: AppTone,
  emphasis: "soft" | "solid" = "soft",
) {
  const palette = {
    accent: {
      base: tokens.accent,
      muted: tokens.accentSoft,
      solidText: tokens.accentForeground,
    },
    danger: {
      base: tokens.danger,
      muted: tokens.dangerSoft,
      solidText: tokens.accentForeground,
    },
    neutral: {
      base: tokens.textSecondary,
      muted: tokens.surfaceSecondary,
      solidText: tokens.background,
    },
    success: {
      base: tokens.success,
      muted: tokens.successSoft,
      solidText: tokens.accentForeground,
    },
    warning: {
      base: tokens.warning,
      muted: tokens.warningSoft,
      solidText: tokens.textPrimary,
    },
  }[tone]

  if (emphasis === "solid") {
    return {
      backgroundColor: palette.base,
      borderColor: palette.base,
      color: palette.solidText,
    }
  }

  return {
    backgroundColor: palette.muted,
    borderColor: palette.muted,
    color: palette.base,
  }
}
