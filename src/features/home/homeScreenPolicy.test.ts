import type { NotificationItem, Shift } from "@/core/models"

import type { TaskItem } from "./components/HomeTaskSections"
import { deriveHomeScreenPolicy } from "./homeScreenPolicy"

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
  actionLabel: "Upload",
  id: "task-1",
  subtitle: "Complete your profile",
  title: "Upload ID card",
  urgency: "high",
}

const sampleNotification: NotificationItem = {
  body: "Please review your next shift update.",
  id: "notification-1",
  kind: "schedule",
  relativeTime: "2h ago",
  title: "Shift update",
  unread: true,
}

describe("deriveHomeScreenPolicy", () => {
  it("hides duplicated task and update sections when the cockpit already covers the only item", () => {
    const policy = deriveHomeScreenPolicy({
      notifications: [sampleNotification],
      pendingTasks: [sampleTask],
      unreadCount: 1,
      upcomingShifts: [sampleShift],
    })

    expect(policy.homeSummary).toBe("1 action waiting")
    expect(policy.priorityTask?.id).toBe(sampleTask.id)
    expect(policy.shouldShowTasksSection).toBe(false)
    expect(policy.shouldShowUpdatesSection).toBe(false)
  })

  it("shows the lower sections when there are multiple tasks and updates to scan", () => {
    const policy = deriveHomeScreenPolicy({
      notifications: [sampleNotification, { ...sampleNotification, id: "notification-2" }],
      pendingTasks: [sampleTask, { ...sampleTask, id: "task-2" }],
      unreadCount: 2,
      upcomingShifts: [sampleShift],
    })

    expect(policy.shouldShowTasksSection).toBe(true)
    expect(policy.shouldShowUpdatesSection).toBe(true)
  })

  it("falls back to a calm positive summary when there are no actions or updates", () => {
    const policy = deriveHomeScreenPolicy({
      notifications: [],
      pendingTasks: [],
      unreadCount: 0,
      upcomingShifts: [],
    })

    expect(policy.homeSummary).toBe("You're clear for now")
    expect(policy.shouldShowTasksSection).toBe(false)
    expect(policy.shouldShowUpdatesSection).toBe(false)
  })
})
