import * as Notifications from "expo-notifications"

import type { Shift } from "@/core/models"
import { remove } from "@/utils/storage"

import { syncShiftReminders } from "./shiftReminders"

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: "date" },
}))

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>

function makeShift(overrides: Partial<Shift>): Shift {
  return {
    id: "shift-1",
    date: "2099-01-01",
    dayLabel: "",
    startTime: "09:00",
    endTime: "17:00",
    role: "Waiter",
    venueName: "Bistro Noir",
    venueAddress: "Grand Place 1",
    status: "confirmed",
    ...overrides,
  }
}

describe("syncShiftReminders", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    remove("vesta.shift-reminder-ids")
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: "granted" } as never)
    mockNotifications.scheduleNotificationAsync.mockResolvedValue("scheduled-id")
    mockNotifications.cancelScheduledNotificationAsync.mockResolvedValue(undefined as never)
  })

  it("does nothing without notification permission", async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: "denied" } as never)
    await syncShiftReminders([makeShift({})])
    expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  it("schedules future shifts and skips past ones", async () => {
    await syncShiftReminders([
      makeShift({ id: "future", date: "2099-01-01" }),
      makeShift({ id: "past", date: "2000-01-01" }),
    ])
    expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1)
    const arg = mockNotifications.scheduleNotificationAsync.mock.calls[0][0]
    expect(arg.content.title).toBe("Shift starting soon")
    expect(arg.content.body).toContain("Bistro Noir")
  })

  it("cancels the previous batch before rescheduling", async () => {
    await syncShiftReminders([makeShift({ id: "future" })])
    await syncShiftReminders([makeShift({ id: "future" })])
    expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("scheduled-id")
  })
})
