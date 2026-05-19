import { useEffect, useState, type ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated"

import { formatDurationLabel, formatTimeValue } from "@/core/date"
import { useTimeDataQuery } from "@/features/time/data/time.queries"
import {
  InCardActionButton,
  MetaPill,
  ProgressBar,
  Text,
  appTypography,
  useDesignTokens,
} from "@/ui"

import { formatSeconds } from "../time.utils"
import { TimeHeroCard } from "./TimeHeroCard"

const HERO_SURFACE_DIVIDER = "rgba(255, 255, 255, 0.10)"
const IOS_CLOSE_EASING = Easing.bezier(0.22, 0.61, 0.36, 1)
const IOS_OPEN_SPRING = {
  damping: 23,
  mass: 0.92,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  stiffness: 205,
}
const CARD_LIFT_SPRING = {
  damping: 20,
  mass: 0.88,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  stiffness: 215,
}
const CARD_PRESS_IN_SPRING = {
  damping: 22,
  mass: 0.9,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  stiffness: 300,
}
const CARD_PRESS_OUT_SPRING = {
  damping: 16,
  mass: 0.84,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
  stiffness: 225,
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function getShiftDurationHours(start: string, end: string) {
  let minutes = timeToMinutes(end) - timeToMinutes(start)
  if (minutes < 0) minutes += 24 * 60
  return Math.round((minutes / 60) * 10) / 10
}

function formatDurationHoursLabel(hours: number) {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (wholeHours === 0) return `${minutes}m`
  if (minutes === 0) return `${wholeHours}h`
  return `${wholeHours}h ${minutes}m`
}

function getClockInOpenLabel(start: string) {
  const minutes = (timeToMinutes(start) + 24 * 60 - 15) % (24 * 60)
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0")
  const minuteValue = String(minutes % 60).padStart(2, "0")
  return `${hours}:${minuteValue}`
}

function HeroCard({
  children,
  gradientVariant = "compact",
  style,
}: {
  children: ReactNode
  gradientVariant?: "default" | "compact"
  style?: object
}) {
  return (
    <TimeHeroCard contentStyle={styles.heroContent} gradientVariant={gradientVariant} style={style}>
      {children}
    </TimeHeroCard>
  )
}

function HeroStatusPill({
  icon,
  text,
  tone = "default",
}: {
  icon: keyof typeof Ionicons.glyphMap
  text: string
  tone?: "default" | "success" | "warning"
}) {
  const tokens = useDesignTokens()
  const color =
    tone === "success"
      ? tokens.success
      : tone === "warning"
        ? tokens.warning
        : `${tokens.accentForeground}D6`

  return (
    <MetaPill
      backgroundColor={`${tokens.accentForeground}12`}
      label={text}
      leading={<Ionicons color={color} name={icon} size={12} />}
      textStyle={{ color }}
    />
  )
}

function HeroDetailRow({
  icon,
  text,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap
  text: string
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.heroDetailRow}>
      <Ionicons color={`${tokens.accentForeground}80`} name={icon} size={16} />
      <Text
        numberOfLines={1}
        text={text}
        size="xs"
        style={[styles.flex, { color: `${tokens.accentForeground}C7` }]}
      />
      {trailing}
    </View>
  )
}

export function TimeHeader({ status: _status }: { status: "idle" | "working" | "onBreak" }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.header}>
      <Text
        text="Time"
        weight="bold"
        style={[appTypography.pageTitle, { color: tokens.textPrimary }]}
      />
    </View>
  )
}

type TimeOverviewCardController = {
  elapsedSeconds: number
  handleClockIn: () => void
  handleEndBreak: () => void
  handleStartBreak: () => void
  openClockOut: () => void
  snapshot: {
    breakSeconds: number
  }
  state: {
    clockSession: {
      accumulatedBreakSeconds: number
      breakStartedAt?: string
      role: string
      scheduledEnd: string
      scheduledStart: string
      startedAt?: string
      state: "idle" | "working" | "onBreak"
      venueAddress: string
      venueName: string
    }
  }
  totalBreakSeconds: number
}

