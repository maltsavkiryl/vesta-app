import { useEffect, useRef } from "react"
import * as Notifications from "expo-notifications"

import { useAppAction } from "@/features/actions/useAppAction"
import { useAppSession } from "@/providers/app-provider"

import {
  parseNotificationAction,
  registerDeviceToken,
  registerForPushNotifications,
  setForegroundHandler,
} from "./push"

function extractData(response: Notifications.NotificationResponse | null): unknown {
  return response?.notification?.request?.content?.data ?? null
}

/**
 * Wires up push notifications for the signed-in user.
 *
 * On sign-in it:
 *  - sets the foreground presentation handler,
 *  - registers for push and forwards the Expo token to the backend,
 *  - handles the cold-start tap (`getLastNotificationResponseAsync`),
 *  - subscribes to notification-response taps and routes each through the
 *    existing deep-link dispatcher (`useAppAction().runAction`) — the SAME
 *    layer that powers in-app notification actions.
 *
 * Everything no-ops gracefully on simulators / when permission is denied.
 * Mounted additively from `src/app/_layout.tsx` inside the signed-in context.
 */
export function usePushRegistration(): void {
  const { isSignedIn } = useAppSession()
  const { runAction } = useAppAction()

  // Keep the latest dispatcher in a ref so the listener closure (registered
  // once per signed-in session) always calls the current runAction.
  const runActionRef = useRef(runAction)
  runActionRef.current = runAction

  // Register for push + forward token to the backend.
  useEffect(() => {
    if (!isSignedIn) return

    let cancelled = false
    setForegroundHandler()

    void (async () => {
      const token = await registerForPushNotifications()
      if (cancelled || !token) return
      await registerDeviceToken(token)
    })()

    return () => {
      cancelled = true
    }
  }, [isSignedIn])

  // Route notification taps through the deep-link layer.
  useEffect(() => {
    if (!isSignedIn) return

    const handledIds = new Set<string>()

    const handleResponse = (response: Notifications.NotificationResponse | null) => {
      if (!response) return
      const id = response.notification.request.identifier
      if (id) {
        if (handledIds.has(id)) return
        handledIds.add(id)
      }
      const action = parseNotificationAction(extractData(response))
      if (action) {
        void runActionRef.current(action)
      }
    }

    // Cold start: the app was opened by tapping a notification.
    void Notifications.getLastNotificationResponseAsync().then(handleResponse)

    // Warm taps while the app is running/backgrounded.
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse)

    return () => {
      subscription.remove()
    }
  }, [isSignedIn])
}
