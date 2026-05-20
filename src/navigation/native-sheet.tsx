import type { ComponentProps } from "react"
import { Platform, Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type {
  NativeStackHeaderItem,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack"
import type { SFSymbol } from "sf-symbols-typescript"

import type { Theme } from "@/ui/foundations/theme"
import { Text } from "@/ui/primitives/Text"
import { firePressHaptic, type PressHapticIntent } from "@/utils/haptics"

const SHEET_DETENTS = {
  large: 0.98,
  medium: 0.6,
} as const

type SheetPreset = "medium" | "resizable"
type SheetDetent = "medium" | "large"
type SheetPresentation = "formSheet" | "pageSheet"
type HeaderActionKind = "close" | "confirm" | "icon"

interface BaseNavigationOptions {
  backgroundColor?: string
  grabberVisible?: boolean
  headerBlurEffect?: NativeStackNavigationOptions["headerBlurEffect"]
  headerLeft?: NativeStackNavigationOptions["headerLeft"]
  headerRight?: NativeStackNavigationOptions["headerRight"]
  motionEnabled?: boolean
  sheetCornerRadius?: number
  sheetAllowedDetents?: NativeStackNavigationOptions["sheetAllowedDetents"]
  unstable_headerLeftItems?: NativeStackNavigationOptions["unstable_headerLeftItems"]
  unstable_headerRightItems?: NativeStackNavigationOptions["unstable_headerRightItems"]
}

interface HeaderActionButtonProps {
  accessibilityLabel?: string
  kind: HeaderActionKind
  iconName?: ComponentProps<typeof Ionicons>["name"]
  prominent?: boolean
  onPress: () => void
  theme: Theme
  disabled?: boolean
  haptic?: PressHapticIntent | "none"
}

interface BaseHeaderActionOptions {
  onPress: () => void
  disabled?: boolean
  haptic?: PressHapticIntent | "none"
}

type HeaderActionOptions =
  | ({
      kind: "close"
    } & BaseHeaderActionOptions)
  | ({
      kind: "confirm"
      label?: string
    } & BaseHeaderActionOptions)
  | ({
      kind: "icon"
      accessibilityLabel: string
      iconName: ComponentProps<typeof Ionicons>["name"]
      iosIconName: SFSymbol
      prominent?: boolean
    } & BaseHeaderActionOptions)

function getHeaderAccessibilityLabel(action: HeaderActionOptions) {
  if (action.kind === "confirm") return action.label ?? "Confirm"
  if (action.kind === "icon") return action.accessibilityLabel
  return "Close"
}

export function HeaderActionButton({
  accessibilityLabel,
  kind,
  iconName,
  prominent = false,
  onPress,
  theme,
  disabled,
  haptic = "selection",
}: HeaderActionButtonProps) {
  const isProminentIcon = kind === "icon" && prominent
  const isProminent = kind === "confirm" || isProminentIcon
  const backgroundColor = isProminent
    ? disabled
      ? theme.isDark
        ? "rgba(10, 132, 255, 0.32)"
        : "rgba(0, 122, 255, 0.32)"
      : theme.isDark
        ? "#0A84FF"
        : "#007AFF"
    : theme.isDark
      ? "rgba(58, 58, 60, 0.9)"
      : "rgba(118, 118, 128, 0.12)"
  const iconColor = isProminent
    ? "white"
    : disabled
      ? theme.isDark
        ? "rgba(255, 255, 255, 0.45)"
        : "rgba(28, 28, 30, 0.35)"
      : theme.colors.text
  const renderedIconName =
    kind === "confirm" ? "checkmark" : kind === "close" ? "close" : (iconName ?? "ellipse")

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={12}
      onPress={() => {
        firePressHaptic(haptic)
        onPress()
      }}
      style={[
        styles.headerActionButton,
        { backgroundColor },
        disabled ? styles.headerActionButtonDisabled : styles.headerActionButtonEnabled,
      ]}
    >
      <Ionicons color={iconColor} name={renderedIconName} size={20} />
    </Pressable>
  )
}

function HeaderProminentActionButton({
  label,
  onPress,
  theme,
  disabled,
  haptic = "selection",
}: {
  label: string
  onPress: () => void
  theme: Theme
  disabled?: boolean
  haptic?: PressHapticIntent | "none"
}) {
  const backgroundColor = disabled
    ? theme.isDark
      ? "rgba(10, 132, 255, 0.42)"
      : "rgba(0, 122, 255, 0.42)"
    : theme.isDark
      ? "#0A84FF"
      : "#007AFF"
  const foregroundColor = theme.isDark ? theme.colors.text : theme.colors.background

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={12}
      onPress={() => {
        firePressHaptic(haptic)
        onPress()
      }}
      style={[
        styles.headerProminentButton,
        { backgroundColor },
        disabled ? styles.headerActionButtonDisabled : styles.headerActionButtonEnabled,
      ]}
    >
      <Ionicons color={foregroundColor} name="checkmark" size={15} />
      <Text
        text={label}
        size="xs"
        weight="semiBold"
        style={[styles.headerProminentButtonText, { color: foregroundColor }]}
      />
    </Pressable>
  )
}

