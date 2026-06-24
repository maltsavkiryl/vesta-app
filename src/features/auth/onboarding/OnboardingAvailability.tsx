import { StyleSheet, View } from "react-native"

import { translate } from "@/i18n/translate"
import {
  SelectionChip,
  SelectionIndicator,
  SelectionRow,
  Text,
  appTypography,
  useDesignTokens,
} from "@/ui"

import { onboardingStyles } from "./onboarding.styles"
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
    <View style={onboardingStyles.section}>
      <View style={onboardingStyles.titleBlock}>
        <Text
          text={translate("onboarding:availability.title")}
          weight="bold"
          style={[appTypography.onboardingTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text={translate("onboarding:availability.subtitle")}
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <Text
        text={translate("onboarding:availability.days")}
        size="xxs"
        weight="semiBold"
        style={{ color: tokens.textMuted }}
      />
      <View style={styles.dayWrap}>
        {ONBOARDING_DAYS.map((day) => {
          return (
            <SelectionChip
              key={day.id}
              onPress={() => onDayToggle(day.id)}
              label={translate(day.labelKey)}
              selected={availabilityDays.includes(day.id)}
            />
          )
        })}
      </View>

      <Text
        text={translate("onboarding:availability.typicalHours")}
        size="xxs"
        weight="semiBold"
        style={{ color: tokens.textMuted }}
      />
      {ONBOARDING_TIME_SLOTS.map((slot) => (
        <ChoiceRow
          key={slot.id}
          selected={timeSlot === slot.id}
          subtitle={translate(slot.subKey)}
          title={translate(slot.labelKey)}
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
  return (
    <SelectionRow
      onPress={onPress}
      selected={selected}
      subtitle={subtitle}
      title={title}
      trailing={selected ? <SelectionIndicator /> : null}
    />
  )
}

const styles = StyleSheet.create({
  dayWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
})
