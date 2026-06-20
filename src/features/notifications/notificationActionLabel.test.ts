import { getNotificationActionLabelKey } from "./notificationActionLabel"

describe("getNotificationActionLabelKey", () => {
  it("maps shift routes to a specific label key", () => {
    expect(getNotificationActionLabelKey({ route: "/(app)/shift/shift-4", type: "navigate" })).toBe(
      "notifications:actions.viewShift",
    )
  })

  it("maps upload actions to a specific label key", () => {
    expect(
      getNotificationActionLabelKey({
        documentId: "document-1",
        title: "ID card",
        type: "uploadDocument",
      }),
    ).toBe("notifications:actions.uploadNow")
  })

  it("maps availability actions to a specific label key", () => {
    expect(
      getNotificationActionLabelKey({ date: "2026-05-18", type: "editAvailabilityOverride" }),
    ).toBe("notifications:actions.setHours")
  })

  it("maps schedule and request navigation to review label keys", () => {
    expect(
      getNotificationActionLabelKey({ route: "/(app)/(tabs)/schedule", type: "navigate" }),
    ).toBe("notifications:actions.reviewPlanning")
    expect(getNotificationActionLabelKey({ route: "/(app)/request", type: "navigate" })).toBe(
      "notifications:actions.reviewRequest",
    )
  })

  it("returns null when there is no action", () => {
    expect(getNotificationActionLabelKey()).toBeNull()
  })
})
