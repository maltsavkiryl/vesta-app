import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { formatShortDate, getRelativeDayLabel, getShiftTimeRange } from "@/core/date"
import type { PlanningWindow, RequestItem, Shift } from "@/core/models"
import type { AgendaSection } from "@/features/schedule/schedule.utils"
import {
  ActionRow,
  AppButton,
  EmptyState,
  MetaPill,
  ProgressBar,
  SectionBlock,
  Skeleton,
  SkeletonText,
  StatusBadge,
  SurfaceCard,
  Text,
  useDesignTokens,
} from "@/ui"

export function ScheduleScreenSkeleton() {
  return (
    <View style={styles.skeletonStack}>
      <SurfaceCard style={styles.heroCard}>
        <Skeleton width={96} height={12} />
        <Skeleton width="70%" height={22} />
        <Skeleton width="55%" height={12} />
      </SurfaceCard>
      <SurfaceCard style={styles.planningCard}>
        <Skeleton width="50%" height={14} />
        <Skeleton width="100%" height={6} radius={3} />
        <SkeletonText lines={2} />
        <Skeleton width="100%" height={44} radius={14} />
      </SurfaceCard>
      <View style={styles.stack}>
        <Skeleton width={120} height={14} />
        <Skeleton width="100%" height={64} radius={18} />
        <Skeleton width="100%" height={64} radius={18} />
      </View>
    </View>
  )
}

function getShiftTone(shift: Shift, tokens: ReturnType<typeof useDesignTokens>) {
  if (shift.responseStatus === "declined") return tokens.danger
  if (shift.requiresResponse) return tokens.warning
  if (shift.status === "confirmed") return tokens.success
  if (shift.status === "changed") return tokens.warning
  return tokens.textMuted
}

function getShiftStatusLabel(shift: Shift): string | null {
  if (shift.responseStatus === "declined") return "Declined"
  if (shift.requiresResponse) return "Needs response"
  if (shift.status === "changed") return "Updated"
  if (shift.status === "pending") return "To confirm"
  return null
}