function CollapsibleSection({
  children,
  fallbackHeight,
  progress,
}: {
  children: ReactNode
  fallbackHeight: number
  progress: SharedValue<number>
}) {
  const measuredHeight = useSharedValue(fallbackHeight)
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
    <Animated.View pointerEvents="box-none" style={animatedStyle}>
      <View
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height
          if (nextHeight > 0) {
            measuredHeight.value = nextHeight
          }
        }}
      >
        {children}
      </View>
    </Animated.View>
  )
}

function CollapsedActionFooter({
  children,
  interactive,
  progress,
}: {
  children: ReactNode
  interactive: boolean
  progress: SharedValue<number>
}) {
  const measuredHeight = useSharedValue(52)
  const animatedStyle = useAnimatedStyle(() => {
    const inverseProgress = 1 - progress.value

    return {
      height: measuredHeight.value * inverseProgress,
      marginTop: interpolate(inverseProgress, [0, 1], [0, 1], Extrapolation.CLAMP),
      opacity: interpolate(inverseProgress, [0, 0.45, 1], [0, 0.5, 1], Extrapolation.CLAMP),
      overflow: "hidden",
      transform: [
        {
          translateY: interpolate(inverseProgress, [0, 1], [-2, 0], Extrapolation.CLAMP),
        },
      ],
    }
  })

  return (
    <Animated.View pointerEvents={interactive ? "auto" : "none"} style={animatedStyle}>
      <View
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height
          if (nextHeight > 0) {
            measuredHeight.value = nextHeight
          }
        }}
      >
        {children}
      </View>
    </Animated.View>
  )
}

