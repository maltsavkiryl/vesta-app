import { Platform, Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type {
  NativeStackHeaderItem,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack"

import type { Theme } from "@/ui/foundations/theme"
import { Text } from "@/ui/primitives/Text"

const SHEET_DETENTS = {
  large: 0.98,
  medium: 0.6,
} as const

type SheetPreset = "medium" | "resizable"
type SheetDetent = "medium" | "large"
type SheetPresentation = "formSheet" | "pageSheet"
type HeaderActionKind = "close" | "confirm"

interface BaseNavigationOptions {
  backgroundColor?: string
  grabberVisible?: boolean
  headerBlurEffect?: NativeStackNavigationOptions["headerBlurEffect"]
  headerLeft?: NativeStackNavigationOptions["headerLeft"]
  headerRight?: NativeStackNavigationOptions["headerRight"]
  sheetCornerRadius?: number
  sheetAllowedDetents?: NativeStackNavigationOptions["sheetAllowedDetents"]
  unstable_headerLeftItems?: NativeStackNavigationOptions["unstable_headerLeftItems"]
  unstable_headerRightItems?: NativeStackNavigationOptions["unstable_headerRightItems"]
}

interface HeaderActionButtonProps {
  kind: HeaderActionKind
  onPress: () => void
  theme: Theme
  disabled?: boolean
}

interface HeaderActionOptions {
  kind: HeaderActionKind
  label?: string
  onPress: () => void
  disabled?: boolean
}

export function HeaderActionButton({ kind, onPress, theme, disabled }: HeaderActionButtonProps) {
  const isConfirm = kind === "confirm"
  const backgroundColor = isConfirm
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
  const iconColor = isConfirm
    ? "white"
    : disabled
      ? theme.isDark
        ? "rgba(255, 255, 255, 0.45)"
        : "rgba(28, 28, 30, 0.35)"
      : theme.colors.text

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={12}
      onPress={onPress}
      style={[
        styles.headerActionButton,
        { backgroundColor },
        disabled ? styles.headerActionButtonDisabled : styles.headerActionButtonEnabled,
      ]}
    >
      <Ionicons color={iconColor} name={isConfirm ? "checkmark" : "close"} size={20} />
    </Pressable>
  )
}

function HeaderProminentActionButton({
  label,
  onPress,
  theme,
  disabled,
}: {
  label: string
  onPress: () => void
  theme: Theme
  disabled?: boolean
}) {
  const backgroundColor = disabled
    ? theme.isDark
      ? "rgba(10, 132, 255, 0.42)"
      : "rgba(0, 122, 255, 0.42)"
    : theme.isDark
      ? "#0A84FF"
      : "#007AFF"

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={12}
      onPress={onPress}
      style={[
        styles.headerProminentButton,
        { backgroundColor },
        disabled ? styles.headerActionButtonDisabled : styles.headerActionButtonEnabled,
      ]}
    >
      <Ionicons color="#FFFFFF" name="checkmark" size={15} />
      <Text text={label} size="xs" weight="semiBold" style={styles.headerProminentButtonText} />
    </Pressable>
  )
}

function createNativeHeaderItem(
  theme: Theme,
  { kind, label, onPress, disabled }: HeaderActionOptions,
): NativeStackHeaderItem {
  const isConfirm = kind === "confirm"
  const itemLabel = label ?? (isConfirm ? "Save" : "")
  const accessibilityLabel =
    label && label.trim().length > 0 ? label : isConfirm ? "Confirm" : "Close"

  return {
    accessibilityLabel,
    disabled,
    icon: {
      type: "sfSymbol",
      name: isConfirm ? "checkmark" : "xmark",
    },
    label: itemLabel,
    onPress,
    tintColor: isConfirm ? (theme.isDark ? "#0A84FF" : "#007AFF") : theme.colors.text,
    type: "button",
    variant: isConfirm ? "prominent" : "plain",
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
            disabled={leftAction.disabled}
            kind={leftAction.kind}
            onPress={leftAction.onPress}
            theme={theme}
          />
        )
      : undefined,
    headerRight: rightAction
      ? () =>
          rightAction.kind === "confirm" ? (
            <HeaderProminentActionButton
              disabled={rightAction.disabled}
              label={rightAction.label ?? "Save"}
              onPress={rightAction.onPress}
              theme={theme}
            />
          ) : (
            <HeaderActionButton
              disabled={rightAction.disabled}
              kind={rightAction.kind}
              onPress={rightAction.onPress}
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
    color: "#FFFFFF",
    lineHeight: 16,
  },
  titleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
})
