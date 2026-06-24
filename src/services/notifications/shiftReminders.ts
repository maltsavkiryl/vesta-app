/**
 * Schedules local "your shift starts soon" notifications from the employee's
 * roster. Reminders are kept in sync with the schedule: each sync cancels the
 * previously-scheduled batch and reschedules from the current shifts, so removed
 * or moved shifts never leave a stale reminder behind. No-ops without permission
 * (the push flow owns the permission prompt) and never throws.
 */
import { Platform } from "react-native"
import * as Notifications from "expo-notifications"

import type { Shift } from "@/core/models"
import { load, remove, save } from "@/utils/storage"

const SCHEDULED_IDS_KEY = "vesta.shift-reminder-ids"
const REMINDER_LEAD_MINUTES = 60

/** Resolves a shift's local start instant from its yyyy-MM-dd + HH:MM fields. */
function shiftStartDate(shift: Shift): Date | null {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(shift.date)
  const time = /^(\d{1,2}):(\d{2})$/.exec(shift.startTime)
  if (!day || !time) return null
  return new Date(
    Number(day[1]),
    Number(day[2]) - 1,
    Number(day[3]),
    Number(time[1]),
    Number(time[2]),
  )
}

async function cancelTrackedReminders() {
  const ids = load<string[]>(SCHEDULED_IDS_KEY) ?? []
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)),
  )
  remove(SCHEDULED_IDS_KEY)
}

export async function syncShiftReminders(shifts: Shift[]): Promise<void> {
  // Local notification scheduling isn't available on web; skip rather than throw.
  if (Platform.OS === "web") return
  try {
    const { status } = await Notifications.getPermissionsAsync()
    if (status !== "granted") return

    await cancelTrackedReminders()

    const now = Date.now()
    const scheduledIds: string[] = []
    for (const shift of shifts) {
      const start = shiftStartDate(shift)
      if (!start) continue
      const triggerAt = start.getTime() - REMINDER_LEAD_MINUTES * 60_000
      if (triggerAt <= now) continue // shift is in the past or starts too soon

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Shift starting soon",
          body: `Your ${shift.role || "shift"} at ${shift.venueName} starts at ${shift.startTime}.`,
          data: { action: "/(app)/(tabs)/schedule" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(triggerAt),
        },
      })
      scheduledIds.push(id)
    }

    if (scheduledIds.length > 0) save(SCHEDULED_IDS_KEY, scheduledIds)
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to sync shift reminders", error)
    }
  }
}
