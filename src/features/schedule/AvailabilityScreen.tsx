import { useEffect, useRef } from "react"
import { StyleSheet, View } from "react-native"

import { AppButton, AppScrollScreen, TextField, useDesignTokens } from "@/ui"
import { useToast } from "@/ui/feedback"
import { translate } from "@/i18n/translate"

import {
  AvailabilityHoursSection,
  AvailabilityIntro,
  AvailabilityStatusSection,
  AvailabilityTemplateSection,
} from "./AvailabilityScreenSections"
import { useAvailabilityScreen } from "./useAvailabilityScreen"

export function AvailabilityScreen() {
  const screen = useAvailabilityScreen()
  const tokens = useDesignTokens()
  const { showSuccess } = useToast()

  // Track isSaving transitions to fire toast on successful save
  const wasSavingRef = useRef(false)
  useEffect(() => {
    if (wasSavingRef.current && !screen.isSaving) {
      // isSaving went from true→false; the hook calls router.back() on success
      // so showing a toast here gives the user feedback before navigation
      showSuccess(translate("planning:availability.saveSuccess"))
    }
    wasSavingRef.current = screen.isSaving
  }, [screen.isSaving, showSuccess])

  return (
    <AppScrollScreen contentContainerStyle={styles.screen} topInset="none" variant="grouped">
      <View style={styles.content}>
        <AvailabilityIntro date={screen.date} weekdayLabel={screen.weekdayLabel} />
        <AvailabilityTemplateSection
          existingOverride={screen.existingOverride}
          templateDay={screen.templateDay}
        />
        <AvailabilityStatusSection onSelectStatus={screen.setStatus} status={screen.status} />
        {screen.status !== "unavailable" ? (
          <AvailabilityHoursSection
            activeTimeField={screen.activeTimeField}
            endTime={screen.endTime}
            onAndroidTimeChange={screen.handleAndroidTimeChange}
            onPressTime={screen.handleTimePress}
            pickerValue={screen.pickerValue}
            startTime={screen.startTime}
          />
        ) : null}

        <TextField
          containerStyle={[styles.noteShell, { backgroundColor: tokens.surface }]}
          inputStyle={styles.noteInput}
          label={translate("planning:availability.noteLabel")}
          multiline
          numberOfLines={3}
          onChangeText={screen.setNote}
          placeholder={translate("planning:availability.notePlaceholder")}
          textAlignVertical="top"
          value={screen.note}
          variant="muted"
        />

        {screen.canResetToTemplate ? (
          <View style={styles.buttonStack}>
            <AppButton
              label={translate("planning:availability.resetToDefault")}
              onPress={() => {
                void screen.handleResetToTemplate()
              }}
              pressHaptic="none"
              variant="secondary"
            />
          </View>
        ) : null}
      </View>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  buttonStack: {
    gap: 10,
  },
  content: {
    gap: 18,
  },
  noteInput: {
    fontSize: 15,
    minHeight: 72,
    paddingTop: 2,
  },
  noteShell: {
    minHeight: 116,
  },
  screen: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
})
