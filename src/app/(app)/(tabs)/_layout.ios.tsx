import { DynamicColorIOS, StyleSheet, View } from "react-native"
import { NativeTabs } from "expo-router/unstable-native-tabs"

import { RequestComposeAccessory } from "@/features/schedule/RequestComposeAccessory"
import { fireHaptic } from "@/utils/haptics"

const labelStyle = {
  fontSize: 11,
  fontWeight: "600",
} as const

const liquidGlassColor = DynamicColorIOS({
  dark: "#FFFFFF",
  light: "#000000",
})

const brandBlue = "#007AFF"

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <NativeTabs
        iconColor={{ default: liquidGlassColor, selected: brandBlue }}
        labelStyle={{
          default: { ...labelStyle, color: liquidGlassColor },
          selected: { ...labelStyle, color: brandBlue },
        }}
        screenListeners={{
          tabPress: () => {
            fireHaptic("tab")
          },
        }}
        tintColor={brandBlue}
      >
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="schedule">
          <NativeTabs.Trigger.Label>Planning</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "calendar", selected: "calendar.circle.fill" }}
            md="calendar_today"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="time">
          <NativeTabs.Trigger.Label>Time</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "clock", selected: "clock.fill" }}
            md="schedule"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
            md="account_circle"
          />
        </NativeTabs.Trigger>
      </NativeTabs>

      <View pointerEvents="box-none" style={styles.overlay}>
        <RequestComposeAccessory />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
})
