import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { getShiftTimeRange } from "@/core/date"
import type { RequestItem, Shift } from "@/core/models"
import {
  ActionRow,
  EmptyState,
  MetaPill,
  SectionBlock,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"

export function ScheduleSelectedDateSection({
  availabilitySourceLabel,
  hasSelectedDayShift,
  onOpenShift,
  requests,
  selectedDateTitle,
  selectedDateOverrideNote,
  selectedDateShiftNote,
  selectedDateSubtitle,
  selectedDayAvailabilityStatus,
  shifts,
}: {
  availabilitySourceLabel: string
  hasSelectedDayShift: boolean
  onOpenShift: (shiftId: Shift["id"]) => void
  requests: RequestItem[]
  selectedDateTitle: string
  selectedDateOverrideNote: string | null
  selectedDateShiftNote: string | null
  selectedDateSubtitle: string
  selectedDayAvailabilityStatus: "available" | "preferred" | "unavailable"
  shifts: Shift[]
}) {
  const tokens = useDesignTokens()

  return (
    <SectionBlock motionDelay={110} title={selectedDateTitle}>
      <SurfaceCard
        style={[
          styles.selectedDateCard,
          hasSelectedDayShift ? styles.selectedDateShiftCard : null,
        ]}
      >
        {hasSelectedDayShift ? null : (
          <>
            <View style={styles.selectedDateHeader}>
              <View style={styles.selectedDateCopy}>
                <Text
                  text="No shift scheduled"
                  size="sm"
                  weight="semiBold"
                  style={{ color: tokens.textPrimary }}
                />
                <Text
                  text={selectedDateSubtitle}
                  size="xxs"
                  style={{ color: tokens.textSecondary }}
                />
              </View>
            </View>

            <View style={styles.selectedDateMeta}>
              <MetaPill
                label={availabilitySourceLabel}
                leading={
                  <Ionicons
                    color={
                      selectedDayAvailabilityStatus === "preferred"
                        ? tokens.accent
                        : selectedDayAvailabilityStatus === "available"
                          ? tokens.success
                          : tokens.textMuted
                    }
                    name="ellipse"
                    size={11}
                  />
                }
              />
            </View>
          </>
        )}

        {shifts.length === 1 ? (
          <ShiftRow
            shift={shifts[0]}
            variant="embedded"
            onPress={() => onOpenShift(shifts[0].id)}
          />
        ) : null}

        {requests.length > 0 ? (
          <View
            style={[
              styles.inlineNotice,
              { backgroundColor: `${tokens.warning}12`, borderColor: `${tokens.warning}22` },
            ]}
          >
            <Ionicons color={tokens.warning} name="document-text-outline" size={14} />
            <Text
              text={`${requests.length} request${requests.length === 1 ? "" : "s"} already touch this date.`}
              size="xxs"
              weight="medium"
              style={{ color: tokens.warning }}
            />
          </View>
        ) : null}

        {selectedDateOverrideNote ? (
          <Text
            text={selectedDateOverrideNote}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        ) : null}

        {selectedDateShiftNote ? (
          <Text text={selectedDateShiftNote} size="xxs" style={{ color: tokens.textSecondary }} />
        ) : null}
      </SurfaceCard>
    </SectionBlock>
  )
}

export function ScheduleDateActionsSection({
  onCreateRequest,
  onEditSelectedDate,
  onOpenSelectedShiftNeedingResponse,
  selectedDateAvailabilityLabel,
  selectedDateAvailabilitySubtitle,
  selectedDayShifts,
  selectedShiftNeedingResponse,
}: {
  onCreateRequest: () => void
  onEditSelectedDate: () => void
  onOpenSelectedShiftNeedingResponse: () => void
  selectedDateAvailabilityLabel: string
  selectedDateAvailabilitySubtitle: string
  selectedDayShifts: Shift[]
  selectedShiftNeedingResponse?: Shift
}) {
  const tokens = useDesignTokens()

  return (
    <SectionBlock motionDelay={165} title="Actions for this date">
      <View style={styles.stack}>
        <ActionRow
          onPress={onEditSelectedDate}
          subtitle={selectedDateAvailabilitySubtitle}
          title={`Availability: ${selectedDateAvailabilityLabel}`}
          leading={
            <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
              <Ionicons color={tokens.accent} name="calendar-outline" size={16} />
            </View>
          }
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />

        {selectedShiftNeedingResponse ? (
          <ActionRow
            onPress={onOpenSelectedShiftNeedingResponse}
            subtitle="Review the updated shift and confirm it from the detail view."
            title="Review shift change"
            leading={
              <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
                <Ionicons color={tokens.accent} name="flash-outline" size={16} />
              </View>
            }
            trailing={
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            }
          />
        ) : null}

        <ActionRow
          onPress={onCreateRequest}
          subtitle={
            selectedDayShifts.length > 0
              ? "Ask for a replacement or flag a conflict for this shift."
              : "Request time off or explain a conflict on this day."
          }
          title={selectedDayShifts.length > 0 ? "Request a change" : "Create request"}
          leading={
            <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
              <Ionicons
                color={tokens.accent}
                name={
                  selectedDayShifts.length > 0
                    ? "swap-horizontal-outline"
                    : "document-text-outline"
                }
                size={16}
              />
            </View>
          }
          trailing={<Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />}
        />
      </View>
    </SectionBlock>
  )
}

export function ScheduleShiftListSection({
  shifts,
  onOpenShift,
}: {
  shifts: Shift[]
  onOpenShift: (shiftId: Shift["id"]) => void
}) {
  if (shifts.length <= 1) {
    return null
  }

  return (
    <SectionBlock motionDelay={220} title="Scheduled shifts">
      <View style={styles.stack}>
        {shifts.map((shift) => (
          <ShiftRow key={shift.id} shift={shift} onPress={() => onOpenShift(shift.id)} />
        ))}
      </View>
    </SectionBlock>
  )
}

export function SchedulePendingRequestsSection({ requests }: { requests: RequestItem[] }) {
  const tokens = useDesignTokens()

  return (
    <SectionBlock motionDelay={275} title="Pending requests">
      {requests.length > 0 ? (
        <SurfaceCard style={styles.requestCard}>
          {requests.map((request, index, items) => (
            <RequestSummaryRow
              key={request.id}
              isLast={index === items.length - 1}
              request={request}
            />
          ))}
        </SurfaceCard>
      ) : (
        <EmptyState
          icon={<Ionicons color={tokens.textMuted} name="document-text-outline" size={18} />}
          subtitle="Requests you send from planning will show up here while they are being reviewed."
          title="No requests yet"
        />
      )}
    </SectionBlock>
  )
}

function ShiftRow({
  shift,
  onPress,
  variant = "default",
}: {
  shift: Shift
  onPress: () => void
  variant?: "default" | "embedded"
}) {
  const tokens = useDesignTokens()
  const isEmbedded = variant === "embedded"
  const tone = shift.requiresResponse
    ? tokens.warning
    : shift.status === "confirmed"
      ? tokens.success
      : shift.status === "changed"
        ? tokens.warning
        : tokens.textMuted

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.shiftRow,
        variant === "embedded" ? styles.shiftRowEmbedded : null,
        { backgroundColor: variant === "embedded" ? tokens.transparent : tokens.surface },
      ]}
    >
      <View style={styles.shiftRowDate}>
        <View style={[styles.shiftDot, { backgroundColor: tone }]} />
      </View>
      <View style={styles.flex}>
        <Text
          text={getShiftTimeRange(shift)}
          size="xs"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={`${shift.role} · ${shift.venueName}`}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
        {shift.changeSummary ? (
          <Text text={shift.changeSummary} size="xxs" style={{ color: tone }} />
        ) : null}
      </View>
      <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
    </Pressable>
  )
}

