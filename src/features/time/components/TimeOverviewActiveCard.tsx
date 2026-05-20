import { type SharedValue } from "react-native-reanimated"

import { HeroCard, CollapsibleSection } from "./TimeOverviewShared"
import {
  ActiveCardLocation,
  ActiveCardMetrics,
} from "./TimeOverviewActiveCardStatus"
import {
  ActiveCardActions,
  ActiveCardHeader,
} from "./TimeOverviewActiveCardSections"
import { styles } from "./timeOverview.styles"
import type { TimeOverviewCardController } from "./timeOverview.types"

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
  const isOnBreak = status === "onBreak"

  return (
    <HeroCard
      contentStyle={collapsed ? styles.heroContentCollapsed : undefined}
      gradientVariant="compact"
    >
      <ActiveCardHeader
        breakSeconds={breakSeconds}
        clockSession={clockSession}
        collapsed={collapsed}
        collapseProgress={collapseProgress}
        elapsedSeconds={elapsedSeconds}
        isOnBreak={isOnBreak}
        onToggleCollapsed={onToggleCollapsed}
        showCollapseToggle={showCollapseToggle}
      />

      <CollapsibleSection fallbackHeight={220} progress={collapseProgress}>
        <>
          <ActiveCardMetrics
            clockSession={clockSession}
            elapsedSeconds={elapsedSeconds}
            isOnBreak={isOnBreak}
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
      </CollapsibleSection>
    </HeroCard>
  )
}