function createNativeHeaderItem(theme: Theme, action: HeaderActionOptions): NativeStackHeaderItem {
  const { kind, onPress, disabled, haptic = "selection" } = action
  const isProminentIcon = action.kind === "icon" && action.prominent === true
  const isProminent = kind === "confirm" || isProminentIcon
  const itemLabel = kind === "confirm" ? (action.label ?? "Save") : ""
  const accessibilityLabel =
    kind === "confirm"
      ? action.label && action.label.trim().length > 0
        ? action.label
        : "Confirm"
      : kind === "icon"
        ? action.accessibilityLabel
        : "Close"
  const iconName = kind === "confirm" ? "checkmark" : kind === "icon" ? action.iosIconName : "xmark"

  return {
    accessibilityLabel,
    disabled,
    icon: {
      type: "sfSymbol",
      name: iconName,
    },
    label: itemLabel,
    onPress: () => {
      firePressHaptic(haptic)
      onPress()
    },
    tintColor: isProminent ? (theme.isDark ? "#0A84FF" : "#007AFF") : theme.colors.text,
    type: "button",
    variant: isProminent ? "prominent" : "plain",
    width: itemLabel ? undefined : 36,
  }
}

export function createHeaderActionOptions(
  theme: Theme,
  actions: {
    left?: HeaderActionOptions
    right?: HeaderActionOptions
  },
): Pick<
  BaseNavigationOptions,
  "headerLeft" | "headerRight" | "unstable_headerLeftItems" | "unstable_headerRightItems"
> {
  const leftAction = actions.left
  const rightAction = actions.right

  if (Platform.OS === "ios") {
    return {
      unstable_headerLeftItems: leftAction
        ? () => [createNativeHeaderItem(theme, leftAction)]
        : undefined,
      unstable_headerRightItems: rightAction
        ? () => [createNativeHeaderItem(theme, rightAction)]
        : undefined,
    }
  }

  return {
    headerLeft: leftAction
      ? () => (
          <HeaderActionButton
            accessibilityLabel={getHeaderAccessibilityLabel(leftAction)}
            disabled={leftAction.disabled}
            haptic={leftAction.haptic}
            iconName={leftAction.kind === "icon" ? leftAction.iconName : undefined}
            kind={leftAction.kind}
            onPress={leftAction.onPress}
            prominent={leftAction.kind === "icon" ? leftAction.prominent : undefined}
            theme={theme}
          />
        )
      : undefined,
    headerRight: rightAction
      ? () =>
          rightAction.kind === "confirm" ? (
            <HeaderProminentActionButton
              disabled={rightAction.disabled}
              haptic={rightAction.haptic}
              label={rightAction.label ?? "Save"}
              onPress={rightAction.onPress}
              theme={theme}
            />
          ) : (
            <HeaderActionButton
              accessibilityLabel={getHeaderAccessibilityLabel(rightAction)}
              disabled={rightAction.disabled}
              haptic={rightAction.haptic}
              iconName={rightAction.kind === "icon" ? rightAction.iconName : undefined}
              kind={rightAction.kind}
              onPress={rightAction.onPress}
              prominent={rightAction.kind === "icon" ? rightAction.prominent : undefined}
              theme={theme}
            />
          )
      : undefined,
  }
}

