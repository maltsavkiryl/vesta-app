import type { DesignTokens } from "@/ui/foundations/tokens"

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger"
export type Emphasis = "soft" | "outline" | "solid"

export function getTonePalette(
  tokens: DesignTokens,
  tone: Tone = "neutral",
  emphasis: Emphasis = "soft",
) {
  const palette = {
    accent: {
      base: tokens.accent,
      muted: tokens.accentSoft,
      outline: `${tokens.accent}24`,
      solidText: tokens.accentForeground,
    },
    danger: {
      base: tokens.danger,
      muted: tokens.dangerSoft,
      outline: `${tokens.danger}24`,
      solidText: tokens.accentForeground,
    },
    neutral: {
      base: tokens.textSecondary,
      muted: tokens.surfaceSecondary,
      outline: tokens.border,
      solidText: tokens.background,
    },
    success: {
      base: tokens.success,
      muted: tokens.successSoft,
      outline: `${tokens.success}24`,
      solidText: tokens.accentForeground,
    },
    warning: {
      base: tokens.warning,
      muted: tokens.warningSoft,
      outline: `${tokens.warning}24`,
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

  if (emphasis === "outline") {
    return {
      backgroundColor: tokens.background,
      borderColor: palette.outline,
      color: palette.base,
    }
  }

  return {
    backgroundColor: palette.muted,
    borderColor: palette.outline,
    color: palette.base,
  }
}
