import { View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated"

import { InCardActionButton, Text, appTypography, useDesignTokens } from "@/ui"

import { timeHeroColors } from "./TimeHeroCard"
import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"
import {
  formatDurationHoursLabel,
  getClockInOpenLabel,
  getShiftDurationHours,
} from "./timeOverview.utils"
import { CollapseToggle, HeroCard, HeroDetailRow, HeroStatusPill } from "./TimeOverviewShared"

export function IdleCardContent({
  clockSession,
  collapsed,
  collapseProgress,
  onClockIn,
  onToggleCollapsed,
  showCollapseToggle = true,
}: {
  clockSession: TimeOverviewCardController["state"]["clockSession"]
  collapsed: boolean
  collapseProgress: SharedValue<number>
  onClockIn: () => void
  onToggleCollapsed?: () => void
  showCollapseToggle?: boolean
}) {
  const tokens = useDesignTokens()
  const durationHours = getShiftDurationHours(
    clockSession.scheduledStart,
    clockSession.scheduledEnd,
  )
  const detailHeight = useSharedValue(96)
  const idleDetailsAnimatedStyle = useAnimatedStyle(() => ({
    height: detailHeight.value * collapseProgress.value,
    marginBottom: interpolate(collapseProgress.value, [0, 1], [0, 12], Extrapolation.CLAMP),
  }))
  const detailsContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      collapseProgress.value,
      [0, 0.42, 0.72, 1],
      [0, 0, 0.72, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(collapseProgress.value, [0, 1], [8, 0], Extrapolation.CLAMP),
      },
    ],
  }))

  return (
    <HeroCard>
      <View style={styles.heroTopRow}>
        <View style={styles.flex}>
          <Text
            text="TODAY'S SHIFT"
            size="xxs"
            weight="semiBold"
            style={[styles.caps, { color: timeHeroColors.tertiaryText }]}
          />
          <Text
            text={`${clockSession.scheduledStart} - ${clockSession.scheduledEnd}`}
            weight="bold"
            style={[
              appTypography.heroLarge,
              styles.heroValue,
              { color: timeHeroColors.primaryText },
            ]}
          />
          <Text
            text={`${clockSession.role} · ${formatDurationHoursLabel(durationHours)} planned`}
            size="xs"
            style={{ color: timeHeroColors.secondaryText }}
          />
        </View>
        <View style={styles.headerActions}>
          <HeroStatusPill icon="checkmark-circle-outline" text="Confirmed" tone="success" />
          {showCollapseToggle && onToggleCollapsed ? (
            <CollapseToggle
              collapsed={collapsed}
              onPress={onToggleCollapsed}
              progress={collapseProgress}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.idleLowerContent}>
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          onLayout={(event) => {
            const nextHeight = event.nativeEvent.layout.height
            if (nextHeight > 0) {
              detailHeight.value = nextHeight
            }
          }}
          pointerEvents="none"
          style={styles.hiddenMeasure}
        >
          <IdleDetails
            clockSession={clockSession}
            navigateColor={tokens.success}
            warningColor={tokens.warning}
          />
        </View>

        <Animated.View style={[styles.idleDetailsViewport, idleDetailsAnimatedStyle]}>
          <Animated.View
            pointerEvents={collapsed ? "none" : "auto"}
            style={detailsContentAnimatedStyle}
          >
            <View importantForAccessibility={collapsed ? "no-hide-descendants" : "auto"}>
              <IdleDetails
                clockSession={clockSession}
                navigateColor={tokens.success}
                warningColor={tokens.warning}
              />
            </View>
          </Animated.View>
        </Animated.View>

        <InCardActionButton label="Clock in" onPress={onClockIn} stopPropagation />
      </View>
    </HeroCard>
  )
}

function IdleDetails({
  clockSession,
  navigateColor,
  warningColor,
}: {
  clockSession: TimeOverviewCardController["state"]["clockSession"]
  navigateColor: string
  warningColor: string
}) {
  return (
    <View style={styles.idleDetailsContent}>
      <HeroDetailRow
        icon="location-outline"
        text={`${clockSession.venueName} · ${clockSession.venueAddress}`}
        trailing={<Ionicons color={navigateColor} name="navigate-circle-outline" size={18} />}
      />

      <View style={styles.heroDivider} />

      <View style={styles.heroInfoRow}>
        <Ionicons color={warningColor} name="flash-outline" size={13} />
        <Text
          text={`Clock-in opens at ${getClockInOpenLabel(clockSession.scheduledStart)}`}
          size="xxs"
          weight="medium"
          style={{ color: warningColor }}
        />
      </View>
    </View>
  )
}
