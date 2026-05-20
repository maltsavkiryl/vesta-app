import type { Shift } from "@/core/models"

import type { TaskItem } from "./HomeTaskSectionRows"
import { getPrimaryCockpitAction } from "./homeCockpit.utils"

const sampleShift: Shift = {
  id: "shift-1",
  date: "2099-05-20",
  dayLabel: "Wed",
  endTime: "23:30",
  role: "Waiter",
  startTime: "18:00",
  status: "confirmed",
  venueAddress: "Grand Place 1",
  venueName: "Bistro Noir",
}

const sampleTask: TaskItem = {
  action: { route: "/(app)/tasks", type: "navigate" },
  actionLabel: "Upload now",
  id: "task-1",
  subtitle: "Finish your profile photo",
  title: "Upload profile photo",
  urgency: "high",
}

describe("getPrimaryCockpitAction", () => {
  it("prioritizes the next task when one is waiting", () => {
    const onOpenTask = jest.fn()

    const action = getPrimaryCockpitAction({
      nextShift: sampleShift,
      onOpenNotifications: jest.fn(),
      onOpenSchedule: jest.fn(),
      onOpenTask,
      pendingTaskCount: 2,
      priorityTask: sampleTask,
      unreadCount: 3,
    })

    expect(action.title).toBe("Upload profile photo")
    expect(action.label).toBe("Upload now")
    expect(action.subtitle).toBe("Finish your profile photo · 1 more waiting")

    action.onPress()

    expect(onOpenTask).toHaveBeenCalledWith(sampleTask)
  })

  it("falls back to the next shift when there is no priority task", () => {
    const onOpenSchedule = jest.fn()

    const action = getPrimaryCockpitAction({
      nextShift: sampleShift,
      onOpenNotifications: jest.fn(),
      onOpenSchedule,
      onOpenTask: jest.fn(),
      pendingTaskCount: 0,
      unreadCount: 0,
    })

    expect(action.title).toBe("Your next shift is lined up")
    expect(action.label).toBe("View shift")
    expect(action.subtitle).toContain("Bistro Noir")

    action.onPress()

    expect(onOpenSchedule).toHaveBeenCalledTimes(1)
  })

  it("uses unread updates when there is no task or shift", () => {
    const onOpenNotifications = jest.fn()

    const action = getPrimaryCockpitAction({
      onOpenNotifications,
      onOpenSchedule: jest.fn(),
      onOpenTask: jest.fn(),
      pendingTaskCount: 0,
      unreadCount: 2,
    })

    expect(action.title).toBe("Nothing urgent, but there is fresh activity")
    expect(action.label).toBe("Review updates")
    expect(action.subtitle).toBe("2 updates still waiting for you")

    action.onPress()

    expect(onOpenNotifications).toHaveBeenCalledTimes(1)
  })

  it("returns the calm planning fallback when nothing is waiting", () => {
    const onOpenSchedule = jest.fn()

    const action = getPrimaryCockpitAction({
      onOpenNotifications: jest.fn(),
      onOpenSchedule,
      onOpenTask: jest.fn(),
      pendingTaskCount: 0,
      unreadCount: 0,
    })

    expect(action.title).toBe("Everything important is under control")
    expect(action.label).toBe("Review planning")

    action.onPress()

    expect(onOpenSchedule).toHaveBeenCalledTimes(1)
  })
})
