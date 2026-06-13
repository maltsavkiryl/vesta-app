import { ReactNode, forwardRef, type ForwardedRef } from "react"
import {
  PixelRatio,
  type StyleProp,
  StyleSheet,
  // eslint-disable-next-line no-restricted-imports
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native"
import { type TOptions } from "i18next"

import { isRTL, type TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"
import { typography } from "@/theme/typography"

type Sizes = keyof typeof sizeStyles
type Weights = keyof typeof typography.primary
type Presets = "default" | "bold" | "heading" | "subheading" | "formLabel" | "formHelper"

export interface TextProps extends RNTextProps {
  children?: ReactNode
  preset?: Presets
  size?: Sizes
  style?: StyleProp<TextStyle>
  text?: string
  tx?: TxKeyPath
  txOptions?: TOptions
  weight?: Weights
}

export const Text = forwardRef(function Text(props: TextProps, ref: ForwardedRef<RNText>) {
  const {
    weight,
    size,
    tx,
    txOptions,
    text,
    children,
    style: styleOverride,
    allowFontScaling = true,
    maxFontSizeMultiplier,
    ...rest
  } = props
  const { themed } = useAppTheme()

  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || text || children
  const preset: Presets = props.preset ?? "default"

  const styles: StyleProp<TextStyle> = [
    rtlStyle,
    themed(presets[preset]),
    weight && fontWeightStyles[weight],
    size && sizeStyles[size],
    styleOverride,
  ]

  // Dynamic Type: cap how far text can scale (smaller cap for large display
  // text so it doesn't blow out layout, larger cap for body copy), and grow
  // lineHeight with the OS font scale so tall glyphs don't clip on big-text
  // settings. At scale 1 (the default) every value is identical to the base
  // design, so the static look is unchanged.
  const flattened = (StyleSheet.flatten(styles) ?? {}) as TextStyle
  const resolvedFontSize =
    typeof flattened.fontSize === "number" ? flattened.fontSize : sizeStyles.sm.fontSize
  const fontCap = maxFontSizeMultiplier ?? resolveMaxFontSizeMultiplier(resolvedFontSize)

  let scaledLineHeightStyle: TextStyle | undefined
  if (allowFontScaling && typeof flattened.lineHeight === "number") {
    const effectiveScale = Math.min(PixelRatio.getFontScale(), fontCap)
    if (effectiveScale > 1) {
      scaledLineHeightStyle = { lineHeight: flattened.lineHeight * effectiveScale }
    }
  }

  return (
    <RNText
      {...rest}
      ref={ref}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={fontCap}
      style={[styles, scaledLineHeightStyle]}
    >
      {content}
    </RNText>
  )
})

/**
 * Dynamic Type scaling caps by role/size. Large display copy gets a tighter cap
 * (layout breaks sooner), body/detail copy is allowed to grow further for
 * low-vision users. Callers can override via the `maxFontSizeMultiplier` prop.
 */
function resolveMaxFontSizeMultiplier(fontSize: number): number {
  if (fontSize >= 30) return 1.3 // display / hero / heading
  if (fontSize >= 22) return 1.4 // titles
  if (fontSize >= 17) return 1.5 // subheading / large body
  return 1.6 // body, captions, labels
}

const sizeStyles = {
  xxl: { fontSize: 36, lineHeight: 44 } satisfies TextStyle,
  xl: { fontSize: 24, lineHeight: 34 } satisfies TextStyle,
  lg: { fontSize: 20, lineHeight: 32 } satisfies TextStyle,
  md: { fontSize: 18, lineHeight: 26 } satisfies TextStyle,
  sm: { fontSize: 16, lineHeight: 24 } satisfies TextStyle,
  xs: { fontSize: 14, lineHeight: 21 } satisfies TextStyle,
  xxs: { fontSize: 12, lineHeight: 18 } satisfies TextStyle,
}

const fontWeightStyles = Object.entries(typography.primary).reduce((acc, [weight, fontStyle]) => {
  return { ...acc, [weight]: fontStyle }
}, {}) as Record<Weights, TextStyle>

const baseStyle: ThemedStyle<TextStyle> = (theme) => ({
  ...sizeStyles.sm,
  ...fontWeightStyles.normal,
  color: theme.colors.text,
})

const presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [baseStyle],
  bold: [baseStyle, { ...fontWeightStyles.bold }],
  heading: [baseStyle, { ...sizeStyles.xxl, ...fontWeightStyles.bold }],
  subheading: [baseStyle, { ...sizeStyles.lg, ...fontWeightStyles.medium }],
  formLabel: [baseStyle, { ...fontWeightStyles.medium }],
  formHelper: [baseStyle, { ...sizeStyles.sm, ...fontWeightStyles.normal }],
}

const rtlStyle: TextStyle = isRTL ? { writingDirection: "rtl" } : {}
