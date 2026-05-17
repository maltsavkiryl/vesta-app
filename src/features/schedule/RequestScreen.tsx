/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import type { RequestType } from "@/core/models"
import { AppButton, AppScrollScreen, GroupedSection } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"

type SheetRequestType = "timeoff" | "swap"
type Step = 1 | 2 | 3

const dateOptions = ["May 10 - May 12", "May 17", "May 18", "May 24 - May 25", "June 1 - June 3"]
const reasons = ["Personal", "Medical", "Family", "Travel", "Other"]
const colleagueOptions = [
  { id: "emma", name: "Emma D.", shift: "Mon May 5 · 12-18h" },
  { id: "lucas", name: "Lucas M.", shift: "Thu May 7 · 17-23h" },
  { id: "yasmine", name: "Yasmine K.", shift: "Wed May 6 · 12-18h" },
]

export function RequestScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const { state, createRequest } = useAppSession()
  const [step, setStep] = useState<Step>(1)
  const [type, setType] = useState<SheetRequestType | null>(null)
  const [dates, setDates] = useState("")
  const [myShiftId, setMyShiftId] = useState("")
  const [colleagueId, setColleagueId] = useState("")
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [done, setDone] = useState(false)

  const shiftOptions = useMemo(
    () =>
      state.shifts.slice(0, 3).map((shift) => ({
        id: shift.id,
        label: shift.dayLabel,
        time: `${shift.startTime} - ${shift.endTime}`,
      })),
    [state.shifts],
  )
  const selectedShift = shiftOptions.find((shift) => shift.id === myShiftId)
  const selectedColleague = colleagueOptions.find((colleague) => colleague.id === colleagueId)
  const canContinue = type === "swap" ? Boolean(myShiftId) : Boolean(dates)
  const requestType: RequestType = type === "swap" ? "Shift swap" : "Time off"
  const requestDates = type === "swap" ? (selectedShift?.label ?? "") : dates

  if (done) {
    return (
      <AppScrollScreen
        contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 30 }]}
        style={{ backgroundColor: tokens.surfaceSecondary }}
      >
        <View style={styles.doneContent}>
          <View style={[styles.successIcon, { backgroundColor: `${tokens.success}1A` }]}>
            <Ionicons color={tokens.success} name="checkmark-circle-outline" size={42} />
          </View>
          <Text
            text="Request submitted!"
            weight="bold"
            style={{ color: tokens.textPrimary, fontSize: 22, lineHeight: 28, textAlign: "center" }}
          />
          <Text
            text={`Your manager has been notified and will review your ${
              type === "swap" ? "shift swap" : "time off"
            } request shortly.`}
            size="xs"
            style={{ color: tokens.textSecondary, textAlign: "center" }}
          />
          <View style={[styles.doneSummary, { backgroundColor: tokens.background }]}>
            <Text
              text={`${requestType} · ${requestDates}${reason ? ` · ${reason}` : ""}`}
              size="xs"
              style={{ color: tokens.textSecondary, textAlign: "center" }}
            />
          </View>
          <AppButton label="Done" onPress={() => router.back()} />
        </View>
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen
      contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 30 }]}
      style={{ backgroundColor: tokens.surfaceSecondary }}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          {step > 1 ? (
            <Pressable
              accessibilityLabel="Previous request step"
              onPress={() => setStep((current) => Math.max(1, current - 1) as Step)}
              style={[styles.circleButton, { backgroundColor: tokens.background }]}
            >
              <Ionicons color={tokens.textPrimary} name="chevron-back-outline" size={18} />
            </Pressable>
          ) : null}
          <View>
            <Text
              text="New request"
              weight="bold"
              style={{ color: tokens.textPrimary, fontSize: 20, lineHeight: 25 }}
            />
            <Text text={`Step ${step} of 3`} size="xxs" style={{ color: tokens.textMuted }} />
          </View>
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: tokens.background }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: tokens.accent, width: `${(step / 3) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <RequestTypeStep
            selected={type}
            onSelect={(nextType) => {
              setType(nextType)
              setStep(2)
            }}
          />
        ) : null}

        {step === 2 && type === "timeoff" ? (
          <DateStep
            dates={dates}
            canContinue={canContinue}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
            onSelect={setDates}
          />
        ) : null}

        {step === 2 && type === "swap" ? (
          <SwapStep
            canContinue={canContinue}
            colleagueId={colleagueId}
            myShiftId={myShiftId}
            onBack={() => setStep(1)}
            onColleagueSelect={setColleagueId}
            onContinue={() => setStep(3)}
            onShiftSelect={setMyShiftId}
            shiftOptions={shiftOptions}
          />
        ) : null}

        {step === 3 && type ? (
          <ReasonStep
            colleagueName={selectedColleague?.name}
            dateRange={requestDates}
            note={note}
            onBack={() => setStep(2)}
            onNoteChange={setNote}
            onReasonChange={setReason}
            onSubmit={() => {
              createRequest({
                type: requestType,
                dateRange:
                  type === "swap"
                    ? `${selectedShift?.label ?? "Selected shift"}${
                        selectedColleague ? ` with ${selectedColleague.name}` : ""
                      }`
                    : dates,
                reason: reason || "No reason provided",
                note,
              })
              setDone(true)
            }}
            reason={reason}
            type={requestType}
          />
        ) : null}
      </View>
    </AppScrollScreen>
  )
}

function RequestTypeStep({
  selected,
  onSelect,
}: {
  selected: SheetRequestType | null
  onSelect: (type: SheetRequestType) => void
}) {
  const tokens = useDesignTokens()
  const options = [
    {
      id: "timeoff" as const,
      icon: "calendar-outline" as const,
      title: "Time off",
      description: "Request days off or vacation",
      color: tokens.accent,
      background: tokens.accentSoft,
    },
    {
      id: "swap" as const,
      icon: "refresh-outline" as const,
      title: "Shift swap",
      description: "Exchange your shift with a colleague",
      color: "#AF52DE",
      background: "rgba(175, 82, 222, 0.12)",
    },
  ]

  return (
    <View style={styles.stack}>
      <GroupedSection title="Request type">
        {options.map((option, index) => (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [
              styles.typeRow,
              { backgroundColor: pressed ? tokens.pressed : tokens.transparent },
            ]}
          >
            <View style={[styles.typeIcon, { backgroundColor: option.background }]}>
              <Ionicons color={option.color} name={option.icon} size={20} />
            </View>
            <View style={styles.flex}>
              <Text
                text={option.title}
                size="xs"
                weight="medium"
                style={{ color: tokens.textPrimary }}
              />
              <Text text={option.description} size="xxs" style={{ color: tokens.textSecondary }} />
            </View>
            {selected === option.id ? (
              <Ionicons color={tokens.accent} name="checkmark-outline" size={18} />
            ) : (
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            )}
            {index === 0 ? (
              <View style={[styles.rowDivider, { backgroundColor: tokens.separator }]} />
            ) : null}
          </Pressable>
        ))}
      </GroupedSection>
    </View>
  )
}

function DateStep({
  dates,
  canContinue,
  onBack,
  onContinue,
  onSelect,
}: {
  dates: string
  canContinue: boolean
  onBack: () => void
  onContinue: () => void
  onSelect: (dates: string) => void
}) {
  return (
    <View style={styles.stack}>
      <GroupedSection title="Dates">
        {dateOptions.map((option, index) => (
          <SelectionRow
            key={option}
            isLast={index === dateOptions.length - 1}
            selected={dates === option}
            title={option}
            onPress={() => onSelect(option)}
          />
        ))}
      </GroupedSection>
      <StepActions canContinue={canContinue} onBack={onBack} onContinue={onContinue} />
    </View>
  )
}

function SwapStep({
  canContinue,
  colleagueId,
  myShiftId,
  onBack,
  onColleagueSelect,
  onContinue,
  onShiftSelect,
  shiftOptions,
}: {
  canContinue: boolean
  colleagueId: string
  myShiftId: string
  onBack: () => void
  onColleagueSelect: (id: string) => void
  onContinue: () => void
  onShiftSelect: (id: string) => void
  shiftOptions: { id: string; label: string; time: string }[]
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stack}>
      <GroupedSection title="My shift to swap">
        {shiftOptions.map((shift, index) => (
          <SelectionRow
            key={shift.id}
            isLast={index === shiftOptions.length - 1}
            selected={myShiftId === shift.id}
            subtitle={shift.time}
            title={shift.label}
            onPress={() => onShiftSelect(shift.id)}
          />
        ))}
      </GroupedSection>

      {myShiftId ? (
        <GroupedSection title="Swap with">
          {colleagueOptions.map((colleague, index) => (
            <Pressable
              key={colleague.id}
              onPress={() => onColleagueSelect(colleague.id)}
              style={({ pressed }) => [
                styles.colleagueRow,
                {
                  backgroundColor: pressed ? tokens.pressed : tokens.transparent,
                },
              ]}
            >
              <View
                style={[
                  styles.initials,
                  {
                    backgroundColor:
                      colleagueId === colleague.id ? tokens.accent : tokens.surfaceTertiary,
                  },
                ]}
              >
                <Text
                  text={colleague.name[0]}
                  size="xxs"
                  weight="semiBold"
                  style={{
                    color:
                      colleagueId === colleague.id ? tokens.accentForeground : tokens.textSecondary,
                  }}
                />
              </View>
              <View style={styles.flex}>
                <Text
                  text={colleague.name}
                  size="xs"
                  weight="medium"
                  style={{ color: tokens.textPrimary }}
                />
                <Text text={colleague.shift} size="xxs" style={{ color: tokens.textSecondary }} />
              </View>
              {colleagueId === colleague.id ? (
                <Ionicons color={tokens.accent} name="checkmark-outline" size={18} />
              ) : null}
              {index < colleagueOptions.length - 1 ? (
                <View style={[styles.rowDivider, { backgroundColor: tokens.separator }]} />
              ) : null}
            </Pressable>
          ))}
        </GroupedSection>
      ) : null}

      <StepActions canContinue={canContinue} onBack={onBack} onContinue={onContinue} />
    </View>
  )
}

function ReasonStep({
  colleagueName,
  dateRange,
  note,
  onBack,
  onNoteChange,
  onReasonChange,
  onSubmit,
  reason,
  type,
}: {
  colleagueName?: string
  dateRange: string
  note: string
  onBack: () => void
  onNoteChange: (note: string) => void
  onReasonChange: (reason: string) => void
  onSubmit: () => void
  reason: string
  type: RequestType
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.stack}>
      <GroupedSection title="Reason">
        <View style={styles.reasonWrap}>
          {reasons.map((option) => {
            const selected = option === reason
            return (
              <Pressable
                key={option}
                onPress={() => onReasonChange(selected ? "" : option)}
                style={[
                  styles.reasonChip,
                  {
                    backgroundColor: selected ? tokens.accent : tokens.surfaceSecondary,
                    borderColor: selected ? tokens.accent : tokens.transparent,
                  },
                ]}
              >
                <Text
                  text={option}
                  size="xxs"
                  weight="medium"
                  style={{ color: selected ? tokens.accentForeground : tokens.textPrimary }}
                />
              </Pressable>
            )
          })}
        </View>
      </GroupedSection>

      <View style={[styles.inputShell, { backgroundColor: tokens.searchBackground }]}>
        <Text text="NOTE" size="xxs" weight="medium" style={{ color: tokens.textMuted }} />
        <TextInput
          multiline
          numberOfLines={3}
          onChangeText={onNoteChange}
          placeholder="Add any notes for your manager..."
          placeholderTextColor={tokens.textMuted}
          style={[styles.nativeInput, styles.noteInput, { color: tokens.textPrimary }]}
          textAlignVertical="top"
          value={note}
        />
      </View>

      <View style={[styles.summaryCard, { backgroundColor: tokens.background }]}>
        <Text text="SUMMARY" size="xxs" weight="semiBold" style={{ color: tokens.textMuted }} />
        <SummaryRow label="Type" value={type} />
        <SummaryRow label={type === "Shift swap" ? "My shift" : "Dates"} value={dateRange} />
        {colleagueName ? <SummaryRow label="Swap with" value={colleagueName} /> : null}
        {reason ? <SummaryRow label="Reason" value={reason} /> : null}
      </View>

      <View style={styles.actionRow}>
        <AppButton label="Back" variant="secondary" onPress={onBack} />
        <View style={styles.flex}>
          <AppButton label="Submit request" onPress={onSubmit} />
        </View>
      </View>
    </View>
  )
}

function SelectionRow({
  isLast,
  selected,
  subtitle,
  title,
  onPress,
}: {
  isLast?: boolean
  selected: boolean
  subtitle?: string
  title: string
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectionRow,
        {
          backgroundColor: pressed ? tokens.pressed : tokens.transparent,
        },
      ]}
    >
      <View style={styles.flex}>
        <Text
          text={title}
          size="xs"
          weight={selected ? "medium" : "normal"}
          style={{ color: tokens.textPrimary }}
        />
        {subtitle ? (
          <Text text={subtitle} size="xxs" style={{ color: tokens.textSecondary }} />
        ) : null}
      </View>
      {selected ? <Ionicons color={tokens.accent} name="checkmark-outline" size={18} /> : null}
      {!isLast ? (
        <View style={[styles.selectionDivider, { backgroundColor: tokens.separator }]} />
      ) : null}
    </Pressable>
  )
}

function StepActions({
  canContinue,
  onBack,
  onContinue,
}: {
  canContinue: boolean
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <View style={styles.actionRow}>
      <AppButton label="Back" variant="secondary" onPress={onBack} />
      <View style={styles.flex}>
        <AppButton disabled={!canContinue} label="Continue" onPress={onContinue} />
      </View>
    </View>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const tokens = useDesignTokens()
  return (
    <View style={styles.summaryRow}>
      <Text text={label} size="xs" style={{ color: tokens.textSecondary }} />
      <Text
        text={value}
        size="xs"
        weight="medium"
        style={{ color: tokens.textPrimary, flex: 1, textAlign: "right" }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  circleButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  colleagueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  doneContent: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 32,
    paddingVertical: 56,
  },
  doneSummary: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: "100%",
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  initials: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  inputShell: {
    borderRadius: 14,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nativeInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 24,
    padding: 0,
  },
  noteInput: {
    minHeight: 72,
  },
  progressFill: {
    borderRadius: 99,
    height: "100%",
  },
  progressTrack: {
    borderRadius: 99,
    height: 3,
    marginHorizontal: 20,
    marginTop: 14,
    overflow: "hidden",
  },
  reasonChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reasonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 14,
  },
  rowDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 60,
    position: "absolute",
    right: 0,
  },
  screen: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  selectionDivider: {
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 16,
    position: "absolute",
    right: 0,
  },
  selectionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stack: {
    gap: 10,
  },
  successIcon: {
    alignItems: "center",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  summaryCard: {
    borderRadius: 14,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  typeIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  typeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
})
