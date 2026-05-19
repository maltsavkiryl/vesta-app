import { type ReactNode } from "react"
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated"

import { MetaPill, MotionView, Text, appTypography, useDesignTokens } from "@/ui"
import { getTonePalette } from "@/ui/composites/appTone"

import { TimeHeroCard, timeHeroColors } from "./TimeHeroCard"
import { styles } from "./timeOverview.styles"

export function HeroCard({
  children,
  contentStyle,
  gradientVariant = "compact",
  style,
}: {
  children: ReactNode
  contentStyle?: StyleProp<ViewStyle>
  gradientVariant?: "default" | "compact"
  style?: StyleProp<ViewStyle>
}) {
  return (
    <TimeHeroCard
      contentStyle={[styles.heroContent, contentStyle]}
      gradientVariant={gradientVariant}
      style={style}
    >
      {children}
    </TimeHeroCard>
  )
}

export function HeroStatusPill({
  icon,
  text,
  tone = "neutral",
}: {
  icon: keyof typeof Ionicons.glyphMap
  text: string
  tone?: "neutral" | "success" | "warning"
}) {
  const tokens = useDesignTokens()
  const palette = getTonePalette(tokens, tone)
  const isNeutral = tone === "neutral"
  const backgroundColor = isNeutral ? timeHeroColors.divider : undefined
  const color = isNeutral ? timeHeroColors.secondaryText : palette.color

  return (
    <MetaPill
      backgroundColor={backgroundColor}
      label={text}
      leading={<Ionicons color={color} name={icon} size={12} />}
      textStyle={color ? { color } : undefined}
      tone={tone === "neutral" ? "neutral" : tone}
    />
  )
}

export function HeroDetailRow({
  icon,
  text,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap
  text: string
  trailing?: ReactNode
}) {
  return (
    <View style={styles.heroDetailRow}>
      <Ionicons color={timeHeroColors.tertiaryText} name={icon} size={16} />
      <Text
        numberOfLines={1}
        text={text}
        size="xs"
        style={[styles.flex, { color: timeHeroColors.secondaryText }]}
      />
      {trailing}
    </View>
  )
}

export function TimeHeader({
  delay = 0,
  status: _status,
}: {
  delay?: number
  status: "idle" | "working" | "onBreak"
}) {
  const tokens = useDesignTokens()

  return (
    <MotionView delay={delay} style={styles.header}>
      <Text
        text="Time"
        weight="bold"
        style={[appTypography.pageTitle, { color: tokens.textPrimary }]}
      />
    </MotionView>
  )
}

export function CollapsibleSection({
  children,
  fallbackHeight,
  progress,
}: {
  children: ReactNode
  fallbackHeight: number
  progress: SharedValue<number>
}) {
  const measuredHeight = useSharedValue(fallbackHeight)
  const handleLayout = (nextHeight: number) => {
    if (nextHeight > 0) {
      measuredHeight.value = nextHeight
    }
  }
  const animatedStyle = useAnimatedStyle(() => ({
    height: measuredHeight.value * progress.value,
    marginTop: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0.24, 1], Extrapolation.CLAMP),
    overflow: "hidden",
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [-4, 0], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(progress.value, [0, 1], [0.994, 1], Extrapolation.CLAMP),
      },
    ],
  }))

  return (
    <View style={styles.animatedSectionHost}>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        onLayout={(event) => handleLayout(event.nativeEvent.layout.height)}
        pointerEvents="none"
        style={styles.hiddenMeasure}
      >
        {children}
      </View>
      <Animated.View pointerEvents="box-none" style={animatedStyle}>
        <View>{children}</View>
      </Animated.View>
    </View>
  )
}

export function CollapseToggle({
  collapsed,
  onPress,
  progress,
}: {
  collapsed: boolean
  onPress: () => void
  progress: SharedValue<number>
}) {
  const tokens = useDesignTokens()
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, -180], Extrapolation.CLAMP)}deg`,
      },
    ],
  }))

  return (
    <Pressable
      accessibilityLabel={collapsed ? "Expand time card" : "Collapse time card"}
      accessibilityRole="button"
      onPress={(event) => {
        event.stopPropagation()
        onPress()
      }}
      style={({ pressed }) => [
        styles.collapseToggle,
        {
          backgroundColor: `${tokens.accentForeground}12`,
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <Animated.View style={chevronStyle}>
        <Ionicons color={`${tokens.accentForeground}D6`} name="chevron-down" size={16} />
      </Animated.View>
    </Pressable>
  )
}
