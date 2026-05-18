import { ReactNode, useRef, useState } from "react"
import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
  type LayoutChangeEvent,
  Platform,
  type ScrollViewProps,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native"
import { useScrollToTop } from "@react-navigation/native"
import { type SystemBarsProps, SystemBars, type SystemBarStyle } from "react-native-edge-to-edge"
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller"

import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { type ExtendedEdge, useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

export const DEFAULT_BOTTOM_OFFSET = 50

interface BaseScreenProps {
  KeyboardAvoidingViewProps?: KeyboardAvoidingViewProps
  SystemBarsProps?: SystemBarsProps
  backgroundColor?: string
  children?: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  keyboardBottomOffset?: number
  keyboardOffset?: number
  safeAreaEdges?: ExtendedEdge[]
  style?: StyleProp<ViewStyle>
  systemBarStyle?: SystemBarStyle
}

interface FixedScreenProps extends BaseScreenProps {
  preset?: "fixed"
}

interface ScrollScreenProps extends BaseScreenProps {
  ScrollViewProps?: ScrollViewProps
  keyboardShouldPersistTaps?: "handled" | "always" | "never"
  preset?: "scroll"
}

interface AutoScreenProps extends Omit<ScrollScreenProps, "preset"> {
  preset?: "auto"
  scrollEnabledToggleThreshold?: { percent?: number; point?: number }
}

export type ScreenProps = ScrollScreenProps | FixedScreenProps | AutoScreenProps

const isIos = Platform.OS === "ios"

function isNonScrolling(preset?: "fixed" | "scroll" | "auto") {
  return !preset || preset === "fixed"
}

function useAutoPreset(props: AutoScreenProps) {
  const { preset, scrollEnabledToggleThreshold } = props
  const { percent = 0.92, point = 0 } = scrollEnabledToggleThreshold || {}
  const scrollViewHeight = useRef<null | number>(null)
  const scrollViewContentHeight = useRef<null | number>(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)

  function updateScrollState() {
    if (scrollViewHeight.current === null || scrollViewContentHeight.current === null) return

    const contentFitsScreen = point
      ? scrollViewContentHeight.current < scrollViewHeight.current - point
      : scrollViewContentHeight.current < scrollViewHeight.current * percent

    if (scrollEnabled && contentFitsScreen) setScrollEnabled(false)
    if (!scrollEnabled && !contentFitsScreen) setScrollEnabled(true)
  }

  function onContentSizeChange(_w: number, h: number) {
    scrollViewContentHeight.current = h
    updateScrollState()
  }

  function onLayout(e: LayoutChangeEvent) {
    scrollViewHeight.current = e.nativeEvent.layout.height
    updateScrollState()
  }

  if (preset === "auto") updateScrollState()

  return {
    onContentSizeChange,
    onLayout,
    scrollEnabled: preset === "auto" ? scrollEnabled : true,
  }
}

function ScreenWithoutScrolling(props: ScreenProps) {
  const { style, contentContainerStyle, children, preset } = props

  return (
    <View style={[outerStyle, style]}>
      <View style={[innerStyle, preset === "fixed" && justifyFlexEnd, contentContainerStyle]}>
        {children}
      </View>
    </View>
  )
}

function ScreenWithScrolling(props: ScreenProps) {
  const {
    children,
    keyboardShouldPersistTaps = "handled",
    keyboardBottomOffset = DEFAULT_BOTTOM_OFFSET,
    contentContainerStyle,
    ScrollViewProps,
    style,
  } = props as ScrollScreenProps
  const ref = useRef<KeyboardAwareScrollViewRef>(null)
  const { scrollEnabled, onContentSizeChange, onLayout } = useAutoPreset(props as AutoScreenProps)

  useScrollToTop(ref)

  return (
    <KeyboardAwareScrollView
      {...{ keyboardShouldPersistTaps, ref, scrollEnabled }}
      {...ScrollViewProps}
      bottomOffset={keyboardBottomOffset}
      contentContainerStyle={[
        innerStyle,
        ScrollViewProps?.contentContainerStyle,
        contentContainerStyle,
      ]}
      onContentSizeChange={(w, h) => {
        onContentSizeChange(w, h)
        ScrollViewProps?.onContentSizeChange?.(w, h)
      }}
      onLayout={(e) => {
        onLayout(e)
        ScrollViewProps?.onLayout?.(e)
      }}
      style={[outerStyle, ScrollViewProps?.style, style]}
    >
      {children}
    </KeyboardAwareScrollView>
  )
}

export function Screen(props: ScreenProps) {
  const {
    theme: { colors },
    themeContext,
  } = useAppTheme()
  const {
    backgroundColor,
    KeyboardAvoidingViewProps,
    keyboardOffset = 0,
    safeAreaEdges,
    SystemBarsProps,
    systemBarStyle,
  } = props
  const containerInsets = useSafeAreaInsetsStyle(safeAreaEdges)

  return (
    <View
      style={[containerStyle, { backgroundColor: backgroundColor || colors.background }, containerInsets]}
    >
      <SystemBars
        {...SystemBarsProps}
        style={systemBarStyle || (themeContext === "dark" ? "light" : "dark")}
      />
      <KeyboardAvoidingView
        {...KeyboardAvoidingViewProps}
        behavior={isIos ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
        style={[$styles.flex1, KeyboardAvoidingViewProps?.style]}
      >
        {isNonScrolling(props.preset) ? (
          <ScreenWithoutScrolling {...props} />
        ) : (
          <ScreenWithScrolling {...props} />
        )}
      </KeyboardAvoidingView>
    </View>
  )
}

const containerStyle: ViewStyle = {
  flex: 1,
  height: "100%",
  width: "100%",
}

const outerStyle: ViewStyle = {
  flex: 1,
  height: "100%",
  width: "100%",
}

const justifyFlexEnd: ViewStyle = {
  justifyContent: "flex-end",
}

const innerStyle: ViewStyle = {
  alignItems: "stretch",
  justifyContent: "flex-start",
}