function CollapseToggle({
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

function IdleCardContent({
  clockSession,
  collapsed,
  collapseProgress,
  collapsedFooterInteractive,
  onClockIn,
  showCollapseToggle = true,
  onToggleCollapsed,
}: {
  clockSession: TimeOverviewCardController["state"]["clockSession"]
  collapsed: boolean
  collapseProgress: SharedValue<number>
  collapsedFooterInteractive: boolean
  onClockIn: () => void
  showCollapseToggle?: boolean
  onToggleCollapsed?: () => void
}) {
  const tokens = useDesignTokens()
  const durationHours = getShiftDurationHours(
    clockSession.scheduledStart,
    clockSession.scheduledEnd,
  )

  return (
    <HeroCard>
      <View style={styles.heroTopRow}>
        <View style={styles.flex}>
          <Text
            text="TODAY'S SHIFT"
            size="xxs"
            weight="semiBold"
            style={[styles.caps, { color: `${tokens.accentForeground}99` }]}
          />
          <Text
            text={`${clockSession.scheduledStart} - ${clockSession.scheduledEnd}`}
            weight="bold"
            style={[styles.heroShiftTime, { color: tokens.accentForeground }]}
          />
          <Text
            text={`${clockSession.role} · ${formatDurationHoursLabel(durationHours)} planned`}
            size="xs"
            style={{ color: `${tokens.accentForeground}BF` }}
          />
        </View>
        <View style={styles.headerActions}>
          <HeroStatusPill icon="checkmark-circle" text="Confirmed" tone="success" />
          {showCollapseToggle && onToggleCollapsed ? (
            <CollapseToggle
              collapsed={collapsed}
              onPress={onToggleCollapsed}
              progress={collapseProgress}
            />
          ) : null}
        </View>
      </View>

      <CollapsibleSection fallbackHeight={148} progress={collapseProgress}>
        <>
          <HeroDetailRow
            icon="location-outline"
            text={`${clockSession.venueName} · ${clockSession.venueAddress}`}
            trailing={<Ionicons color={tokens.success} name="navigate-circle-outline" size={18} />}
          />

          <View style={styles.heroDivider} />

          <View style={styles.heroInfoRow}>
            <Ionicons color={tokens.warning} name="flash-outline" size={13} />
            <Text
              text={`Clock-in opens at ${getClockInOpenLabel(clockSession.scheduledStart)}`}
              size="xxs"
              weight="medium"
              style={{ color: tokens.warning }}
            />
          </View>

          <View style={styles.heroFooter}>
            <InCardActionButton label="Clock in" onPress={onClockIn} stopPropagation />
          </View>
        </>
      </CollapsibleSection>

      <CollapsedActionFooter interactive={collapsedFooterInteractive} progress={collapseProgress}>
        <View style={styles.heroFooter}>
          <InCardActionButton label="Clock in" onPress={onClockIn} stopPropagation />
        </View>
      </CollapsedActionFooter>
    </HeroCard>
  )
}

function ActiveCardContent({
  breakSeconds,
  collapsed,
  collapseProgress,
  elapsedSeconds,
  clockSession,
  onClockOut,
  onEndBreak,
  onStartBreak,
  showCollapseToggle = true,
  onToggleCollapsed,
  status,
  totalBreakSeconds,
}: {
  breakSeconds: number
  collapsed: boolean
  collapseProgress: SharedValue<number>
  elapsedSeconds: number
  clockSession: TimeOverviewCardController["state"]["clockSession"]
  onClockOut: () => void
  onEndBreak: () => void
  onStartBreak: () => void
  showCollapseToggle?: boolean
  onToggleCollapsed?: () => void
  status: "working" | "onBreak"
  totalBreakSeconds: number
}) {
  const tokens = useDesignTokens()
  const isOnBreak = status === "onBreak"
  const durationHours = getShiftDurationHours(
    clockSession.scheduledStart,
    clockSession.scheduledEnd,
  )
  const shiftDurationSeconds = durationHours * 3600
  const progress = Math.min((elapsedSeconds / shiftDurationSeconds) * 100, 100)
  const toneColor = isOnBreak ? tokens.warning : tokens.success
  const remainingSeconds = Math.max(shiftDurationSeconds - elapsedSeconds, 0)

  return (
    <HeroCard gradientVariant="compact">
      <View style={styles.heroTopRow}>
        <View style={styles.heroPrimaryStack}>
          <Text
            text={formatSeconds(isOnBreak ? breakSeconds : elapsedSeconds)}
            weight="bold"
            style={[
              styles.heroTimerValue,
              { color: isOnBreak ? tokens.warning : tokens.accentForeground },
            ]}
          />
          <Text
            text={`${clockSession.scheduledStart} - ${clockSession.scheduledEnd} · ${clockSession.role}`}
            numberOfLines={1}
            size="xs"
            style={{ color: `${tokens.accentForeground}BF` }}
          />
        </View>
        <View style={styles.headerActions}>
          <HeroStatusPill
            icon={isOnBreak ? "cafe-outline" : "radio-outline"}
            text={isOnBreak ? "On break" : "Working"}
            tone={isOnBreak ? "warning" : "success"}
          />
          {showCollapseToggle && onToggleCollapsed ? (
            <CollapseToggle
              collapsed={collapsed}
              onPress={onToggleCollapsed}
              progress={collapseProgress}
            />
          ) : null}
        </View>
      </View>

      <CollapsibleSection fallbackHeight={220} progress={collapseProgress}>
        <>
          <View style={styles.timerPanel}>
            <Text
              text={
                isOnBreak
                  ? `${formatSeconds(elapsedSeconds)} worked`
                  : `Started at ${formatTimeValue(clockSession.startedAt ?? clockSession.scheduledStart)}`
              }
              size="xxs"
              weight="medium"
              style={{ color: `${tokens.accentForeground}B3` }}
            />
            <Text
              text={
                isOnBreak
                  ? `${formatDurationLabel(totalBreakSeconds)} total break`
                  : remainingSeconds > 0
                    ? `${formatDurationLabel(remainingSeconds)} remaining`
                    : "Shift target reached"
              }
              size="xs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
            <ProgressBar
              fillColor={toneColor}
              progress={progress}
              thickness={5}
              trackColor={`${tokens.accentForeground}14`}
            />
          </View>

          <View style={styles.heroStatusRow}>
            <Ionicons color={tokens.success} name="checkmark-circle-outline" size={14} />
            <Text
              text={`Location verified · ${clockSession.venueName}`}
              size="xxs"
              weight="medium"
              style={[styles.flex, { color: tokens.success }]}
            />
            <Text text="On site" size="xxs" weight="semiBold" style={{ color: tokens.success }} />
          </View>

          {isOnBreak ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation()
                onEndBreak()
              }}
              style={[
                styles.breakButton,
                { backgroundColor: `${tokens.warning}10`, borderColor: `${tokens.warning}24` },
              ]}
            >
              <Ionicons color={tokens.warning} name="play-outline" size={17} />
              <Text
                text="End break"
                size="xs"
                weight="semiBold"
                style={{ color: tokens.warning }}
              />
            </Pressable>
          ) : (
            <View style={styles.actionGrid}>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation()
                  onStartBreak()
                }}
                style={[
                  styles.secondaryAction,
                  {
                    backgroundColor: tokens.isDark
                      ? `${tokens.accentForeground}0D`
                      : `${tokens.accentForeground}10`,
                    borderColor: `${tokens.accentForeground}12`,
                  },
                ]}
              >
                <Ionicons color={`${tokens.accentForeground}BF`} name="cafe-outline" size={16} />
                <Text
                  text="Start break"
                  size="xs"
                  weight="medium"
                  style={{ color: tokens.accentForeground }}
                />
              </Pressable>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation()
                  onClockOut()
                }}
                style={[
                  styles.dangerAction,
                  { backgroundColor: `${tokens.danger}10`, borderColor: `${tokens.danger}24` },
                ]}
              >
                <Text
                  text="Clock out"
                  size="xs"
                  weight="semiBold"
                  style={{ color: tokens.danger }}
                />
              </Pressable>
            </View>
          )}
        </>
      </CollapsibleSection>
    </HeroCard>
  )
}