function RequestSummaryRow({ isLast, request }: { isLast?: boolean; request: RequestItem }) {
  const tokens = useDesignTokens()
  const tone =
    request.status === "approved"
      ? tokens.success
      : request.status === "denied"
        ? tokens.danger
        : tokens.warning

  return (
    <View
      style={[
        styles.requestRow,
        !isLast && {
          borderBottomColor: tokens.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={[styles.requestGlyph, { backgroundColor: `${tone}14` }]}>
        <Ionicons color={tone} name="document-text-outline" size={16} />
      </View>
      <View style={styles.flex}>
        <Text
          text={request.type}
          size="xs"
          weight="semiBold"
          style={{ color: tokens.textPrimary }}
        />
        <Text text={request.target.label} size="xxs" style={{ color: tokens.textSecondary }} />
        <Text text={request.statusDetail} size="xxs" style={{ color: tone }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actionGlyph: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  flex: {
    flex: 1,
  },
  inlineNotice: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  requestCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  requestGlyph: {
    alignItems: "center",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  requestRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectedDateCard: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectedDateCopy: {
    flex: 1,
    gap: 4,
  },
  selectedDateHeader: {
    alignItems: "flex-start",
    minHeight: 22,
  },
  selectedDateMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedDateShiftCard: {
    gap: 8,
    paddingVertical: 12,
  },
  shiftDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  shiftRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  shiftRowDate: {
    alignItems: "center",
    justifyContent: "center",
    width: 18,
  },
  shiftRowEmbedded: {
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  stack: {
    gap: 10,
  },
})
