import { StyleSheet, View } from "react-native"

import { AppButton, AppScrollScreen, TextField } from "@/ui"

import {
  AvailabilityHoursSection,
  AvailabilityIntro,
  AvailabilityStatusSection,
  AvailabilityTemplateSection,
} from "./AvailabilityScreenSections"
import { useAvailabilityScreen } from "./useAvailabilityScreen"

export function AvailabilityScreen() {
  const screen = useAvailabilityScreen()

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
          containerStyle={styles.noteShell}
          inputStyle={styles.noteInput}
          label="Note"
          multiline
          numberOfLines={3}
          onChangeText={screen.setNote}
          placeholder="Optional context for your manager"
          textAlignVertical="top"
          value={screen.note}
          variant="muted"
        />

        {screen.canResetToTemplate ? (
          <View style={styles.buttonStack}>
            <AppButton
              label="Use weekly template instead"
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
