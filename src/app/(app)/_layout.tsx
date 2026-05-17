import { Redirect, Stack } from "expo-router"

import { useAppSession } from "@/providers/app-provider"
import { useAppTheme } from "@/theme/context"

export default function AppLayout() {
  const { isSignedIn, needsOnboarding } = useAppSession()
  const { theme } = useAppTheme()
  const nativeSheetOptions = {
    presentation: "formSheet" as const,
    sheetAllowedDetents: [0.6, 0.92],
    sheetCornerRadius: 24,
    sheetGrabberVisible: true,
    sheetInitialDetentIndex: "last" as const,
  }

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
      <Stack.Screen name="notifications" options={nativeSheetOptions} />
      <Stack.Screen name="request" options={nativeSheetOptions} />
      <Stack.Screen name="shift/[id]" options={nativeSheetOptions} />
      <Stack.Screen name="availability/[date]" options={nativeSheetOptions} />
      <Stack.Screen name="clock-out" options={nativeSheetOptions} />
      <Stack.Screen name="profile/[section]" options={{ presentation: "card" }} />
    </Stack>
  )
}
