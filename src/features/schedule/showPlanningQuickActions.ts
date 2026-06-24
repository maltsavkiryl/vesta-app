import { Alert } from "react-native"
import type { ButtonProps } from "@expo/ui/swift-ui"

import { translate } from "@/i18n/translate"

type SystemImageName = NonNullable<ButtonProps["systemImage"]>

export type PlanningQuickActionOption = {
  label: string
  onPress: () => void | Promise<unknown>
  section?: "primary" | "secondary"
  systemImage?: SystemImageName
}

export function showPlanningQuickActions({
  onCancel,
  options,
  title,
}: {
  onCancel?: () => void
  options: PlanningQuickActionOption[]
  title: string
}) {
  Alert.alert(title, translate("planning:quickActionsPrompt"), [
    ...options.map((option) => ({
      text: option.label,
      onPress: () => {
        void option.onPress()
      },
    })),
    {
      style: "cancel" as const,
      text: translate("common:actions.cancel"),
      onPress: onCancel,
    },
  ])
}
