import { Pressable, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { type SharedValue } from "react-native-reanimated"

import { formatDurationLabel, formatTimeValue } from "@/core/date"
import { ProgressBar, Text, appTypography, useDesignTokens } from "@/ui"

import { formatSeconds } from "../time.utils"
import { timeHeroColors } from "./TimeHeroCard"
import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"
import { getShiftDurationHours } from "./timeOverview.utils"
import { CollapsibleSection, CollapseToggle, HeroCard, HeroStatusPill } from "./TimeOverviewShared"

export function ActiveCardContent({
  breakSeconds,
  collapsed,
  collapseProgress,
  elapsedSeconds,
  clockSession,
  onClockOut,
  onEndBreak,
  onStartBreak,
  onToggleCollapsed,
  showCollapseToggle = true,
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
  onToggleCollapsed?: () => void
  showCollapseToggle?: boolean
  status: "working" | "onBreak"
  totalBreakSeconds: number
}) {
  const tokens = useDesignTokens()
  const isOnBreak = status === "onBreak"
  const liveLocationLabel = clockSession.clockInLocation?.addressLabel ?? clockSession.venueAddress
  const isShiftSession =
    clockSession.source === "shift" &&
    Boolean(clockSession.scheduledStart && clockSession.scheduledEnd)
  const durationHours =
    isShiftSession && clockSession.scheduledStart && clockSession.scheduledEnd
      ? getShiftDurationHours(clockSession.scheduledStart, clockSession.scheduledEnd)
      : 0
  const shiftDurationSeconds = durationHours * 3600
  const progress =
    shiftDurationSeconds > 0 ? Math.min((elapsedSeconds / shiftDurationSeconds) * 100, 100) : 0
  const toneColor = isOnBreak ? tokens.warning : tokens.success
  const remainingSeconds = Math.max(shiftDurationSeconds - elapsedSeconds, 0)
  const secondaryLabel =
    isShiftSession && clockSession.scheduledStart && clockSession.scheduledEnd
      ? `${clockSession.scheduledStart} - ${clockSession.scheduledEnd} · ${clockSession.venueName}`
      : `${clockSession.venueName} timer`

  return (
    <HeroCard
      contentStyle={collapsed ? styles.heroContentCollapsed : undefined}
      gradientVariant="compact"
    >
      <View style={styles.heroTopRow}>
        <View style={styles.heroPrimaryStack}>
          <Text
            text={formatSeconds(isOnBreak ? breakSeconds : elapsedSeconds)}
            weight="bold"
            style={[
              appTypography.heroValue,
              styles.heroValue,
              styles.activeHeroValue,
              { color: isOnBreak ? tokens.warning : timeHeroColors.primaryText },
            ]}
          />
          <Text
            text={secondaryLabel}
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

      <CollapsibleSection fallbackHeight={220} progress={collapseProgress}>
        <>
          <View style={styles.timerPanel}>
            <Text
              text={
                isOnBreak
                  ? `${formatSeconds(elapsedSeconds)} worked`
                  : `Started at ${formatTimeValue(
                      clockSession.startedAt ?? clockSession.scheduledStart ?? new Date(),
                    )}`
              }
              size="xxs"
              weight="medium"
              style={{ color: timeHeroColors.secondaryText }}
            />
            <Text
              text={
                isOnBreak
                  ? `${formatDurationLabel(totalBreakSeconds)} total break`
                  : isShiftSession && remainingSeconds > 0
                    ? `${formatDurationLabel(remainingSeconds)} remaining`
                    : isShiftSession
                      ? "Shift target reached"
                      : `${clockSession.venueName} timer running`
              }
              size="xs"
              weight="semiBold"
              style={{ color: timeHeroColors.primaryText }}
            />
            {isShiftSession ? (
              <ProgressBar
                fillColor={toneColor}
                progress={progress}
                thickness={5}
                trackColor={tokens.border}
              />
            ) : null}
          </View>

          <View style={styles.heroStatusRow}>
            <Ionicons color={tokens.success} name="checkmark-circle-outline" size={14} />
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              text={`Location verified · ${liveLocationLabel}`}
              size="xxs"
              weight="medium"
              style={[styles.flex, { color: tokens.success }]}
            />
          </View>

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
        </>
      </CollapsibleSection>
    </HeroCard>
  )
}
