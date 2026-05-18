import { Redirect, Stack } from "expo-router"

import { useAppSession } from "@/providers/app-provider"
import { useAppTheme } from "@/ui"

export default function AuthLayout() {
  const { isSignedIn, needsOnboarding } = useAppSession()
  const { theme } = useAppTheme()

  if (isSignedIn && !needsOnboarding) {
    return <Redirect href="/(app)/(tabs)/home" />
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
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="onboarding" />
    </Stack>
  )
}