export function TimeOverviewCard({
  collapsible = false,
  controller,
  defaultCollapsed = false,
  showCollapseToggle = true,
}: {
  collapsible?: boolean
  controller: TimeOverviewCardController
  defaultCollapsed?: boolean
  showCollapseToggle?: boolean
}) {
  const [collapsed, setCollapsed] = useState(collapsible ? defaultCollapsed : false)
  const collapseProgress = useSharedValue(collapsed ? 0 : 1)
  const cardScale = useSharedValue(1)
  const cardLift = useSharedValue(collapsed ? 0 : -1.5)
  const isCollapsed = collapsible && collapsed
  const collapsedFooterInteractive = isCollapsed
  const { clockSession } = controller.state

  useEffect(() => {
    if (!collapsible) return

    const nextCollapsed = collapsed

    if (nextCollapsed) {
      cardScale.value = withSequence(
        withTiming(0.994, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 190, easing: IOS_CLOSE_EASING }),
      )
      collapseProgress.value = withTiming(0, {
        duration: 255,
        easing: IOS_CLOSE_EASING,
      })
      cardLift.value = withSequence(
        withTiming(-0.2, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 210, easing: IOS_CLOSE_EASING }),
      )
      return
    }

    collapseProgress.value = withSpring(1, IOS_OPEN_SPRING)
    cardLift.value = withSpring(-0.75, CARD_LIFT_SPRING)
  }, [cardLift, cardScale, collapseProgress, collapsed, collapsible])

  const handleToggleCollapsed = () => {
    setCollapsed((value) => !value)
  }

  const animateCardPressIn = () => {
    cardScale.value = withSpring(0.992, CARD_PRESS_IN_SPRING)
  }

  const animateCardPressOut = (withBounce = false) => {
    cardScale.value = withSpring(1, {
      ...CARD_PRESS_OUT_SPRING,
      velocity: withBounce ? 1.4 : 0,
    })
  }

  const handleCollapsedCardPress = () => {
    animateCardPressOut(true)
    handleToggleCollapsed()
  }

  const handleExpandedCardPress = () => {
    handleToggleCollapsed()
  }

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardLift.value }, { scale: cardScale.value }],
  }))

  const cardContent =
    clockSession.state === "idle" ? (
      <IdleCardContent
        clockSession={clockSession}
        collapsed={isCollapsed}
        collapseProgress={collapseProgress}
        collapsedFooterInteractive={collapsedFooterInteractive}
        onClockIn={controller.handleClockIn}
        showCollapseToggle={showCollapseToggle}
        onToggleCollapsed={collapsible ? handleToggleCollapsed : undefined}
      />
    ) : (
      <ActiveCardContent
        breakSeconds={clockSession.state === "onBreak" ? controller.snapshot.breakSeconds : 0}
        collapsed={isCollapsed}
        collapseProgress={collapseProgress}
        elapsedSeconds={controller.elapsedSeconds}
        clockSession={clockSession}
        onClockOut={controller.openClockOut}
        onEndBreak={controller.handleEndBreak}
        onStartBreak={controller.handleStartBreak}
        showCollapseToggle={showCollapseToggle}
        onToggleCollapsed={collapsible ? handleToggleCollapsed : undefined}
        status={clockSession.state}
        totalBreakSeconds={controller.totalBreakSeconds}
      />
    )

  const animatedCard = <Animated.View style={cardAnimatedStyle}>{cardContent}</Animated.View>

  if (!collapsible) return animatedCard

  return (
    <Pressable
      accessibilityRole="button"
      onPress={isCollapsed ? handleCollapsedCardPress : handleExpandedCardPress}
      onPressIn={isCollapsed ? animateCardPressIn : undefined}
      onPressOut={isCollapsed ? () => animateCardPressOut() : undefined}
      style={styles.cardPressable}
    >
      {animatedCard}
    </Pressable>
  )
}

