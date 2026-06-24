import { Ionicons } from "@expo/vector-icons"

import type { PlanningQuickActionOption } from "@/features/schedule/showPlanningQuickActions"
import { showPlanningQuickActions } from "@/features/schedule/showPlanningQuickActions"
import { translate } from "@/i18n/translate"
import { IconButton, useDesignTokens } from "@/ui"

export function PlanningQuickActionsButton({
  options,
  title,
}: {
  options: PlanningQuickActionOption[]
  title: string
}) {
  const tokens = useDesignTokens()

  return (
    <IconButton
      accessibilityLabel={translate("planning:quickActionsA11y")}
      onPress={() => {
        showPlanningQuickActions({
          options,
          title,
        })
      }}
    >
      <Ionicons color={tokens.textSecondary} name="settings-outline" size={16} />
    </IconButton>
  )
}
