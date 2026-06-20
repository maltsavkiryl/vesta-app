import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getShiftTimeRange, formatShortDate, getRelativeDayLabel } from "@/core/date"
import type { Shift } from "@/core/models"
import type { AgendaSection } from "@/features/schedule/schedule.utils"
import { EmptyState, SectionTitle, useDesignTokens } from "@/ui"
import { SurfaceCard, Text } from "@/ui"
import { translate } from "@/i18n/translate"

export function PlanningShiftCard({
  onPress,
  shift,
}: {
  onPress: () => void
  shift: Shift
}) {
  const tokens = useDesignTokens()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${shift.role} at ${shift.venueName}, ${getShiftTimeRange(shift)}`}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
    >
      <SurfaceCard style={styles.shiftCard}>
        <View style={styles.shiftHeader}>
          <View style={styles.shiftMeta}>
            <Text size="xxs" style={{ color: tokens.accent }} text={getRelativeDayLabel(shift.date).toUpperCase()} weight="semiBold" />
            <Text size="xs" style={{ color: tokens.textSecondary }} text={formatShortDate(shift.date)} />
          </View>
          <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={14} />
        </View>
        <Text size="md" style={{ color: tokens.textPrimary }} text={getShiftTimeRange(shift)} weight="bold" />
        <View style={styles.shiftFooter}>
          <Ionicons color={tokens.textSecondary} name="business-outline" size={13} />
          <Text size="xxs" style={{ color: tokens.textSecondary }} text={shift.venueName} />
          <Text size="xxs" style={{ color: tokens.textMuted }} text="·" />
          <Text size="xxs" style={{ color: tokens.textSecondary }} text={shift.role} />
        </View>
        {shift.note ? (
          <Text size="xxs" style={{ color: tokens.textMuted }} text={shift.note} numberOfLines={2} />
        ) : null}
      </SurfaceCard>
    </Pressable>
  )
}

export function PlanningAgendaSection({
  onOpenShift,
  sections,
}: {
  onOpenShift: (id: string) => void
  sections: AgendaSection[]
}) {
  if (sections.length === 0) return null
  return (
    <View style={styles.agendaList}>
      {sections.map((section) => (
        <View key={section.label} style={styles.agendaSection}>
          <SectionTitle title={section.label} />
          {section.shifts.map((shift) => (
            <PlanningShiftCard
              key={shift.id}
              onPress={() => onOpenShift(shift.id)}
              shift={shift}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

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
  shiftCard: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  shiftFooter: {
    alignItems: "center",
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
})
