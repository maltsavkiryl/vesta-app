import { NativeTabs } from "expo-router/unstable-native-tabs"

const labelStyle = {
  fontSize: 11,
  fontWeight: "600",
} as const

export default function TabLayout() {
  return (
    <NativeTabs labelStyle={labelStyle} minimizeBehavior="automatic">
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="newspaper"
          sf={{ default: "newspaper", selected: "newspaper.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Label>Schedule</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="calendar_month"
          sf={{ default: "calendar", selected: "calendar" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="time">
        <NativeTabs.Trigger.Label>Time</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="schedule" sf={{ default: "clock", selected: "clock.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="documents">
        <NativeTabs.Trigger.Label>Docs</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="article"
          sf={{ default: "doc.text", selected: "doc.text.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="account_circle"
          sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
