import { getNotificationActionLabel } from "./notificationActionLabel"

describe("getNotificationActionLabel", () => {
  it("maps shift routes to a specific label", () => {
    expect(
      getNotificationActionLabel({ route: "/(app)/shift/shift-4", type: "navigate" }),
    ).toBe("View shift")
  })

  it("maps upload actions to a specific label", () => {
    expect(
      getNotificationActionLabel({
        documentId: "document-1",
        title: "ID card",
        type: "uploadDocument",
      }),
    ).toBe("Upload now")
  })

  it("maps availability actions to a specific label", () => {
    expect(
      getNotificationActionLabel({ date: "2026-05-18", type: "editAvailabilityOverride" }),
    ).toBe("Set hours")
  })

  it("maps schedule and request navigation to review labels", () => {
    expect(
      getNotificationActionLabel({ route: "/(app)/(tabs)/schedule", type: "navigate" }),
    ).toBe("Review planning")
    expect(getNotificationActionLabel({ route: "/(app)/request", type: "navigate" })).toBe(
      "Review request",
    )
  })

  it("returns null when there is no action", () => {
    expect(getNotificationActionLabel()).toBeNull()
  })
})
