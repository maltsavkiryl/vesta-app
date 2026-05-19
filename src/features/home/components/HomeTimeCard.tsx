import { TimeOverviewCard } from "@/features/time/components/TimeOverview"
import { useTimeCardController } from "@/features/time/useTimeCardController"

export function HomeTimeCard() {
  const controller = useTimeCardController()

  return (
    <TimeOverviewCard
      collapsible
      controller={controller}
      defaultCollapsed
      showCollapseToggle={false}
    />
  )
}
