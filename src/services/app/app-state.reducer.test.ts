import { createInitialState } from "@/core/mockState"

import { applyAppAction } from "./app-state.reducer"

describe("applyAppAction", () => {
  it("archives a single notification and marks it read", () => {
    const state = createInitialState()
    const notification = state.notifications[0]

    const nextState = applyAppAction(state, {
      type: "archiveNotification",
      payload: { id: notification.id },
    })

    const archived = nextState.notifications.find((item) => item.id === notification.id)

    expect(archived?.archivedAt).toBeTruthy()
    expect(archived?.unread).toBe(false)
  })

  it("archives all notifications", () => {
    const state = createInitialState()

    const nextState = applyAppAction(state, { type: "archiveAllNotifications" })

    expect(nextState.notifications.every((item) => item.archivedAt && !item.unread)).toBe(true)
  })

  it("updates the password changed timestamp", () => {
    const state = createInitialState()
    const changedAt = "2026-05-19T12:34:56.000Z"

    const nextState = applyAppAction(state, {
      type: "updatePasswordMetadata",
      payload: { changedAt },
    })

    expect(nextState.profile.security.passwordLastChangedAt).toBe(changedAt)
  })
})
