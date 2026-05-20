import { Platform, StyleSheet } from "react-native"
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useDesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

export default function TabLayout() {
  const tokens = useDesignTokens()
  const insets = useSafeAreaInsets()

  const tabBarIcon = (routeName: string, focused: boolean) => {
    const iconName = {
      home: focused ? "home" : "home-outline",
      profile: focused ? "person" : "person-outline",
      schedule: focused ? "calendar" : "calendar-outline",
      time: focused ? "time" : "time-outline",
    }[routeName] as keyof typeof Ionicons.glyphMap

    return (
      <Ionicons color={focused ? tokens.accent : tokens.textSecondary} name={iconName} size={21} />
    )
  }

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          fireHaptic("tab")
        },
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: {
          backgroundColor: tokens.tabBar,
          borderTopColor: tokens.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: 58 + Math.max(insets.bottom, Platform.OS === "android" ? 10 : 0),
          paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 10 : 6),
          paddingTop: 8,
          shadowOpacity: 0,
        },
        tabBarIconStyle: styles.icon,
        tabBarIcon: ({ focused }) => tabBarIcon(route.name, focused),
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="schedule" options={{ title: "Planning" }} />
      <Tabs.Screen name="time" options={{ title: "Time" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  )
}

const styles = {
  icon: {
    marginBottom: 2,
  },
  item: {
    paddingTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
} as const
