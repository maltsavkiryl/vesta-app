import { type ReactElement } from "react"
import {
  type StyleProp,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewStyle,
} from "react-native"

import { isRTL } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { type ExtendedEdge, useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import { type IconTypes, PressableIcon } from "@/ui/primitives/Icon"
import { Text, type TextProps } from "@/ui/primitives/Text"

export interface HeaderProps {
  LeftActionComponent?: ReactElement
  RightActionComponent?: ReactElement
  backgroundColor?: string
  containerStyle?: StyleProp<ViewStyle>
  leftIcon?: IconTypes
  leftIconColor?: string
  leftText?: TextProps["text"]
  leftTx?: TextProps["tx"]
  leftTxOptions?: TextProps["txOptions"]
  onLeftPress?: TouchableOpacityProps["onPress"]
  onRightPress?: TouchableOpacityProps["onPress"]
  rightIcon?: IconTypes
  rightIconColor?: string
  rightText?: TextProps["text"]
  rightTx?: TextProps["tx"]
  rightTxOptions?: TextProps["txOptions"]
  safeAreaEdges?: ExtendedEdge[]
  style?: StyleProp<ViewStyle>
  title?: TextProps["text"]
  titleContainerStyle?: StyleProp<ViewStyle>
  titleMode?: "center" | "flex"
  titleStyle?: StyleProp<TextStyle>
  titleTx?: TextProps["tx"]
  titleTxOptions?: TextProps["txOptions"]
}

interface HeaderActionProps {
  ActionComponent?: ReactElement
  backgroundColor?: string
  icon?: IconTypes
  iconColor?: string
  onPress?: TouchableOpacityProps["onPress"]
  text?: TextProps["text"]
  tx?: TextProps["tx"]
  txOptions?: TextProps["txOptions"]
}

export function Header(props: HeaderProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const {
    backgroundColor = colors.background,
    LeftActionComponent,
    leftIcon,
    leftIconColor,
    leftText,
    leftTx,
    leftTxOptions,
    onLeftPress,
    onRightPress,
    RightActionComponent,
    rightIcon,
    rightIconColor,
    rightText,
    rightTx,
    rightTxOptions,
    safeAreaEdges = ["top"],
    title,
    titleMode = "center",
    titleTx,
    titleTxOptions,
    titleContainerStyle: titleContainerStyleOverride,
    style: styleOverride,
    titleStyle: titleStyleOverride,
    containerStyle: containerStyleOverride,
  } = props
  const containerInsets = useSafeAreaInsetsStyle(safeAreaEdges)
  const titleContent = titleTx ? translate(titleTx, titleTxOptions) : title

  return (
    <View style={[container, containerInsets, { backgroundColor }, containerStyleOverride]}>
      <View style={[$styles.row, wrapper, styleOverride]}>
        <HeaderAction
          ActionComponent={LeftActionComponent}
          backgroundColor={backgroundColor}
          icon={leftIcon}
          iconColor={leftIconColor}
          onPress={onLeftPress}
          text={leftText}
          tx={leftTx}
          txOptions={leftTxOptions}
        />

        {!!titleContent && (
          <View
            style={[
              titleWrapperPointerEvents,
              titleMode === "center" && themed(titleWrapperCenter),
              titleMode === "flex" && titleWrapperFlex,
              titleContainerStyleOverride,
            ]}
          >
            <Text
              size="md"
              style={[titleStyle, titleStyleOverride]}
              text={titleContent}
              weight="medium"
            />
          </View>
        )}

        <HeaderAction
          ActionComponent={RightActionComponent}
          backgroundColor={backgroundColor}
          icon={rightIcon}
          iconColor={rightIconColor}
          onPress={onRightPress}
          text={rightText}
          tx={rightTx}
          txOptions={rightTxOptions}
        />
      </View>
    </View>
  )
}

function HeaderAction(props: HeaderActionProps) {
  const { backgroundColor, icon, text, tx, txOptions, onPress, ActionComponent, iconColor } = props
  const { themed } = useAppTheme()
  const content = tx ? translate(tx, txOptions) : text

  if (ActionComponent) return ActionComponent

  if (content) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!onPress}
        onPress={onPress}
        style={themed([actionTextContainer, { backgroundColor }])}
      >
        <Text size="md" style={themed(actionText)} text={content} weight="medium" />
      </TouchableOpacity>
    )
  }

  if (icon) {
    return (
      <PressableIcon
        color={iconColor}
        containerStyle={themed([actionIconContainer, { backgroundColor }])}
        icon={icon}
        onPress={onPress}
        size={24}
        style={isRTL ? { transform: [{ rotate: "180deg" }] } : {}}
      />
    )
  }

  return <View style={[actionFillerContainer, { backgroundColor }]} />
}

const wrapper: ViewStyle = {
  alignItems: "center",
  height: 56,
  justifyContent: "space-between",
}

const container: ViewStyle = {
  width: "100%",
}

const titleStyle: TextStyle = {
  textAlign: "center",
}

const actionTextContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexGrow: 0,
  height: "100%",
  justifyContent: "center",
  paddingHorizontal: spacing.md,
  zIndex: 2,
})

const actionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})

const actionIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexGrow: 0,
  height: "100%",
  justifyContent: "center",
  paddingHorizontal: spacing.md,
  zIndex: 2,
})

const actionFillerContainer: ViewStyle = {
  width: 16,
}

const titleWrapperPointerEvents: ViewStyle = {
  pointerEvents: "none",
}

const titleWrapperCenter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  height: "100%",
  justifyContent: "center",
  paddingHorizontal: spacing.xxl,
  position: "absolute",
  width: "100%",
  zIndex: 1,
})

const titleWrapperFlex: ViewStyle = {
  flexGrow: 1,
  justifyContent: "center",
}
