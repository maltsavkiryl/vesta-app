import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"

import type { AvailabilityWeekday } from "@/core/models"
import { getFallbackAvailabilityTemplate } from "@/features/schedule/availability-template.utils"
import {
  AvailabilityTemplateIntro,
  AvailabilityTemplateWeekdaySection,
} from "@/features/schedule/AvailabilityTemplateSections"
import { usePlanningAvailabilityQuery } from "@/features/planning/data/planning.queries"
import { AppScrollScreen, EmptyState, Skeleton, SurfaceCard, useDesignTokens } from "@/ui"
import { MotionView } from "@/ui/composites/app-motion"
import { Ionicons } from "@expo/vector-icons"
import { translate } from "@/i18n/translate"

function AvailabilityTemplateSkeleton() {
  const tokens = useDesignTokens()
  return (
    <SurfaceCard style={styles.skeletonCard}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={[styles.skeletonRow, { gap: 12 }]}>
          <Skeleton height={14} width={14} radius={999} />
          <View style={styles.skeletonText}>
            <Skeleton height={12} width={100} radius={6} />
            <Skeleton height={10} width={140} radius={5} />
          </View>
        </View>
      ))}
    </SurfaceCard>
  )
}

export function AvailabilityTemplateScreen() {
  const router = useRouter()
  const tokens = useDesignTokens()
  const { state, isLoading, isError } = usePlanningAvailabilityQuery()
  const template = state?.template ?? getFallbackAvailabilityTemplate()

  const handlePressDay = (weekday: AvailabilityWeekday) => {
    router.push({
      pathname: "/(app)/availability-template/[day]",
      params: { day: weekday },
    })
  }

  if (isError && !state) {
    return (
      <AppScrollScreen
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.screen}
        style={{ backgroundColor: tokens.groupedBackground }}
        topInset="none"
        variant="grouped"
      >
        <EmptyState
          icon={<Ionicons color={tokens.textMuted} name="wifi-outline" size={18} />}
          subtitle={translate("planning:schedule.loadErrorSubtitle")}
          title={translate("planning:schedule.loadError")}
        />
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: tokens.groupedBackground }}
      topInset="none"
      variant="grouped"
    >
      <MotionView delay={0}>
        <View style={styles.content}>
          <AvailabilityTemplateIntro />
          {isLoading && !state ? (
            <AvailabilityTemplateSkeleton />
          ) : (
            <AvailabilityTemplateWeekdaySection onPressDay={handlePressDay} template={template} />
          )}
        </View>
      </MotionView>
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
  skeletonCard: {
    gap: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skeletonRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 72,
    paddingVertical: 10,
  },
  skeletonText: {
    flex: 1,
    gap: 6,
  },
})
