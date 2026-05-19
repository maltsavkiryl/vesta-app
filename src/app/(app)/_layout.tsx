import { Redirect, Stack, useRouter } from "expo-router"

import { useAppSession } from "@/providers/app-provider"
import { useAppMotion } from "@/providers/motion-provider"
import {
  createHeaderActionOptions,
  createPushDetailOptions,
  createSheetOptions,
  useAppTheme,
} from "@/ui"

export default function AppLayout() {
  const { isSignedIn, needsOnboarding } = useAppSession()
  const { theme } = useAppTheme()
  const { shouldReduceMotion } = useAppMotion()
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
        animation: shouldReduceMotion ? "none" : "default",
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
          motionEnabled: !shouldReduceMotion,
          ...closeActions,
        })}
      />
      <Stack.Screen
        name="request"
        options={createPushDetailOptions(theme, undefined, {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
      <Stack.Screen
        name="shift/[id]"
        options={createPushDetailOptions(theme, "Shift details", {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
      <Stack.Screen
        name="availability/[date]"
        options={createSheetOptions(theme, "Availability", {
          backgroundColor: secondarySheetBackground,
          motionEnabled: !shouldReduceMotion,
          ...closeActions,
          presentation: "pageSheet",
        })}
      />
      <Stack.Screen
        name="availability-template"
        options={createPushDetailOptions(theme, "Weekly template", {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
      <Stack.Screen
        name="availability-template/[day]"
        options={createSheetOptions(theme, "Weekday defaults", {
          backgroundColor: secondarySheetBackground,
          motionEnabled: !shouldReduceMotion,
          ...closeActions,
          presentation: "pageSheet",
        })}
      />
      <Stack.Screen
        name="availability-time-picker"
        options={createSheetOptions(theme, "Choose time", {
          backgroundColor: secondarySheetBackground,
          motionEnabled: !shouldReduceMotion,
          ...closeActions,
          presentation: "formSheet",
          preset: "medium",
        })}
      />
      <Stack.Screen
        name="clock-out"
        options={createSheetOptions(theme, "End shift", {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
          ...closeActions,
          initialDetent: "large",
        })}
      />
      <Stack.Screen
        name="tasks"
        options={createPushDetailOptions(theme, "All tasks", {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
      <Stack.Screen
        name="time-entries"
        options={createPushDetailOptions(theme, "Time entries", {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
      <Stack.Screen
        name="time-entry/[id]"
        options={createPushDetailOptions(theme, "Entry details", {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
      <Stack.Screen
        name="document-payslip/[id]"
        options={createPushDetailOptions(theme, "Payslip", {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
      <Stack.Screen
        name="document-upload/[id]"
        options={createPushDetailOptions(theme, "Uploaded file", {
          backgroundColor: groupedSheetBackground,
        })}
      />
      <Stack.Screen
        name="document-contract/[id]"
        options={createPushDetailOptions(theme, "Contract", {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
      <Stack.Screen
        name="profile/[section]"
        options={createPushDetailOptions(theme, undefined, {
          backgroundColor: groupedSheetBackground,
          motionEnabled: !shouldReduceMotion,
        })}
      />
    </Stack>
  )
}
