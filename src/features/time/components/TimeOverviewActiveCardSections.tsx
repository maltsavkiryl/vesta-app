import { Pressable, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { type SharedValue } from "react-native-reanimated"

import { Text, appTypography, useDesignTokens } from "@/ui"

import { formatHours, formatSeconds } from "../time.utils"
import { timeHeroColors } from "./TimeHeroCard"
import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"
import { EarningsTicker } from "./TimeOverviewActiveCardStatus"
import { CollapseToggle, HeroStatusPill } from "./TimeOverviewShared"

type ClockSession = TimeOverviewCardController["state"]["clockSession"]

export function ActiveCardHeader({
  averageHourlyRate,
  breakSeconds,
  clockSession,
  collapsed,
  collapseProgress,
  elapsedSeconds,
  isOnBreak,
  liveEarnings,
  onToggleCollapsed,
  payableSeconds,
  showCollapseToggle,
}: {
  averageHourlyRate: number
  breakSeconds: number
  clockSession: ClockSession
  collapsed: boolean
  collapseProgress: SharedValue<number>
  elapsedSeconds: number
  isOnBreak: boolean
  liveEarnings: number
  onToggleCollapsed?: () => void
  payableSeconds: number
  showCollapseToggle: boolean
}) {
  const tokens = useDesignTokens()
  const venueLabel =
    clockSession.source === "shift" && clockSession.scheduledStart && clockSession.scheduledEnd
      ? `${clockSession.scheduledStart} - ${clockSession.scheduledEnd} · ${clockSession.venueName}`
      : clockSession.venueName
  // The big timer is the honest payable (worked-minus-break) figure — the same
  // value that drives the live earnings ticker and clock-out pay. Total time on
  // shift is shown beneath so nothing is hidden.
  const heroSeconds = isOnBreak ? breakSeconds : payableSeconds
  const onShiftLabel = `On shift ${formatHours(elapsedSeconds)} · ${venueLabel}`

  return (
    <View style={styles.heroTopRow}>
      <View style={styles.heroPrimaryStack}>
        <Text
          text={formatSeconds(heroSeconds)}
          weight="bold"
          accessibilityLabel={
            isOnBreak
              ? `On break ${formatHours(breakSeconds)}`
              : `Payable time ${formatHours(payableSeconds)}`
          }
          style={[
            appTypography.heroValue,
            styles.heroValue,
            styles.activeHeroValue,
            { color: isOnBreak ? tokens.warning : timeHeroColors.primaryText },
          ]}
        />
        <EarningsTicker
          earnings={liveEarnings}
          hourlyRate={averageHourlyRate}
          isOnBreak={isOnBreak}
        />
        <Text
          text={isOnBreak ? venueLabel : onShiftLabel}
          numberOfLines={1}
          size="xs"
          style={{ color: timeHeroColors.secondaryText }}
        />
      </View>
      <View style={styles.headerActions}>
        <HeroStatusPill
          icon={isOnBreak ? "cafe-outline" : "pulse-outline"}
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
  )
}

export function ActiveCardActions({
  isOnBreak,
  onClockOut,
  onEndBreak,
  onStartBreak,
}: {
  isOnBreak: boolean
  onClockOut: () => void
  onEndBreak: () => void
  onStartBreak: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.actionSection}>
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
          <Text text="End break" size="xs" weight="semiBold" style={{ color: tokens.warning }} />
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
              { backgroundColor: tokens.danger, borderColor: `${tokens.danger}D9` },
            ]}
          >
            <Ionicons color={tokens.accentForeground} name="log-out-outline" size={17} />
            <Text
              text="Clock out"
              size="xs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
          </Pressable>
        </View>
      )}
    </View>
  )
}
