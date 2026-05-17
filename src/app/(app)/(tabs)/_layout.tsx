import { NativeTabs } from "expo-router/unstable-native-tabs"

import { useDesignTokens } from "@/design-system/tokens"

const labelStyle = {
  fontSize: 11,
  fontWeight: "600",
} as const

export default function TabLayout() {
  const tokens = useDesignTokens()
  const contentStyle = { backgroundColor: tokens.groupedBackground }

  return (
    <NativeTabs
      backgroundColor={tokens.groupedBackground}
      disableTransparentOnScrollEdge
      iconColor={{ default: tokens.textMuted, selected: tokens.accent }}
      labelStyle={{
        default: { ...labelStyle, color: tokens.textMuted },
        selected: { ...labelStyle, color: tokens.accent },
      }}
      minimizeBehavior="automatic"
      tintColor={tokens.accent}
    >
      <NativeTabs.Trigger name="home" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="newspaper"
          sf={{ default: "newspaper", selected: "newspaper.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="schedule" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Label>Schedule</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="calendar_month"
          sf={{ default: "calendar", selected: "calendar" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="time" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Label>Time</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="schedule" sf={{ default: "clock", selected: "clock.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="documents" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Label>Docs</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="article"
          sf={{ default: "doc.text", selected: "doc.text.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="account_circle"
          sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
