import { useEffect, useState } from "react"
import { Slot, SplashScreen } from "expo-router"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary"
import Config from "@/config"
import { initI18n } from "@/i18n"
import { AppProvider } from "@/providers/app-provider"
import { ThemeProvider } from "@/theme/context"
import { initCrashReporting } from "@/utils/crashReporting"
import { loadDateFnsLocale } from "@/utils/formatDate"

SplashScreen.preventAutoHideAsync()
initCrashReporting()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("@/devtools/ReactotronConfig")
}

export default function Root() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const loaded = isI18nInitialized

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <AppProvider>
          <KeyboardProvider>
            <ErrorBoundary catchErrors={Config.catchErrors}>
              <Slot />
            </ErrorBoundary>
          </KeyboardProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
