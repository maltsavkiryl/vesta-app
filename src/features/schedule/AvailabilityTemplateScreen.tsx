import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"

import type { AvailabilityWeekday } from "@/core/models"
import { getFallbackAvailabilityTemplate } from "@/features/schedule/availability-template.utils"
import {
  AvailabilityTemplateIntro,
  AvailabilityTemplateWeekdaySection,
} from "@/features/schedule/AvailabilityTemplateSections"
import { usePlanningAvailabilityQuery } from "@/features/planning/data/planning.queries"
import { AppScrollScreen, useDesignTokens } from "@/ui"

export function AvailabilityTemplateScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { state, isError } = usePlanningAvailabilityQuery()
  const template = state?.template ?? getFallbackAvailabilityTemplate()

  void isError

  const handlePressDay = (weekday: AvailabilityWeekday) => {
    router.push({
      pathname: "/(app)/availability-template/[day]",
      params: { day: weekday },
    })
  }

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
      topInset="none"
      variant="grouped"
    >
      <View style={styles.content}>
        <AvailabilityTemplateIntro />
        <AvailabilityTemplateWeekdaySection onPressDay={handlePressDay} template={template} />
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
})
