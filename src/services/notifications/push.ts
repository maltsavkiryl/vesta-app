import { Platform } from "react-native"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"

import type { AppActionIntent, AppNavigationRoute, RequestCategory } from "@/core/models"
import { httpClient } from "@/services/api"

/**
 * Push notification plumbing.
 *
 * This module owns the CLIENT side of push notifications:
 *  - registering the device for an Expo push token,
 *  - showing notifications while the app is foregrounded,
 *  - parsing a push payload's `data` into the app's `AppActionIntent` union so
 *    a tap can be routed through the SAME deep-link layer used by in-app
 *    notification actions (`useAppAction` / `notificationActionLabel`).
 *
 * Backend contract (see docs/push-notifications.md):
 *  - The backend MUST send pushes shaped as:
 *      { title, body, data: { action: <AppActionIntent | AppNavigationRoute> } }
 *    where `action` is either a serialized `AppActionIntent` object (preferred)
 *    or a bare route string (treated as a `navigate` action).
 *  - The backend MUST expose a device-token registration endpoint:
 *      POST /employee/devices  body { token: string, platform: "ios" | "android" | "web" }
 *    This endpoint may not exist yet; the client call is defensive and swallows
 *    failures so the app keeps working without it.
 */

const ANDROID_CHANNEL_ID = "default"

/**
 * Configures how notifications are presented while the app is foregrounded.
 * Without this, push notifications received in the foreground are silently
 * dropped by the OS.
 */
export function setForegroundHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

/**
 * Registers the device for push notifications and returns the Expo push token.
 *
 * No-ops gracefully (returns `null`) on simulators/emulators and when the user
 * denies notification permission, so callers never need to special-case those.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push tokens are only issued to physical devices.
  if (!Device.isDevice) {
    return null
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }

  const existing = await Notifications.getPermissionsAsync()
  let status = existing.status
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync()
    status = requested.status
  }
  if (status !== "granted") {
    return null
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync()
    return tokenResponse.data ?? null
  } catch (error) {
    if (__DEV__) {
      console.warn("Unable to obtain Expo push token", error)
    }
    return null
  }
}

/**
 * Sends the Expo push token to the backend so it can target this device.
 *
 * Defensive by design: the endpoint may not exist yet (404) or the network may
 * be unavailable. We never throw — push registration is best-effort and must
 * not break sign-in.
 */
export async function registerDeviceToken(token: string): Promise<boolean> {
  try {
    const response = await httpClient.post("/employee/devices", {
      token,
      platform: Platform.OS,
    })
    return response.ok ?? false
  } catch (error) {
    if (__DEV__) {
      console.warn("Unable to register device token with backend", error)
    }
    return false
  }
}

const NAVIGATION_ROUTE_PREFIXES = [
  "/(app)/shift/",
  "/(app)/availability/",
  "/(app)/document-upload/",
  "/(app)/document-contract/",
  "/(app)/document-payslip/",
] as const

const NAVIGATION_ROUTES = new Set<string>([
  "/profile/legal-documents",
  "/profile/contracts",
  "/profile/payslips",
  "/(app)/(tabs)/profile",
  "/(app)/(tabs)/schedule",
  "/(app)/(tabs)/time",
  "/notifications",
  "/(app)/tasks",
  "/(app)/request",
  "/(app)/availability-template",
])

function isNavigationRoute(value: unknown): value is AppNavigationRoute {
  if (typeof value !== "string") return false
  if (NAVIGATION_ROUTES.has(value)) return true
  return NAVIGATION_ROUTE_PREFIXES.some((prefix) => value.startsWith(prefix))
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

const REQUEST_CATEGORIES: ReadonlySet<RequestCategory> = new Set([
  "time_off",
  "shift_change",
  "availability_issue",
])

function parseRequestCategory(value: unknown): RequestCategory | undefined {
  return typeof value === "string" && REQUEST_CATEGORIES.has(value as RequestCategory)
    ? (value as RequestCategory)
    : undefined
}

/**
 * Parses a push notification payload's `data` into the app's `AppActionIntent`
 * union, or `null` when the payload carries no recognizable action.
 *
 * Accepts two shapes for `data.action`:
 *  - a serialized `AppActionIntent` object (e.g. `{ type: "respondToShift", shiftId }`)
 *  - a bare route string (treated as `{ type: "navigate", route }`)
 */
export function parseNotificationAction(data: unknown): AppActionIntent | null {
  if (!data || typeof data !== "object") return null
  const action = (data as { action?: unknown }).action
  if (action == null) return null

  // Bare route string → navigate.
  if (typeof action === "string") {
    return isNavigationRoute(action) ? { type: "navigate", route: action } : null
  }

  if (typeof action !== "object") return null
  const intent = action as Record<string, unknown>

  switch (intent.type) {
    case "navigate":
      return isNavigationRoute(intent.route) ? { type: "navigate", route: intent.route } : null
    case "uploadDocument": {
      const title = asString(intent.title)
      if (!title) return null
      return { type: "uploadDocument", title, documentId: asString(intent.documentId) }
    }
    case "editAvailabilityTemplate":
      return { type: "editAvailabilityTemplate" }
    case "editAvailabilityOverride":
      return { type: "editAvailabilityOverride", date: asString(intent.date) }
    case "createScheduleRequest":
      return {
        type: "createScheduleRequest",
        category: parseRequestCategory(intent.category),
        shiftId: asString(intent.shiftId),
      }
    case "respondToShift": {
      const shiftId = asString(intent.shiftId)
      if (!shiftId) return null
      return { type: "respondToShift", shiftId }
    }
    default:
      return null
  }
}
