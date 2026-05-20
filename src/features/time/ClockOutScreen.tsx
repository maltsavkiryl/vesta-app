import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import {
  AppScrollScreen,
  useDesignTokens,
} from "@/ui"
import {
  ClockOutContent,
  ClockOutEmptyState,
  ClockOutSuccessState,
} from "@/features/time/ClockOutSections"
import { useClockOutScreen } from "@/features/time/useClockOutScreen"

export function ClockOutScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const screen = useClockOutScreen()

  if (!screen.clockSession || !screen.summary) {
    return (
      <AppScrollScreen
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.screen, styles.emptyScreen, { paddingBottom: insets.bottom + 30 }]}
        style={{ backgroundColor: tokens.groupedBackground }}
        topInset="none"
      >
        <ClockOutEmptyState />
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 30 }]}
      style={{ backgroundColor: tokens.groupedBackground }}
      topInset="none"
    >
      {screen.confirmed ? (
        <ClockOutSuccessState earnings={screen.summary.earnings} workedLabel={screen.summary.workedLabel} />
      ) : (
        <ClockOutContent onFinish={screen.handleFinish} onKeepWorking={router.back} summary={screen.summary} />
      )}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  emptyScreen: {
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  screen: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
})
