import { Alert } from "react-native"
import type { ButtonProps } from "@expo/ui/swift-ui"

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
