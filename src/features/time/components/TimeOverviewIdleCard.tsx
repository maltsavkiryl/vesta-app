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
import type { IdleClockCardState } from "./timeOverview.types"
import { CollapseToggle, HeroCard, HeroDetailRow, HeroStatusPill } from "./TimeOverviewShared"

export function IdleCardContent({
  collapsed,
  collapseProgress,
  idleState,
  onClockIn,
  onToggleCollapsed,
  showCollapseToggle = true,
}: {
  collapsed: boolean
  collapseProgress: SharedValue<number>
  idleState: IdleClockCardState
  onClockIn: () => void
  onToggleCollapsed?: () => void
  showCollapseToggle?: boolean
}) {
  const tokens = useDesignTokens()
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
  const eyebrowLabel =
    idleState.kind === "shift"
      ? "TODAY'S SHIFT"
      : idleState.kind === "unavailable"
        ? "CLOCK-IN UNAVAILABLE"
        : "READY TO TRACK"
  const statusPill =
    idleState.kind === "shift" ? (
      <HeroStatusPill icon="checkmark-circle-outline" text="Confirmed" tone="success" />
    ) : idleState.kind === "unavailable" ? (
      <HeroStatusPill icon="alert-circle-outline" text="Needs setup" tone="warning" />
    ) : (
      <HeroStatusPill icon="time-outline" text="No shift needed" tone="neutral" />
    )

  return (
    <HeroCard>
      <View style={styles.heroTopRow}>
        <View style={styles.flex}>
          <Text
            text={eyebrowLabel}
            size="xxs"
            weight="semiBold"
            style={[styles.caps, { color: timeHeroColors.tertiaryText }]}
          />
          <Text
            text={idleState.title}
            weight="bold"
            style={[
              appTypography.heroLarge,
              styles.heroValue,
              { color: timeHeroColors.primaryText },
            ]}
          />
          <Text
            text={idleState.subtitle}
            size="xs"
            style={{ color: timeHeroColors.secondaryText }}
          />
        </View>
        <View style={styles.headerActions}>
          {statusPill}
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
            detailLabel={idleState.detailLabel}
            helperLabel={idleState.helperLabel}
            navigateColor={tokens.success}
            warningColor={idleState.kind === "unavailable" ? tokens.warning : tokens.accent}
          />
        </View>

        <Animated.View style={[styles.idleDetailsViewport, idleDetailsAnimatedStyle]}>
          <Animated.View
            pointerEvents={collapsed ? "none" : "auto"}
            style={detailsContentAnimatedStyle}
          >
            <View importantForAccessibility={collapsed ? "no-hide-descendants" : "auto"}>
              <IdleDetails
                detailLabel={idleState.detailLabel}
                helperLabel={idleState.helperLabel}
                navigateColor={tokens.success}
                warningColor={idleState.kind === "unavailable" ? tokens.warning : tokens.accent}
              />
            </View>
          </Animated.View>
        </Animated.View>

        <InCardActionButton
          disabled={idleState.disabled}
          label={idleState.actionLabel}
          onPress={onClockIn}
          stopPropagation
        />
      </View>
    </HeroCard>
  )
}

function IdleDetails({
  detailLabel,
  helperLabel,
  navigateColor,
  warningColor,
}: {
  detailLabel: string
  helperLabel: string
  navigateColor: string
  warningColor: string
}) {
  return (
    <View style={styles.idleDetailsContent}>
      <HeroDetailRow
        icon="location-outline"
        text={detailLabel}
        trailing={<Ionicons color={navigateColor} name="navigate-circle-outline" size={18} />}
      />

      <View style={styles.heroDivider} />

      <View style={styles.heroInfoRow}>
        <Ionicons color={warningColor} name="flash-outline" size={13} />
        <Text text={helperLabel} size="xxs" weight="medium" style={{ color: warningColor }} />
      </View>
    </View>
  )
}
