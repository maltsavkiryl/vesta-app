import { Redirect } from "expo-router"

import { useAppSession } from "@/providers/app-provider"

export default function Index() {
  const { isSignedIn, needsOnboarding } = useAppSession()

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  if (needsOnboarding) {
    return <Redirect href="/(auth)/onboarding" />
  }

  return <Redirect href="/(app)/(tabs)/home" />
}
