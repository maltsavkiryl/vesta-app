import { Redirect, Stack } from "expo-router"

import { useAppSession } from "@/providers/app-provider"

export default function AuthLayout() {
  const { isSignedIn, needsOnboarding } = useAppSession()

  if (isSignedIn && !needsOnboarding) {
    return <Redirect href="/(app)/(tabs)/home" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="onboarding" />
    </Stack>
  )
}
