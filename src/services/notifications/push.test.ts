import * as Device from "expo-device"
import * as Notifications from "expo-notifications"

import { parseNotificationAction, registerDeviceToken, registerForPushNotifications } from "./push"

jest.mock("expo-device", () => ({
  isDevice: true,
}))

jest.mock("expo-notifications", () => ({
  AndroidImportance: { DEFAULT: 3 },
  setNotificationChannelAsync: jest.fn(async () => {}),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: "ExponentPushToken[abc123]" })),
}))

const mockPost = jest.fn(async (..._args: unknown[]) => ({ ok: true, status: 200 }))
jest.mock("@/services/api", () => ({
  httpClient: { post: (...args: unknown[]) => mockPost(...args) },
}))

const mockedDevice = Device as unknown as { isDevice: boolean }
const mockedNotifications = Notifications as unknown as {
  getPermissionsAsync: jest.Mock
  requestPermissionsAsync: jest.Mock
  getExpoPushTokenAsync: jest.Mock
}

describe("registerForPushNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedDevice.isDevice = true
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: "granted" })
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({ status: "granted" })
    mockedNotifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "ExponentPushToken[abc123]",
    })
  })

  it("returns null on a simulator (non-device)", async () => {
    mockedDevice.isDevice = false
    expect(await registerForPushNotifications()).toBeNull()
    expect(mockedNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled()
  })

  it("returns null when permission is denied", async () => {
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: "undetermined" })
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({ status: "denied" })
    expect(await registerForPushNotifications()).toBeNull()
    expect(mockedNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled()
  })

  it("returns the Expo push token when permitted", async () => {
    expect(await registerForPushNotifications()).toBe("ExponentPushToken[abc123]")
  })

  it("does not re-request permission when already granted", async () => {
    await registerForPushNotifications()
    expect(mockedNotifications.requestPermissionsAsync).not.toHaveBeenCalled()
  })
})

describe("registerDeviceToken", () => {
  beforeEach(() => jest.clearAllMocks())

  it("POSTs the token + platform to /employee/devices", async () => {
    const ok = await registerDeviceToken("ExponentPushToken[abc123]")
    expect(ok).toBe(true)
    expect(mockPost).toHaveBeenCalledWith("/employee/devices", {
      token: "ExponentPushToken[abc123]",
      platform: expect.any(String),
    })
  })

  it("swallows failures (e.g. endpoint missing) without throwing", async () => {
    mockPost.mockRejectedValueOnce(new Error("network"))
    await expect(registerDeviceToken("t")).resolves.toBe(false)
  })

  it("returns false on a non-ok response", async () => {
    mockPost.mockResolvedValueOnce({ ok: false, status: 404 })
    await expect(registerDeviceToken("t")).resolves.toBe(false)
  })
})

describe("parseNotificationAction", () => {
  it("maps a respondToShift payload to the AppActionIntent", () => {
    expect(
      parseNotificationAction({ action: { type: "respondToShift", shiftId: "shift-4" } }),
    ).toEqual({
      type: "respondToShift",
      shiftId: "shift-4",
    })
  })

  it("maps a navigate payload, validating the route", () => {
    expect(
      parseNotificationAction({ action: { type: "navigate", route: "/(app)/shift/9" } }),
    ).toEqual({
      type: "navigate",
      route: "/(app)/shift/9",
    })
  })

  it("treats a bare route string as a navigate action", () => {
    expect(parseNotificationAction({ action: "/(app)/(tabs)/schedule" })).toEqual({
      type: "navigate",
      route: "/(app)/(tabs)/schedule",
    })
  })

  it("maps a createScheduleRequest payload and validates the category", () => {
    expect(
      parseNotificationAction({
        action: { type: "createScheduleRequest", category: "time_off", shiftId: "s1" },
      }),
    ).toEqual({ type: "createScheduleRequest", category: "time_off", shiftId: "s1" })
    expect(
      parseNotificationAction({ action: { type: "createScheduleRequest", category: "bogus" } }),
    ).toEqual({ type: "createScheduleRequest", category: undefined, shiftId: undefined })
  })

  it("returns null for an unknown action type", () => {
    expect(parseNotificationAction({ action: { type: "selfDestruct" } })).toBeNull()
  })

  it("returns null for an invalid navigation route", () => {
    expect(parseNotificationAction({ action: { type: "navigate", route: "/hacker" } })).toBeNull()
    expect(parseNotificationAction({ action: "/hacker" })).toBeNull()
  })

  it("returns null when there is no action / bad data", () => {
    expect(parseNotificationAction(undefined)).toBeNull()
    expect(parseNotificationAction(null)).toBeNull()
    expect(parseNotificationAction({})).toBeNull()
    expect(parseNotificationAction("nope")).toBeNull()
  })

  it("requires a shiftId for respondToShift and a title for uploadDocument", () => {
    expect(parseNotificationAction({ action: { type: "respondToShift" } })).toBeNull()
    expect(parseNotificationAction({ action: { type: "uploadDocument" } })).toBeNull()
    expect(
      parseNotificationAction({
        action: { type: "uploadDocument", title: "ID", documentId: "d1" },
      }),
    ).toEqual({ type: "uploadDocument", title: "ID", documentId: "d1" })
  })
})
