/* eslint-disable react-native/no-inline-styles */

import { useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { formatFullDate, formatShortDate, getShiftTimeRange } from "@/core/date"
import type { RequestCategory, RequestType } from "@/core/models"
import { useScheduleActions } from "@/features/schedule/data/schedule.mutations"
import { useScheduleStateQuery } from "@/features/schedule/data/schedule.queries"
import { enumerateDateRange } from "@/features/schedule/schedule.utils"
import {
  AppButton,
  AppScrollScreen,
  DetailRow,
  GroupedSection,
  SelectionChip,
  SelectionRow,
  SurfaceCard,
  Text,
  TextField,
  useDesignTokens,
} from "@/ui"

const requestTypeConfig: Record<
  RequestCategory,
  {
    description: string
    icon: keyof typeof Ionicons.glyphMap
    tone: "accent" | "warning" | "danger"
    title: string
    type: RequestType
  }
> = {
  time_off: {
    description: "Request one or more days off",
    icon: "calendar-clear-outline",
    tone: "accent",
    title: "Time off",
    type: "Time off",
  },
  shift_change: {
    description: "Ask for help with a scheduled shift",
    icon: "swap-horizontal-outline",
    tone: "warning",
    title: "Shift change",
    type: "Shift swap",
  },
  availability_issue: {
    description: "Flag an availability conflict or exception",
    icon: "alert-circle-outline",
    tone: "danger",
    title: "Availability issue",
    type: "Unavailability",
  },
}

const reasonPresets: Record<RequestCategory, string[]> = {
  time_off: ["Personal", "Medical", "Family", "Travel"],
  shift_change: ["Running late", "Need replacement", "Schedule conflict", "Transport issue"],
  availability_issue: [
    "Class or exam",
    "Family commitment",
    "Existing appointment",
    "Unexpected conflict",
  ],
}

function formatDateListLabel(dates: string[]) {
  if (dates.length === 0) return ""
  if (dates.length === 1) return formatShortDate(dates[0])
  const sorted = [...dates].sort((left, right) => left.localeCompare(right))
  return `${formatShortDate(sorted[0] ?? "")} - ${formatShortDate(sorted[sorted.length - 1] ?? "")}`
}

function CategoryTile({
  active,
  category,
  isLast,
  onPress,
}: {
  active: boolean
  category: RequestCategory
  isLast: boolean
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const config = requestTypeConfig[category]
  const activeColor =
    config.tone === "warning"
      ? tokens.warning
      : config.tone === "danger"
        ? tokens.danger
        : tokens.accent

  return (
    <SelectionRow
      backgroundColor={tokens.transparent}
      dividerInset={58}
      grouped
      isLast={isLast}
      leading={
        <View style={[styles.categoryGlyph, { backgroundColor: `${activeColor}1A` }]}>
          <Ionicons color={activeColor} name={config.icon} size={18} />
        </View>
      }
      onPress={onPress}
      selected={active}
      style={styles.categoryRow}
      subtitle={config.description}
      title={config.title}
      trailing={
        active ? <Ionicons color={tokens.accent} name="checkmark-outline" size={18} /> : null
      }
    />
  )
}

export function RequestScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const { createRequest } = useScheduleActions()
  const { state } = useScheduleStateQuery()
  const params = useLocalSearchParams<{ category?: RequestCategory; shiftId?: string }>()

  const initialCategory =
    params.category && requestTypeConfig[params.category] ? params.category : "time_off"
  const [category, setCategory] = useState<RequestCategory>(initialCategory)
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedShiftId, setSelectedShiftId] = useState(params.shiftId ?? "")
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [done, setDone] = useState(false)

  const upcomingShifts = useMemo(
    () => (state?.shifts ?? []).filter((shift) => shift.date >= "2026-05-18"),
    [state?.shifts],
  )
  const activePlanningWindow = state?.planningWindows.find((window) => window.status === "open")
  const requestDates = activePlanningWindow
    ? enumerateDateRange(activePlanningWindow.startDate, activePlanningWindow.endDate)
    : []
  const selectedShift = upcomingShifts.find((shift) => shift.id === selectedShiftId)

  const summaryTarget =
    category === "shift_change"
      ? selectedShift
        ? `${selectedShift.dayLabel} · ${getShiftTimeRange(selectedShift)}`
        : ""
      : formatDateListLabel(selectedDates)
  const canSubmit =
    Boolean(reason.trim()) &&
    (category === "shift_change" ? Boolean(selectedShiftId) : selectedDates.length > 0)
  const config = requestTypeConfig[category]

  if (done) {
    return (
      <AppScrollScreen
        contentContainerStyle={[styles.doneScreen, { paddingBottom: insets.bottom + 30 }]}
        style={{ backgroundColor: tokens.groupedBackground }}
      >
        <View style={styles.doneContent}>
          <View style={[styles.successIcon, { backgroundColor: `${tokens.success}1A` }]}>
            <Ionicons color={tokens.success} name="checkmark-circle-outline" size={42} />
          </View>
          <Text
            text="Request sent"
            weight="bold"
            style={{ color: tokens.textPrimary, fontSize: 22 }}
          />
          <Text
            text="Your manager now has the context they need to review this request."
            size="xs"
            style={{ color: tokens.textSecondary, textAlign: "center" }}
          />
          <SurfaceCard style={styles.doneSummaryCard}>
            <Text
              text={config.type}
              size="xs"
              weight="semiBold"
              style={{ color: tokens.textPrimary }}
            />
            <Text text={summaryTarget} size="xxs" style={{ color: tokens.textSecondary }} />
            <Text text={reason} size="xxs" style={{ color: tokens.textSecondary }} />
          </SurfaceCard>
          <AppButton label="Done" onPress={() => router.back()} />
        </View>
      </AppScrollScreen>
    )
  }

  return (
    <AppScrollScreen
      contentContainerStyle={[styles.screen, { paddingBottom: insets.bottom + 30 }]}
      style={{ backgroundColor: tokens.groupedBackground }}
    >
      <View style={styles.intro}>
        <Text
          text="Start with the type of help you need, then add just enough context for a quick decision."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>

      <GroupedSection>
        {(["time_off", "shift_change", "availability_issue"] as RequestCategory[]).map(
          (item, index, items) => (
            <CategoryTile
              key={item}
              active={category === item}
              category={item}
              isLast={index === items.length - 1}
              onPress={() => {
                setCategory(item)
                setReason("")
                setNote("")
              }}
            />
          ),
        )}
      </GroupedSection>

      {category === "shift_change" ? (
        <View style={styles.flatSection}>
          <Text
            size="xxs"
            style={[styles.flatSectionTitle, { color: tokens.textMuted }]}
            text="Which shift needs help?"
            weight="semiBold"
          />
          <View style={styles.shiftList}>
            {upcomingShifts.map((shift) => (
              <SelectionRow
                backgroundColor={tokens.surface}
                key={shift.id}
                onPress={() => setSelectedShiftId(shift.id)}
                selected={selectedShiftId === shift.id}
                style={styles.shiftRow}
                subtitle={`${getShiftTimeRange(shift)} · ${shift.role}`}
                title={`${shift.dayLabel} · ${formatShortDate(shift.date)}`}
                trailing={
                  selectedShiftId === shift.id ? (
                    <Ionicons color={tokens.accent} name="checkmark-outline" size={18} />
                  ) : null
                }
              />
            ))}
          </View>
        </View>
      ) : (
        <GroupedSection
          title={category === "time_off" ? "Which dates?" : "Which days are affected?"}
        >
          <View style={styles.dateWrap}>
            {requestDates.map((date) => {
              const selected = selectedDates.includes(date)
              return (
                <SelectionChip
                  key={date}
                  onPress={() =>
                    setSelectedDates((current) =>
                      current.includes(date)
                        ? current.filter((item) => item !== date)
                        : [...current, date].sort((left, right) => left.localeCompare(right)),
                    )
                  }
                  label={formatShortDate(date)}
                  selected={selected}
                  selectedVariant="solid"
                />
              )
            })}
          </View>
          {selectedDates.length > 0 ? (
            <Text
              text={
                selectedDates.length === 1
                  ? formatFullDate(selectedDates[0] ?? "")
                  : `${selectedDates.length} dates selected`
              }
              size="xxs"
              style={{ color: tokens.textSecondary, paddingHorizontal: 14, paddingBottom: 14 }}
            />
          ) : null}
        </GroupedSection>
      )}

      <GroupedSection title="Reason">
        <View style={styles.reasonWrap}>
          {reasonPresets[category].map((option) => {
            const selected = option === reason
            return (
              <SelectionChip
                key={option}
                onPress={() => setReason(selected ? "" : option)}
                label={option}
                selected={selected}
                selectedVariant="solid"
              />
            )
          })}
        </View>
      </GroupedSection>

      <TextField
        containerStyle={styles.noteShell}
        inputStyle={styles.noteInput}
        label="Note"
        multiline
        numberOfLines={3}
        onChangeText={setNote}
        placeholder="Add anything your manager should know"
        textAlignVertical="top"
        value={note}
        variant="muted"
      />

      <GroupedSection title="Summary">
        <DetailRow label="Type" value={config.type} />
        <DetailRow
          label={category === "shift_change" ? "Shift" : "Dates"}
          value={summaryTarget || "Choose one first"}
        />
        <DetailRow isLast label="Reason" value={reason || "Choose one"} />
      </GroupedSection>

      <AppButton
        disabled={!canSubmit}
        label="Submit request"
        onPress={async () => {
          const result = await createRequest({
            category,
            note: note.trim() || undefined,
            reason,
            statusDetail:
              category === "shift_change"
                ? "Waiting for colleague and manager approval"
                : "Waiting for manager review",
            target:
              category === "shift_change"
                ? {
                    kind: "shift",
                    label: summaryTarget,
                    shiftId: selectedShiftId,
                  }
                : {
                    endDate: selectedDates[selectedDates.length - 1],
                    kind: "dates",
                    label: summaryTarget,
                    startDate: selectedDates[0],
                  },
            type: config.type,
          })
          if (!result.ok) return
          setDone(true)
        }}
      />
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  categoryGlyph: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  categoryRow: {
    minHeight: 72,
    paddingHorizontal: 14,
  },
  dateWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  doneContent: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  doneScreen: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
    paddingHorizontal: 20,
  },
  doneSummaryCard: {
    alignSelf: "stretch",
    gap: 10,
  },
  flatSection: {
    gap: 8,
  },
  flatSectionTitle: {
    letterSpacing: 0.6,
    paddingHorizontal: 4,
    textTransform: "uppercase",
  },
  intro: {
    gap: 6,
  },
  noteInput: {
    fontSize: 15,
    minHeight: 72,
    paddingTop: 2,
  },
  noteShell: {
    minHeight: 116,
  },
  reasonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  screen: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  shiftList: {
    gap: 10,
  },
  shiftRow: {
    minHeight: 84,
  },
  successIcon: {
    alignItems: "center",
    borderRadius: 999,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
})
