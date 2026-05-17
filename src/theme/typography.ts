import { Platform, type TextStyle } from "react-native"

export const customFontsToLoad = {}

type FontWeightScale = {
  light: Pick<TextStyle, "fontFamily" | "fontWeight">
  normal: Pick<TextStyle, "fontFamily" | "fontWeight">
  medium: Pick<TextStyle, "fontFamily" | "fontWeight">
  semiBold: Pick<TextStyle, "fontFamily" | "fontWeight">
  bold: Pick<TextStyle, "fontFamily" | "fontWeight">
}

const systemFontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: undefined,
})

const systemFontScale: FontWeightScale = {
  light: { fontFamily: systemFontFamily, fontWeight: "300" },
  normal: { fontFamily: systemFontFamily, fontWeight: "400" },
  medium: { fontFamily: systemFontFamily, fontWeight: "500" },
  semiBold: { fontFamily: systemFontFamily, fontWeight: "600" },
  bold: { fontFamily: systemFontFamily, fontWeight: "700" },
}

const fonts = {
  system: systemFontScale,
  mono: {
    normal: {
      fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
      fontWeight: "400",
    },
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. On iOS this resolves to the system San Francisco stack.
   */
  primary: fonts.system,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: fonts.system,
  /**
   * Lets get fancy with a monospace font!
   */
  code: fonts.mono,
}