export function ScheduleNextShiftHero({
  countdown,
  onOpenShift,
  shift,
}: {
  countdown: string | null
  onOpenShift: (shiftId: Shift["id"]) => void
  shift?: Shift
}) {
  const tokens = useDesignTokens()

  if (!shift) {
    return (
      <SurfaceCard style={styles.heroCard}>
        <View style={styles.heroEyebrowRow}>
          <Ionicons color={tokens.success} name="checkmark-circle" size={14} />
          <Text
            text="ALL CAUGHT UP"
            size="xxs"
            weight="semiBold"
            style={[styles.heroEyebrow, { color: tokens.textSecondary }]}
          />
        </View>
        <Text
          text="No upcoming shifts"
          size="lg"
          weight="bold"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text="Enjoy the downtime. New shifts will show up here the moment they're scheduled."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </SurfaceCard>
    )
  }

  const relativeDay = getRelativeDayLabel(shift.date)
  const needsAttention = shift.requiresResponse || shift.responseStatus === "declined"

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Next shift, ${relativeDay} ${getShiftTimeRange(shift)} at ${shift.venueName}${
        countdown ? `, ${countdown}` : ""
      }. Open shift details.`}
      onPress={() => onOpenShift(shift.id)}
    >
      <SurfaceCard style={[styles.heroCard, styles.cardBorder, { borderColor: tokens.accentSoft }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroEyebrowRow}>
            <Ionicons color={tokens.accent} name="flash" size={14} />
            <Text
              text="NEXT SHIFT"
              size="xxs"
              weight="semiBold"
              style={[styles.heroEyebrow, { color: tokens.accent }]}
            />
          </View>
          {countdown ? (
            <View style={[styles.countdownPill, { backgroundColor: tokens.accentSoft }]}>
              <Ionicons color={tokens.accent} name="time-outline" size={12} />
              <Text
                text={countdown}
                size="xxs"
                weight="semiBold"
                style={{ color: tokens.accent }}
              />
            </View>
          ) : null}
        </View>

        <Text
          text={`${relativeDay} · ${getShiftTimeRange(shift)}`}
          size="lg"
          weight="bold"
          style={{ color: tokens.textPrimary }}
        />

        <View style={styles.heroMetaRow}>
          <MetaPill
            label={`${shift.role} · ${shift.venueName}`}
            leading={<Ionicons color={tokens.textSecondary} name="business-outline" size={13} />}
          />
          {needsAttention ? (
            <StatusBadge
              label={shift.responseStatus === "declined" ? "Declined" : "Needs response"}
              tone={shift.responseStatus === "declined" ? "danger" : "warning"}
            />
          ) : null}
        </View>
      </SurfaceCard>
    </Pressable>
  )
}

export function SchedulePlanningWindowCard({
  coverage,
  deadlineCountdown,
  onCompleteNext,
  onSubmit,
  window,
}: {
  coverage?: { completedDates: string[]; dates: string[] }
  deadlineCountdown: string | null
  onCompleteNext: () => void
  onSubmit: () => void | Promise<void>
  window: PlanningWindow
}) {
  const tokens = useDesignTokens()
  const completed = coverage?.completedDates.length ?? 0
  const total = coverage?.dates.length ?? 0
  const progress = total > 0 ? (completed / total) * 100 : 0
  const isComplete = total > 0 && completed === total
  const isUrgent = !deadlineCountdown || /min|^in 1?h|1 day/.test(deadlineCountdown ?? "")
  const deadlineTone = deadlineCountdown
    ? isUrgent
      ? tokens.danger
      : tokens.warning
    : tokens.danger

  return (
    <SectionBlock motionDelay={110} title="Availability to submit">
      <SurfaceCard
        style={[styles.planningCard, styles.cardBorder, { borderColor: tokens.accentSoft }]}
      >
        <View style={styles.planningHeader}>
          <View style={styles.flex}>
            <Text
              text={window.label}
              size="sm"
              weight="semiBold"
              style={{ color: tokens.textPrimary }}
            />
            <Text
              text={`${formatShortDate(window.startDate)} – ${formatShortDate(window.endDate)}`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
          <View style={[styles.deadlinePill, { backgroundColor: `${deadlineTone}14` }]}>
            <Ionicons color={deadlineTone} name="alarm-outline" size={12} />
            <Text
              text={deadlineCountdown ? `Closes ${deadlineCountdown}` : "Deadline passed"}
              size="xxs"
              weight="semiBold"
              style={{ color: deadlineTone }}
            />
          </View>
        </View>

        <View style={styles.planningProgress}>
          <View style={styles.planningProgressLabels}>
            <Text
              text={`${completed} of ${total} days set`}
              size="xxs"
              weight="medium"
              style={{ color: tokens.textSecondary }}
            />
            <Text
              text={`${Math.round(progress)}%`}
              size="xxs"
              weight="semiBold"
              style={{ color: isComplete ? tokens.success : tokens.textSecondary }}
            />
          </View>
          <ProgressBar
            progress={progress}
            thickness={6}
            fillColor={isComplete ? tokens.success : tokens.accent}
          />
        </View>

        <Text
          text={
            isComplete
              ? "Every day is set — submit to send your availability to your manager."
              : "Set the days you can work, then submit before the deadline."
          }
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />

        <View style={styles.planningActions}>
          <AppButton
            accessibilityLabel="Submit availability for this planning window"
            fullWidth
            label="Submit availability"
            onPress={() => void onSubmit()}
          />
          {!isComplete ? (
            <AppButton
              accessibilityLabel="Set availability for the next open day"
              fullWidth
              label="Set next open day"
              onPress={onCompleteNext}
              variant="secondary"
            />
          ) : null}
        </View>
      </SurfaceCard>
    </SectionBlock>
  )
}

export function SchedulePlanningWindowSubmittedCard({ window }: { window: PlanningWindow }) {
  const tokens = useDesignTokens()

  return (
    <SectionBlock motionDelay={110} title="Availability">
      <SurfaceCard style={styles.planningCard}>
        <View style={styles.planningHeader}>
          <View style={styles.flex}>
            <Text
              text={window.label}
              size="sm"
              weight="semiBold"
              style={{ color: tokens.textPrimary }}
            />
            <Text
              text={`${formatShortDate(window.startDate)} – ${formatShortDate(window.endDate)}`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
          <StatusBadge label="Submitted" tone="success" />
        </View>
        <Text
          text="Thanks — your availability is in. We'll let you know once the rota is published."
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </SurfaceCard>
    </SectionBlock>
  )
}

export function ScheduleAgendaList({
  onOpenShift,
  sections,
}: {
  onOpenShift: (shiftId: Shift["id"]) => void
  sections: AgendaSection[]
}) {
  const tokens = useDesignTokens()

  if (sections.length === 0) {
    return (
      <SectionBlock motionDelay={165} title="Upcoming shifts">
        <EmptyState
          icon={<Ionicons color={tokens.textMuted} name="calendar-outline" size={18} />}
          subtitle="Once new shifts are scheduled, they'll appear here grouped by week."
          title="No upcoming shifts"
        />
      </SectionBlock>
    )
  }

  return (
    <>
      {sections.map((section, index) => (
        <SectionBlock key={section.key} motionDelay={165 + index * 45} title={section.label}>
          <View style={styles.stack}>
            {section.shifts.map((shift) => (
              <AgendaShiftRow key={shift.id} onPress={() => onOpenShift(shift.id)} shift={shift} />
            ))}
          </View>
        </SectionBlock>
      ))}
    </>
  )
}

function AgendaShiftRow({ onPress, shift }: { onPress: () => void; shift: Shift }) {
  const tokens = useDesignTokens()
  const tone = getShiftTone(shift, tokens)
  const statusLabel = getShiftStatusLabel(shift)
  const relativeDay = getRelativeDayLabel(shift.date)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${relativeDay}, ${getShiftTimeRange(shift)}, ${shift.role} at ${shift.venueName}${
        statusLabel ? `, ${statusLabel}` : ""
      }`}
      onPress={onPress}
      style={[styles.agendaRow, { backgroundColor: tokens.surface }]}
    >
      <View style={[styles.agendaDateChip, { backgroundColor: `${tone}14` }]}>
        <Text
          text={relativeDay}
          size="xxs"
          weight="semiBold"
          style={[styles.agendaDateChipText, { color: tone }]}
          numberOfLines={1}
        />
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
      </View>
      {statusLabel ? (
        <StatusBadge
          label={statusLabel}
          tone={
            shift.responseStatus === "declined"
              ? "danger"
              : shift.requiresResponse || shift.status === "changed"
                ? "warning"
                : "neutral"
          }
        />
      ) : (
        <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
      )}
    </Pressable>
  )
}

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
        style={[styles.selectedDateCard, hasSelectedDayShift ? styles.selectedDateShiftCard : null]}
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
    <SectionBlock motionDelay={165} title="For this day">
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
            title="Respond to shift update"
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
          title={selectedDayShifts.length > 0 ? "Report a conflict" : "Request time off"}
          leading={
            <View style={[styles.actionGlyph, { backgroundColor: tokens.accentSoft }]}>
              <Ionicons
                color={tokens.accent}
                name={
                  selectedDayShifts.length > 0 ? "swap-horizontal-outline" : "document-text-outline"
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
          subtitle="Requests you send from planning appear here while they are being reviewed."
          title="Nothing pending"
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
  agendaDateChip: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    justifyContent: "center",
    minWidth: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  agendaDateChipText: {
    textTransform: "capitalize",
  },
  agendaRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardBorder: {
    borderWidth: 1,
  },
  countdownPill: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deadlinePill: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flex: {
    flex: 1,
  },
  heroCard: {
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  heroEyebrow: {
    letterSpacing: 0.6,
  },
  heroEyebrowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  heroMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  planningActions: {
    gap: 10,
    marginTop: 2,
  },
  planningCard: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  planningHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  planningProgress: {
    gap: 6,
  },
  planningProgressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  skeletonStack: {
    gap: 22,
  },
  stack: {
    gap: 10,
  },
})
