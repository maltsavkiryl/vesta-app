import { Redirect } from "expo-router"

import { useAppSession } from "@/providers/app-provider"

export default function Index() {
  const { isSignedIn, needsOnboarding, isSessionReady } = useAppSession()

  // Wait for the session to resolve before routing, so a returning signed-in
  // user isn't briefly redirected to sign-in while the session loads.
  if (!isSessionReady) {
    return null
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  if (needsOnboarding) {
    return <Redirect href="/(auth)/onboarding" />
  }

  return <Redirect href="/(app)/(tabs)/home" />
}
