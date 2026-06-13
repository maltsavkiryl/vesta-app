import { View } from "react-native"
import { type SharedValue } from "react-native-reanimated"

import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"
import { ActiveCardActions, ActiveCardHeader } from "./TimeOverviewActiveCardSections"
import { ActiveCardLocation, ActiveCardMetrics } from "./TimeOverviewActiveCardStatus"
import { CollapsibleSection, HeroCard } from "./TimeOverviewShared"

export function ActiveCardContent({
  averageHourlyRate,
  breakSeconds,
  collapsed,
  collapseProgress,
  elapsedSeconds,
  clockSession,
  liveEarnings,
  onClockOut,
  onEndBreak,
  onStartBreak,
  onToggleCollapsed,
  payableSeconds,
  showCollapseToggle = true,
  status,
  totalBreakSeconds,
}: {
  averageHourlyRate: number
  breakSeconds: number
  collapsed: boolean
  collapseProgress: SharedValue<number>
  elapsedSeconds: number
  clockSession: TimeOverviewCardController["state"]["clockSession"]
  liveEarnings: number
  onClockOut: () => void
  onEndBreak: () => void
  onStartBreak: () => void
  onToggleCollapsed?: () => void
  payableSeconds: number
  showCollapseToggle?: boolean
  status: "working" | "onBreak"
  totalBreakSeconds: number
}) {
  const isOnBreak = status === "onBreak"
  const isCollapsible = Boolean(onToggleCollapsed)
  const expandedContent = (
    <>
      <ActiveCardMetrics
        clockSession={clockSession}
        isOnBreak={isOnBreak}
        payableSeconds={payableSeconds}
        totalBreakSeconds={totalBreakSeconds}
      />
      <ActiveCardLocation clockSession={clockSession} />
      <ActiveCardActions
        isOnBreak={isOnBreak}
        onClockOut={onClockOut}
        onEndBreak={onEndBreak}
        onStartBreak={onStartBreak}
      />
    </>
  )

  return (
    <HeroCard
      contentStyle={collapsed ? styles.heroContentCollapsed : undefined}
      gradientVariant="compact"
    >
      <ActiveCardHeader
        averageHourlyRate={averageHourlyRate}
        breakSeconds={breakSeconds}
        clockSession={clockSession}
        collapsed={collapsed}
        collapseProgress={collapseProgress}
        elapsedSeconds={elapsedSeconds}
        isOnBreak={isOnBreak}
        liveEarnings={liveEarnings}
        onToggleCollapsed={onToggleCollapsed}
        payableSeconds={payableSeconds}
        showCollapseToggle={showCollapseToggle}
      />

      {isCollapsible ? (
        <CollapsibleSection fallbackHeight={220} progress={collapseProgress}>
          {expandedContent}
        </CollapsibleSection>
      ) : (
        <View style={styles.staticExpandedSection}>{expandedContent}</View>
      )}
    </HeroCard>
  )
}
