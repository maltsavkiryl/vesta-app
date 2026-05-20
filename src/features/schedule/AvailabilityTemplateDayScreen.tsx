import { StyleSheet, View } from "react-native"
import { Stack } from "expo-router"

import { availabilityWeekdayLabels } from "@/features/schedule/schedule.utils"
import {
  AvailabilityHoursSection,
  AvailabilityStatusSection,
} from "@/features/schedule/AvailabilityScreenSections"
import { AvailabilityTemplateTotalSpan } from "@/features/schedule/AvailabilityTemplateSections"
import { useAvailabilityTemplateDayScreen } from "@/features/schedule/useAvailabilityTemplateDayScreen"
import { AppScrollScreen, useDesignTokens } from "@/ui"

export function AvailabilityTemplateDayScreen() {
  const tokens = useDesignTokens()
  const {
    activeTimeField,
    day,
    editedRule,
    handleAndroidTimeChange,
    handleTimePress,
    pickerValue,
    setStatus,
  } = useAvailabilityTemplateDayScreen()

  return (
    <AppScrollScreen
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.surfaceSecondary }}
    >
      <Stack.Screen options={{ title: `${availabilityWeekdayLabels[day]} defaults` }} />

      <View style={styles.content}>
        <AvailabilityStatusSection onSelectStatus={setStatus} status={editedRule.status} />

        {editedRule.status !== "unavailable" ? (
          <View style={styles.timeSection}>
            <AvailabilityHoursSection
              activeTimeField={activeTimeField}
              endTime={editedRule.endTime}
              onAndroidTimeChange={handleAndroidTimeChange}
              onPressTime={handleTimePress}
              pickerValue={pickerValue}
              startTime={editedRule.startTime}
            />
            <AvailabilityTemplateTotalSpan
              endTime={editedRule.endTime}
              startTime={editedRule.startTime}
            />
          </View>
        ) : null}
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  screen: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timeSection: {
    gap: 8,
  },
})
