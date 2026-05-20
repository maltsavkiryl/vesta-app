import { Image, StyleProp, ImageStyle } from "react-native"

const vestaLogo = require("@assets/images/vesta-logo.png")

export function AuthLogo({
  accessibilityLabel = "Vesta",
  style,
}: {
  accessibilityLabel?: string
  style?: StyleProp<ImageStyle>
}) {
  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={vestaLogo}
      style={style}
    />
  )
}