function createHeaderBaseOptions(
  theme: Theme,
  title?: string,
  options: BaseNavigationOptions = {},
) {
  const backgroundColor = options.backgroundColor ?? (theme.isDark ? "#000000" : "#FFFFFF")
  const isIos = Platform.OS === "ios"

  return {
    headerShadowVisible: false,
    headerBlurEffect: isIos ? options.headerBlurEffect : undefined,
    headerStyle: { backgroundColor: isIos ? "transparent" : backgroundColor },
    headerTransparent: isIos,
    headerTintColor: theme.colors.text,
    headerTitle: title
      ? () => (
          <View style={styles.titleWrapper}>
            <Text text={title} size="sm" weight="semiBold" style={{ color: theme.colors.text }} />
          </View>
        )
      : undefined,
    headerLeft: options.headerLeft,
    headerRight: options.headerRight,
    unstable_headerLeftItems: options.unstable_headerLeftItems,
    unstable_headerRightItems: options.unstable_headerRightItems,
  } satisfies Partial<NativeStackNavigationOptions>
}

export function createSheetOptions(
  theme: Theme,
  title?: string,
  options: BaseNavigationOptions & {
    initialDetent?: SheetDetent
    preset?: SheetPreset
    presentation?: SheetPresentation
  } = {},
) {
  const preset = options.preset ?? "resizable"
  const presentation = options.presentation ?? "formSheet"
  const detents = options.sheetAllowedDetents
    ? options.sheetAllowedDetents
    : preset === "medium"
      ? [SHEET_DETENTS.medium]
      : [SHEET_DETENTS.medium, SHEET_DETENTS.large]
  const initialDetentIndex =
    Array.isArray(detents) && detents.length > 0
      ? preset === "medium" || options.initialDetent !== "large"
        ? 0
        : detents.length - 1
      : undefined

  return {
    animation: options.motionEnabled === false ? "none" : "default",
    presentation,
    sheetAllowedDetents: detents,
    sheetCornerRadius: options.sheetCornerRadius ?? 24,
    sheetGrabberVisible: options.grabberVisible ?? true,
    sheetInitialDetentIndex: initialDetentIndex,
    headerShown: true,
    headerBackVisible: false,
    ...createHeaderBaseOptions(theme, title, options),
  } satisfies NativeStackNavigationOptions
}

export function createPushDetailOptions(
  theme: Theme,
  title?: string,
  options: BaseNavigationOptions = {},
) {
  return {
    animation:
      options.motionEnabled === false
        ? "none"
        : Platform.OS === "android"
          ? "ios_from_right"
          : "default",
    presentation: "card" as const,
    headerShown: true,
    headerBackButtonDisplayMode: "minimal" as const,
    contentStyle: {
      backgroundColor: options.backgroundColor ?? theme.colors.background,
    },
    ...createHeaderBaseOptions(theme, title, options),
  } satisfies NativeStackNavigationOptions
}

const styles = StyleSheet.create({
  headerActionButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  headerActionButtonDisabled: {
    opacity: 0.9,
  },
  headerActionButtonEnabled: {
    opacity: 1,
  },
  headerProminentButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  headerProminentButtonText: {
    lineHeight: 16,
  },
  titleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
})
