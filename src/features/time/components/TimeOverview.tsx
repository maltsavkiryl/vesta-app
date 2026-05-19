import { useEffect, useState } from "react"
import { Pressable } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"

import { useTimeDataQuery } from "@/features/time/data/time.queries"

import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"
import {
  CARD_LIFT_SPRING,
  CARD_PRESS_IN_SPRING,
  CARD_PRESS_OUT_SPRING,
  IOS_CLOSE_EASING,
  IOS_OPEN_SPRING,
} from "./timeOverview.utils"
import { ActiveCardContent } from "./TimeOverviewActiveCard"
import { IdleCardContent } from "./TimeOverviewIdleCard"

export { TimeHeader } from "./TimeOverviewShared"

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
  const { clockSession } = controller.state

  useEffect(() => {
    if (!collapsible) return

    if (collapsed) {
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

  const handleToggleCollapsed = () => setCollapsed((value) => !value)
  const animateCardPressIn = () => {
    cardScale.value = withSpring(0.992, CARD_PRESS_IN_SPRING)
  }
  const animateCardPressOut = (withBounce = false) => {
    cardScale.value = withSpring(1, {
      ...CARD_PRESS_OUT_SPRING,
      velocity: withBounce ? 1.4 : 0,
    })
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
        onClockIn={controller.handleClockIn}
        onToggleCollapsed={collapsible ? handleToggleCollapsed : undefined}
        showCollapseToggle={showCollapseToggle}
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
        onToggleCollapsed={collapsible ? handleToggleCollapsed : undefined}
        showCollapseToggle={showCollapseToggle}
        status={clockSession.state}
        totalBreakSeconds={controller.totalBreakSeconds}
      />
    )

  const animatedCard = <Animated.View style={cardAnimatedStyle}>{cardContent}</Animated.View>

  if (!collapsible) return animatedCard

  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        isCollapsed
          ? () => {
              animateCardPressOut(true)
              handleToggleCollapsed()
            }
          : handleToggleCollapsed
      }
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
