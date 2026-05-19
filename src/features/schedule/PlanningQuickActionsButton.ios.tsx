import { Button, Divider, Host, Image, Menu } from "@expo/ui/swift-ui"
import { background, foregroundStyle, padding, shapes } from "@expo/ui/swift-ui/modifiers"

import type { PlanningQuickActionOption } from "@/features/schedule/showPlanningQuickActions"
import { useDesignTokens } from "@/ui"

export function PlanningQuickActionsButton({
  options,
  title: _title,
}: {
  options: PlanningQuickActionOption[]
  title: string
}) {
  const tokens = useDesignTokens()
  const primaryOptions = options.filter((option) => option.section !== "secondary")
  const secondaryOptions = options.filter((option) => option.section === "secondary")

  return (
    <Host matchContents>
      <Menu
        label={
          <Image
            color={tokens.textSecondary}
            modifiers={[padding({ all: 9 }), background(tokens.surfaceSecondary, shapes.circle())]}
            size={18}
            systemName="gearshape"
          />
        }
        modifiers={[foregroundStyle(tokens.textPrimary)]}
      >
        {primaryOptions.map((option) => (
          <Button
            key={option.label}
            label={option.label}
            onPress={() => {
              void option.onPress()
            }}
            systemImage={option.systemImage}
          />
        ))}
        {secondaryOptions.length > 0 ? <Divider /> : null}
        {secondaryOptions.map((option) => (
          <Button
            key={option.label}
            label={option.label}
            onPress={() => {
              void option.onPress()
            }}
            systemImage={option.systemImage}
          />
        ))}
      </Menu>
    </Host>
  )
}
