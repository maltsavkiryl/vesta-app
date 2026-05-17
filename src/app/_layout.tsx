import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Slot, SplashScreen } from "expo-router"
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary"
import Config from "@/config"
import { initI18n } from "@/i18n"
import { AppProvider } from "@/providers/app-provider"
import { ThemeProvider, useAppTheme } from "@/theme/context"
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

function AppShell() {
  const { navigationTheme, theme } = useAppTheme()

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <AppProvider>
          <KeyboardProvider>
            <ErrorBoundary catchErrors={Config.catchErrors}>
              <Slot />
            </ErrorBoundary>
          </KeyboardProvider>
        </AppProvider>
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
