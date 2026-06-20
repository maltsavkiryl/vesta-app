import Animated from "react-native-reanimated"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getShiftTimeRange, formatShortDate, getRelativeDayLabel, isToday } from "@/core/date"
import type { Shift } from "@/core/models"
import type { AgendaSection } from "@/features/schedule/schedule.utils"
import { EmptyState, SectionTitle, Skeleton, useDesignTokens } from "@/ui"
import { SurfaceCard, Text } from "@/ui"
import { translate } from "@/i18n/translate"
import { useListItemEntrance } from "@/ui/foundations/motion"
import { usePressScale } from "@/ui/composites/app-motion"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function PlanningShiftCardSkeleton({ index }: { index: number }) {
  const tokens = useDesignTokens()
  const { animatedStyle } = useListItemEntrance(index)
  return (
    <Animated.View style={animatedStyle}>
      <SurfaceCard style={styles.shiftCard}>
        <View style={styles.skeletonHeader}>
          <Skeleton width={52} height={12} radius={6} />
          <Skeleton width={72} height={12} radius={6} />
        </View>
        <Skeleton width={120} height={20} radius={tokens.radiusSm} />
        <View style={styles.skeletonFooter}>
          <Skeleton width={16} height={16} radius={tokens.radiusSm} />
          <Skeleton width={180} height={12} radius={6} />
        </View>
      </SurfaceCard>
    </Animated.View>
  )
}

export function PlanningAgendaSectionSkeleton() {
  return (
    <View style={styles.agendaList}>
      <View style={styles.agendaSection}>
        <Skeleton width={80} height={13} radius={6} />
        {[0, 1].map((i) => (
          <PlanningShiftCardSkeleton key={i} index={i} />
        ))}
      </View>
      <View style={styles.agendaSection}>
        <Skeleton width={80} height={13} radius={6} />
        {[2].map((i) => (
          <PlanningShiftCardSkeleton key={i} index={i} />
        ))}
      </View>
    </View>
  )
}

// ─── Shift Card ───────────────────────────────────────────────────────────────

export function PlanningShiftCard({
  index = 0,
  onPress,
  shift,
}: {
  index?: number
  onPress: () => void
  shift: Shift
}) {
  const tokens = useDesignTokens()
  const { animatedStyle: entranceStyle } = useListItemEntrance(index, { baseDelay: 40 })
  const { animatedStyle: pressStyle, pressHandlers } = usePressScale({ pressedScale: 0.975 })

  const dayLabel = getRelativeDayLabel(shift.date)
  const isTodayShift = isToday(shift.date)

  return (
    <Animated.View style={entranceStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${shift.role} at ${shift.venueName}, ${getShiftTimeRange(shift)}`}
        onPress={onPress}
        {...pressHandlers}
      >
        <Animated.View style={pressStyle}>
          <SurfaceCard
            elevationLevel={isTodayShift ? 1 : 0}
            style={[
              styles.shiftCard,
              isTodayShift && {
                borderColor: tokens.accentSoft,
                borderWidth: 1,
              },
            ]}
          >
            {/* Date row */}
            <View style={styles.shiftHeader}>
              <View style={styles.shiftMeta}>
                <Text
                  size="xxs"
                  style={[
                    styles.dayLabel,
                    { color: isTodayShift ? tokens.accent : tokens.textMuted },
                  ]}
                  text={dayLabel.toUpperCase()}
                  weight="semiBold"
                />
                <Text
                  size="xxs"
                  style={{ color: tokens.textMuted }}
                  text={formatShortDate(shift.date)}
                />
              </View>
              {/* Decorative chevron — hidden from screen readers */}
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={14} />
              </View>
            </View>

            {/* Time — hero size */}
            <Text
              size="md"
              style={[styles.shiftTime, { color: tokens.textPrimary }]}
              text={getShiftTimeRange(shift)}
              weight="bold"
            />

            {/* Venue + role chips */}
            <View style={styles.shiftFooter}>
              <View style={[styles.chip, { backgroundColor: tokens.accentMuted }]}>
                {/* Decorative building icon — hidden from screen readers */}
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <Ionicons color={tokens.accent} name="business-outline" size={12} />
                </View>
                <Text
                  size="xxs"
                  style={{ color: tokens.accent }}
                  text={shift.venueName}
                  weight="medium"
                  numberOfLines={1}
                />
              </View>
              <View style={[styles.chip, { backgroundColor: tokens.backgroundMuted }]}>
                <Text
                  size="xxs"
                  style={{ color: tokens.textSecondary }}
                  text={shift.role}
                  numberOfLines={1}
                />
              </View>
            </View>

            {/* Optional note preview */}
            {shift.note ? (
              <View style={styles.noteRow}>
                {/* Decorative note icon — hidden from screen readers */}
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <Ionicons color={tokens.textMuted} name="document-text-outline" size={12} />
                </View>
                <Text
                  size="xxs"
                  style={{ color: tokens.textMuted }}
                  text={shift.note}
                  numberOfLines={1}
                />
              </View>
            ) : null}
          </SurfaceCard>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

// ─── Agenda list ──────────────────────────────────────────────────────────────

export function PlanningAgendaSection({
  onOpenShift,
  sections,
}: {
  onOpenShift: (id: string) => void
  sections: AgendaSection[]
}) {
  if (sections.length === 0) return null

  // Track a global card index for stagger across all sections
  let cardIndex = 0

  return (
    <View style={styles.agendaList}>
      {sections.map((section) => (
        <View key={section.label} style={styles.agendaSection}>
          <SectionTitle title={section.label} />
          {section.shifts.map((shift) => {
            const idx = cardIndex++
            return (
              <PlanningShiftCard
                key={shift.id}
                index={idx}
                onPress={() => onOpenShift(shift.id)}
                shift={shift}
              />
            )
          })}
        </View>
      ))}
    </View>
  )
}

// ─── Empty ────────────────────────────────────────────────────────────────────

export function PlanningShiftsEmpty() {
  const tokens = useDesignTokens()
  return (
    <EmptyState
      icon={<Ionicons color={tokens.textMuted} name="calendar-outline" size={18} />}
      subtitle={translate("planning:schedule.noShiftsSubtitle")}
      title={translate("planning:schedule.noShifts")}
    />
  )
}

const styles = StyleSheet.create({
  agendaList: {
    gap: 22,
  },
  agendaSection: {
    gap: 10,
  },
  chip: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    flexShrink: 1,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dayLabel: {
    letterSpacing: 0.4,
  },
  noteRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  shiftCard: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  shiftFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  shiftHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shiftMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  shiftTime: {
    fontSize: 20,
    lineHeight: 26,
  },
  skeletonFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  skeletonHeader: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
})
