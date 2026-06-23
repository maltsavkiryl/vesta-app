import type {
  DocumentItem,
  NotificationItem,
  PlanningWindow,
  Shift,
  UserProfile,
} from "@/core/models"

import { createHomeHttpRepository, type HomeHttpRepositoryDeps } from "./home.http.repository"

const profile = { firstName: "Ada" } as unknown as UserProfile
const shifts = [
  { id: "s1", dayLabel: "Mon", requiresResponse: true, changeSummary: "Updated" },
] as unknown as Shift[]
const planningWindows = [
  { id: "w1", label: "July", startDate: "2026-07-01", status: "open" },
] as unknown as PlanningWindow[]
const documents = [{ status: "action_required" }] as unknown as DocumentItem[]
const notifications = [
  { unread: true },
  { unread: true },
  { unread: false },
] as unknown as NotificationItem[]

function buildDeps() {
  const deps = {
    documents: { getDocuments: jest.fn().mockResolvedValue(documents) },
    notifications: { getNotifications: jest.fn().mockResolvedValue(notifications) },
    profile: { getProfile: jest.fn().mockResolvedValue(profile) },
    schedule: {
      getSchedule: jest.fn().mockResolvedValue({ planningWindows, shifts }),
    },
  }
  return deps as unknown as HomeHttpRepositoryDeps & {
    documents: { getDocuments: jest.Mock }
    notifications: { getNotifications: jest.Mock }
    profile: { getProfile: jest.Mock }
    schedule: { getSchedule: jest.Mock }
  }
}

describe("createHomeHttpRepository", () => {
  it("composes profile, schedule, notifications and documents into the overview", async () => {
    const deps = buildDeps()
    const repo = createHomeHttpRepository(deps)

    const overview = await repo.getHomeOverview("account-1")

    expect(overview.profile).toBe(profile)
    expect(overview.shifts).toBe(shifts)
    expect(overview.notifications).toBe(notifications)
    expect(overview.unreadNotifications).toBe(2)
  })

  it("derives tasks from documents, shifts and planning windows", async () => {
    const repo = createHomeHttpRepository(buildDeps())

    const overview = await repo.getHomeOverview("account-1")

    expect(overview.tasks.map((task) => task.id)).toEqual([
      "task-upload-id-card",
      "task-review-s1",
      "task-availability-w1",
    ])
  })

  it("fetches every source scoped to the signed-in account", async () => {
    const deps = buildDeps()

    await createHomeHttpRepository(deps).getHomeOverview("account-1")

    expect(deps.profile.getProfile).toHaveBeenCalledWith("account-1")
    expect(deps.schedule.getSchedule).toHaveBeenCalledWith("account-1")
    expect(deps.notifications.getNotifications).toHaveBeenCalledWith("account-1")
    expect(deps.documents.getDocuments).toHaveBeenCalledWith("account-1")
  })
})
