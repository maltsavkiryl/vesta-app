import {
  Image,
  type ImageStyle,
  type StyleProp,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"

import { useAppTheme } from "@/theme/context"

export type IconTypes = keyof typeof iconRegistry

type BaseIconProps = {
  color?: string
  containerStyle?: StyleProp<ViewStyle>
  icon: IconTypes
  size?: number
  style?: StyleProp<ImageStyle>
}

type PressableIconProps = Omit<TouchableOpacityProps, "style"> & BaseIconProps
type IconProps = Omit<ViewProps, "style"> & BaseIconProps

export function PressableIcon(props: PressableIconProps) {
  const {
    icon,
    color,
    size,
    style: imageStyleOverride,
    containerStyle: containerStyleOverride,
    ...pressableProps
  } = props
  const { theme } = useAppTheme()

  const imageStyle: StyleProp<ImageStyle> = [
    imageStyleBase,
    { tintColor: color ?? theme.colors.text },
    size !== undefined && { width: size, height: size },
    imageStyleOverride,
  ]

  return (
    <TouchableOpacity {...pressableProps} style={containerStyleOverride}>
      <Image source={iconRegistry[icon]} style={imageStyle} />
    </TouchableOpacity>
  )
}

export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: imageStyleOverride,
    containerStyle: containerStyleOverride,
    ...viewProps
  } = props
  const { theme } = useAppTheme()

  const imageStyle: StyleProp<ImageStyle> = [
    imageStyleBase,
    { tintColor: color ?? theme.colors.text },
    size !== undefined && { width: size, height: size },
    imageStyleOverride,
  ]

  return (
    <View {...viewProps} style={containerStyleOverride}>
      <Image source={iconRegistry[icon]} style={imageStyle} />
    </View>
  )
}

export const iconRegistry = {
  back: require("@assets/icons/back.png"),
  bell: require("@assets/icons/bell.png"),
  caretLeft: require("@assets/icons/caretLeft.png"),
  caretRight: require("@assets/icons/caretRight.png"),
  check: require("@assets/icons/check.png"),
  hidden: require("@assets/icons/hidden.png"),
  ladybug: require("@assets/icons/ladybug.png"),
  lock: require("@assets/icons/lock.png"),
  menu: require("@assets/icons/menu.png"),
  more: require("@assets/icons/more.png"),
  settings: require("@assets/icons/settings.png"),
  view: require("@assets/icons/view.png"),
  x: require("@assets/icons/x.png"),
}

const imageStyleBase: ImageStyle = {
  resizeMode: "contain",
}
