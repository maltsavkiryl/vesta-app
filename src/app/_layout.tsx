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
import { appQueryKeys, createAppQueryClient } from "@/services/app/app.queries"
import { queryPersister } from "@/services/app/query.persister"
import { useClockLiveActivitySync } from "@/services/liveActivity/useClockLiveActivitySync"
import { usePushRegistration } from "@/services/notifications/usePushRegistration"
import { useShiftReminders } from "@/services/notifications/useShiftReminders"
import { ErrorBoundary, ThemeProvider, useAppTheme } from "@/ui"
import { ToastProvider } from "@/ui/feedback"
import { initCrashReporting, reportCrash } from "@/utils/crashReporting"
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

/**
 * Headless component that wires up push-notification registration + deep-link
 * routing and local shift reminders for the signed-in user. Rendered inside
 * AppProvider so it can read the session; renders nothing.
 */
function PushRegistration() {
  usePushRegistration()
  useShiftReminders()
  useClockLiveActivitySync()
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
            persister: queryPersister,
            maxAge: 1000 * 60 * 60 * 24, // 24 h
            // Bump "v1" → "v2" etc. whenever a query's response shape changes
            // incompatibly, so stale caches are discarded on upgrade.
            buster: "v1",
            dehydrateOptions: {
              shouldDehydrateMutation: () => false, // never persist mutations
              // Never persist the auth session — it is authoritative from the
              // in-memory store (via initialData) and must not hydrate stale
              // session data for a different user on the next cold start.
              shouldDehydrateQuery: (query) =>
                query.queryKey[0] !== appQueryKeys.session[0] ||
                query.queryKey[1] !== appQueryKeys.session[1],
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
    // Always unblock the splash, even if i18n init fails — otherwise a rejected
    // init would leave the app stuck on a hidden splash forever. Report the
    // failure and continue (i18n falls back to its default bundle).
    initI18n()
      .then(() => loadDateFnsLocale())
      .catch((error) => {
        reportCrash(error instanceof Error ? error : new Error(String(error)))
      })
      .finally(() => setIsI18nInitialized(true))
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
