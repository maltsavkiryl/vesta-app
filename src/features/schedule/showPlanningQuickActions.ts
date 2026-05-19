import { Alert } from "react-native"
import type { SFSymbol } from "sf-symbols-typescript"

export type PlanningQuickActionOption = {
  label: string
  onPress: () => void | Promise<unknown>
  section?: "primary" | "secondary"
  systemImage?: SFSymbol
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
  Alert.alert(title, "Choose a planning action.", [
    ...options.map((option) => ({
      text: option.label,
      onPress: () => {
        void option.onPress()
      },
    })),
    {
      style: "cancel" as const,
      text: "Cancel",
      onPress: onCancel,
    },
  ])
}
