import * as Notifications from "expo-notifications"
import { renderHook, waitFor } from "@testing-library/react-native"

import { usePushRegistration } from "./usePushRegistration"

const mockRunAction = jest.fn(async () => "opened")
let mockIsSignedIn = true

jest.mock("@/features/actions/useAppAction", () => ({
  useAppAction: () => ({ runAction: mockRunAction }),
}))

jest.mock("@/providers/app-provider", () => ({
  useAppSession: () => ({ isSignedIn: mockIsSignedIn, accountId: "emp-1", needsOnboarding: false }),
}))

const mockRegisterForPush = jest.fn(async () => "ExponentPushToken[abc]")
const mockRegisterDeviceToken = jest.fn(async (_token: string) => true)
const mockSetForegroundHandler = jest.fn()

jest.mock("./push", () => ({
  parseNotificationAction: jest.requireActual("./push").parseNotificationAction,
  registerForPushNotifications: () => mockRegisterForPush(),
  registerDeviceToken: (token: string) => mockRegisterDeviceToken(token),
  setForegroundHandler: () => mockSetForegroundHandler(),
}))

let responseListener: ((response: unknown) => void) | null = null

jest.mock("expo-notifications", () => ({
  getLastNotificationResponseAsync: jest.fn(async () => null),
  addNotificationResponseReceivedListener: jest.fn((listener: (r: unknown) => void) => {
    responseListener = listener
    return { remove: jest.fn() }
  }),
}))

function buildResponse(action: unknown, identifier = "notif-1") {
  return {
    notification: { request: { identifier, content: { data: { action } } } },
  }
}

describe("usePushRegistration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsSignedIn = true
    responseListener = null
    ;(Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null)
  })

  it("registers for push and forwards the token to the backend when signed in", async () => {
    renderHook(() => usePushRegistration())

    expect(mockSetForegroundHandler).toHaveBeenCalled()
    await waitFor(() =>
      expect(mockRegisterDeviceToken).toHaveBeenCalledWith("ExponentPushToken[abc]"),
    )
  })

  it("does nothing when signed out", () => {
    mockIsSignedIn = false
    renderHook(() => usePushRegistration())

    expect(mockSetForegroundHandler).not.toHaveBeenCalled()
    expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled()
  })

  it("routes a tapped notification through the deep-link dispatcher (runAction)", async () => {
    renderHook(() => usePushRegistration())

    await waitFor(() => expect(responseListener).not.toBeNull())
    responseListener?.(buildResponse({ type: "navigate", route: "/(app)/shift/42" }))

    expect(mockRunAction).toHaveBeenCalledWith({ type: "navigate", route: "/(app)/shift/42" })
  })

  it("does not dispatch when the payload has no recognizable action", async () => {
    renderHook(() => usePushRegistration())

    await waitFor(() => expect(responseListener).not.toBeNull())
    responseListener?.(buildResponse({ type: "bogus" }))

    expect(mockRunAction).not.toHaveBeenCalled()
  })

  it("handles the cold-start tap via getLastNotificationResponseAsync", async () => {
    ;(Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(
      buildResponse({ type: "respondToShift", shiftId: "shift-9" }, "cold-1"),
    )

    renderHook(() => usePushRegistration())

    await waitFor(() =>
      expect(mockRunAction).toHaveBeenCalledWith({ type: "respondToShift", shiftId: "shift-9" }),
    )
  })
})
