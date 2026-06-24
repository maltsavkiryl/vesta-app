import { StyleSheet, View } from "react-native"
import { NativeTabs } from "expo-router/unstable-native-tabs"

import { RequestComposeAccessory } from "@/features/schedule/RequestComposeAccessory"
import { translate } from "@/i18n/translate"
import { useDesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

const labelStyle = {
  fontSize: 11,
  fontWeight: "600",
} as const

export default function TabLayout() {
  const tokens = useDesignTokens()
  const tabBarBlurEffect = tokens.isDark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"

  return (
    <View style={styles.container}>
      <NativeTabs
        backgroundColor={tokens.tabBar}
        blurEffect={tabBarBlurEffect}
        disableTransparentOnScrollEdge
        iconColor={{ default: tokens.textSecondary, selected: tokens.accent }}
        labelStyle={{
          default: { ...labelStyle, color: tokens.textSecondary },
          selected: { ...labelStyle, color: tokens.accent },
        }}
        screenListeners={{
          tabPress: () => {
            fireHaptic("tab")
          },
        }}
        shadowColor={tokens.tabBarBorder}
        tintColor={tokens.accent}
      >
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Label>{translate("common:nav.home")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="schedule">
          <NativeTabs.Trigger.Label>{translate("common:nav.planning")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "calendar", selected: "calendar.circle.fill" }}
            md="calendar_today"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="time">
          <NativeTabs.Trigger.Label>{translate("common:nav.time")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "clock", selected: "clock.fill" }}
            md="schedule"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="inbox">
          <NativeTabs.Trigger.Label>{translate("common:nav.inbox")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "envelope", selected: "envelope.fill" }}
            md="mail"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>{translate("common:nav.profile")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
            md="account_circle"
          />
        </NativeTabs.Trigger>
      </NativeTabs>

      <View style={styles.overlay}>
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
    pointerEvents: "box-none",
  },
})