export function IdleClockCard({ onClockIn }: { onClockIn: () => void }) {
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession
  const collapseProgress = useSharedValue(1)

  if (!clockSession) return null

  return (
    <IdleCardContent
      clockSession={clockSession}
      collapsed={false}
      collapseProgress={collapseProgress}
      collapsedFooterInteractive={false}
      onClockIn={onClockIn}
    />
  )
}

export function ActiveClockCard({
  breakSeconds,
  elapsedSeconds,
  onClockOut,
  onEndBreak,
  onStartBreak,
  status,
  totalBreakSeconds,
}: {
  breakSeconds: number
  elapsedSeconds: number
  onClockOut: () => void
  onEndBreak: () => void
  onStartBreak: () => void
  status: "working" | "onBreak"
  totalBreakSeconds: number
}) {
  const query = useTimeDataQuery()
  const clockSession = query.data?.clockSession
  const collapseProgress = useSharedValue(1)

  if (!clockSession) return null

  return (
    <ActiveCardContent
      breakSeconds={breakSeconds}
      collapsed={false}
      collapseProgress={collapseProgress}
      elapsedSeconds={elapsedSeconds}
      clockSession={clockSession}
      onClockOut={onClockOut}
      onEndBreak={onEndBreak}
      onStartBreak={onStartBreak}
      status={status}
      totalBreakSeconds={totalBreakSeconds}
    />
  )
}

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  breakButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  caps: {
    letterSpacing: 0,
  },
  cardPressable: {
    width: "100%",
  },
  collapseToggle: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  dangerAction: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  heroContent: {
    gap: 16,
    zIndex: 1,
  },
  heroDetailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  heroDivider: {
    backgroundColor: HERO_SURFACE_DIVIDER,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 4,
  },
  heroFooter: {
    marginTop: 2,
  },
  heroInfoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  heroPrimaryStack: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
  },
  heroShiftTime: {
    fontSize: 31,
    lineHeight: 36,
    marginTop: 2,
  },
  heroStatusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  heroTimerValue: {
    fontSize: 35,
    lineHeight: 40,
    marginTop: 2,
  },
  heroTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  secondaryAction: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  timerPanel: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 10,
    paddingTop: 4,
  },
})
