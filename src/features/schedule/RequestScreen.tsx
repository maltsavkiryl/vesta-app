/* eslint-disable react-native/no-inline-styles */

import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Stack } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import {
  RequestNoteSection,
  RequestReasonSection,
  RequestSuccessContent,
  RequestTargetSection,
} from "@/features/schedule/RequestScreenSections"
import { useRequestScreen } from "@/features/schedule/useRequestScreen"
import {
  AppButton,
  AppScrollScreen,
  useDesignTokens,
} from "@/ui"

export function RequestScreen() {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const {
    actionCopy,
    canSubmit,
    category,
    config,
    detailTargetLabel,
    done,
    handleSubmit,
    note,
    reason,
    requestDates,
    selectedDates,
    selectedShiftId,
    setNote,
    setReason,
    setSelectedShiftId,
    successCopy,
    summaryTarget,
    targetSectionCopy,
    toggleDate,
    upcomingShifts,
  } = useRequestScreen()

  if (done) {
    return (
      <RequestSuccessContent
        actionCopy={actionCopy}
        detailTargetLabel={detailTargetLabel}
        reason={reason}
        successCopy={successCopy}
        summaryTarget={summaryTarget}
      />
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: tokens.groupedBackground }]}
    >
      <View style={styles.flex}>
        <Stack.Screen options={{ title: actionCopy.screenTitle }} />
        <AppScrollScreen
          contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 28 }]}
          variant="grouped"
        >
          <RequestTargetSection
            category={category}
            onSelectShift={setSelectedShiftId}
            requestDates={requestDates}
            selectedDates={selectedDates}
            selectedShiftId={selectedShiftId}
            targetSectionCopy={targetSectionCopy}
            toggleDate={toggleDate}
            upcomingShifts={upcomingShifts}
          />
          <RequestReasonSection
            options={config.reasonPresets}
            reason={reason}
            setReason={setReason}
            title={actionCopy.reasonTitle}
          />
          <RequestNoteSection note={note} setNote={setNote} />

          <View style={styles.submitBlock}>
            <AppButton
              disabled={!canSubmit}
              fullWidth
              label={actionCopy.submitLabel}
              onPress={handleSubmit}
              pressHaptic="none"
            />
          </View>
        </AppScrollScreen>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    gap: 20,
    paddingHorizontal: 20,
  },
  submitBlock: {
    paddingTop: 4,
  },
})
