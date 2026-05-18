import { Redirect, Stack, useRouter } from "expo-router"

import { useAppSession } from "@/providers/app-provider"
import {
  createHeaderActionOptions,
  createPushDetailOptions,
  createSheetOptions,
  useAppTheme,
} from "@/ui"

export default function AppLayout() {
  const { isSignedIn, needsOnboarding } = useAppSession()
  const { theme } = useAppTheme()
  const router = useRouter()
  const groupedSheetBackground = theme.isDark ? "#000000" : "#F2F2F7"
  const secondarySheetBackground = theme.isDark ? "#2C2C2E" : "#F1F1F6"
  const closeSheet = () => router.back()
  const closeActions = createHeaderActionOptions(theme, {
    left: { kind: "close", onPress: closeSheet },
  })

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  if (needsOnboarding) {
    return <Redirect href="/(auth)/onboarding" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="notifications"
        options={createPushDetailOptions(theme, "Notifications", {
          backgroundColor: groupedSheetBackground,
          ...closeActions,
        })}
      />
      <Stack.Screen
        name="request"
        options={createPushDetailOptions(theme, "New request", {
          backgroundColor: groupedSheetBackground,
        })}
      />
      <Stack.Screen
        name="shift/[id]"
        options={createPushDetailOptions(theme, "Shift details", {
          backgroundColor: groupedSheetBackground,
        })}
      />
      <Stack.Screen
        name="availability/[date]"
        options={createSheetOptions(theme, "Availability", {
          backgroundColor: secondarySheetBackground,
          ...closeActions,
        })}
      />
      <Stack.Screen
        name="clock-out"
        options={createSheetOptions(theme, "End shift", {
          backgroundColor: groupedSheetBackground,
          ...closeActions,
          preset: "medium",
        })}
      />
      <Stack.Screen
        name="tasks"
        options={createPushDetailOptions(theme, "All tasks", {
          backgroundColor: groupedSheetBackground,
        })}
      />
      <Stack.Screen
        name="time-entries"
        options={createSheetOptions(theme, "Time entries", { ...closeActions })}
      />
      <Stack.Screen
        name="time-entry/[id]"
        options={createPushDetailOptions(theme, "Entry details", {
          backgroundColor: groupedSheetBackground,
        })}
      />
      <Stack.Screen
        name="document-upload"
        options={createSheetOptions(theme, "Upload document", {
          ...closeActions,
          preset: "medium",
        })}
      />
      <Stack.Screen
        name="document-payslip/[id]"
        options={createPushDetailOptions(theme, "Payslip")}
      />
      <Stack.Screen
        name="document-contract/[id]"
        options={createPushDetailOptions(theme, "Contract")}
      />
      <Stack.Screen
        name="profile/[section]"
        options={createPushDetailOptions(theme, undefined, {
          backgroundColor: groupedSheetBackground,
        })}
      />
    </Stack>
  )
}
