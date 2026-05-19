import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SelectionChip, SelectionRow, Text, appTypography, useDesignTokens } from "@/ui"
import { ONBOARDING_DAYS, ONBOARDING_TIME_SLOTS } from "./types"

export interface OnboardingAvailabilityProps {
  availabilityDays: string[]
  onDayToggle: (day: string) => void
  onTimeSlotChange: (slot: string) => void
  timeSlot: string
}

export function OnboardingAvailability({
  availabilityDays,
  onDayToggle,
  onTimeSlotChange,
  timeSlot,
}: OnboardingAvailabilityProps) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stackLarge}>
      <View style={styles.titleBlock}>
        <Text
          text="Your availability"
          weight="bold"
          style={[appTypography.onboardingTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text="Let your employer know when you can work. You can always change this later."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <Text text="DAYS" size="xxs" weight="semiBold" style={{ color: tokens.textMuted }} />
      <View style={styles.dayWrap}>
        {ONBOARDING_DAYS.map((day) => {
          return (
            <SelectionChip
              key={day}
              onPress={() => onDayToggle(day)}
              label={day}
              selected={availabilityDays.includes(day)}
            />
          )
        })}
      </View>

      <Text text="TYPICAL HOURS" size="xxs" weight="semiBold" style={{ color: tokens.textMuted }} />
      {ONBOARDING_TIME_SLOTS.map((slot) => (
        <ChoiceRow
          key={slot.id}
          selected={timeSlot === slot.id}
          subtitle={slot.sub}
          title={slot.label}
          onPress={() => onTimeSlotChange(slot.id)}
        />
      ))}
    </View>
  )
}

function ChoiceRow({
  selected,
  subtitle,
  title,
  onPress,
}: {
  selected: boolean
  subtitle: string
  title: string
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <SelectionRow
      onPress={onPress}
      selected={selected}
      subtitle={subtitle}
      title={title}
      trailing={
        selected ? (
          <View style={[styles.smallCheck, { backgroundColor: tokens.accent }]}>
            <Ionicons color={tokens.accentForeground} name="checkmark-outline" size={13} />
          </View>
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  dayWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  smallCheck: {
    alignItems: "center",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  stackLarge: {
    gap: 20,
  },
  titleBlock: {
    gap: 6,
  },
})
