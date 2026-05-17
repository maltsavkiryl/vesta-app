import { Redirect, Stack } from "expo-router"

import { createNativeSheetOptions } from "@/navigation/native-sheet"
import { useAppSession } from "@/providers/app-provider"
import { useAppTheme } from "@/theme/context"

export default function AppLayout() {
  const { isSignedIn, needsOnboarding } = useAppSession()
  const { theme } = useAppTheme()
  const groupedSheetBackground = theme.isDark ? "#000000" : "#F2F2F7"
  const secondarySheetBackground = theme.isDark ? "#2C2C2E" : "#F1F1F6"

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
        options={createNativeSheetOptions(theme, "Notifications", {
          backgroundColor: groupedSheetBackground,
        })}
      />
      <Stack.Screen
        name="request"
        options={createNativeSheetOptions(theme, "New request", {
          backgroundColor: secondarySheetBackground,
        })}
      />
      <Stack.Screen
        name="shift/[id]"
        options={createNativeSheetOptions(theme, "Shift details", {
          backgroundColor: secondarySheetBackground,
        })}
      />
      <Stack.Screen
        name="availability/[date]"
        options={createNativeSheetOptions(theme, "Availability", {
          backgroundColor: secondarySheetBackground,
        })}
      />
      <Stack.Screen
        name="clock-out"
        options={createNativeSheetOptions(theme, "End shift", {
          backgroundColor: secondarySheetBackground,
        })}
      />
      <Stack.Screen name="tasks" options={createNativeSheetOptions(theme, "All tasks")} />
      <Stack.Screen name="time-entries" options={createNativeSheetOptions(theme, "Time entries")} />
      <Stack.Screen
        name="document-upload"
        options={createNativeSheetOptions(theme, "Upload document")}
      />
      <Stack.Screen
        name="document-payslip/[id]"
        options={createNativeSheetOptions(theme, "Payslip")}
      />
      <Stack.Screen
        name="document-contract/[id]"
        options={createNativeSheetOptions(theme, "Contract")}
      />
      <Stack.Screen name="profile/[section]" options={{ presentation: "card" }} />
    </Stack>
  )
}
