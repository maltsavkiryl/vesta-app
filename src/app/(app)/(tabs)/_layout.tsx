import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useDesignTokens } from "@/ui"

export default function TabLayout() {
  const tokens = useDesignTokens()

  const tabBarIcon = (routeName: string, focused: boolean) => {
    const iconName = {
      documents: focused ? "document-text" : "document-text-outline",
      home: focused ? "home" : "home-outline",
      profile: focused ? "person-circle" : "person-circle-outline",
      schedule: focused ? "calendar" : "calendar-outline",
      time: focused ? "time" : "time-outline",
    }[routeName] as keyof typeof Ionicons.glyphMap

    return (
      <Ionicons color={focused ? tokens.accent : tokens.textSecondary} name={iconName} size={20} />
    )
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          backgroundColor: tokens.surface,
          borderTopColor: tokens.border,
        },
        tabBarIcon: ({ focused }) => tabBarIcon(route.name, focused),
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="schedule" options={{ title: "Planning" }} />
      <Tabs.Screen name="time" options={{ title: "Time" }} />
      <Tabs.Screen name="documents" options={{ title: "Docs" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  )
}

const styles = {
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
} as const
