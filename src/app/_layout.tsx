import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Slot, SplashScreen } from "expo-router"
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import Config from "@/config"
import { initI18n } from "@/i18n"
import { AppLockProvider } from "@/providers/app-lock-provider"
import { AppProvider } from "@/providers/app-provider"
import { MotionProvider } from "@/providers/motion-provider"
import { createAppQueryClient } from "@/services/app/app.queries"
import { createMmkvPersister } from "@/services/app/query.persister"
import { usePushRegistration } from "@/services/notifications/usePushRegistration"
import { ErrorBoundary, ThemeProvider, useAppTheme } from "@/ui"
import { ToastProvider } from "@/ui/feedback"
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

const queryClient = createAppQueryClient()
const persister = createMmkvPersister()

/**
 * Headless component that wires up push-notification registration + deep-link
 * routing for the signed-in user. Rendered inside AppProvider so it can read
 * the session; renders nothing.
 */
function PushRegistration() {
  usePushRegistration()
  return null
}

function AppShell() {
  const { navigationTheme, theme } = useAppTheme()

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            maxAge: 1000 * 60 * 60 * 24, // 24 h
            buster: "v1",
            dehydrateOptions: {
              shouldDehydrateMutation: () => false, // never persist mutations
            },
          }}
        >
          <AppProvider>
            <PushRegistration />
            <AppLockProvider>
              <MotionProvider>
                <ToastProvider>
                  <KeyboardProvider>
                    <ErrorBoundary catchErrors={Config.catchErrors}>
                      <Slot />
                    </ErrorBoundary>
                  </KeyboardProvider>
                </ToastProvider>
              </MotionProvider>
            </AppLockProvider>
          </AppProvider>
        </PersistQueryClientProvider>
      </View>
    </NavigationThemeProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})

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
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
