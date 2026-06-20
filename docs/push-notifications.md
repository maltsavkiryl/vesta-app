# Push notifications (client plumbing)

This document describes the **client-side** push-notification plumbing in the
Expo app and the **backend contract** it expects. APNs/FCM credentials and the
server-side push-send service are ops/later work — this covers what the app
already does and what the backend must implement to talk to it.

## Overview

- Token registration + permission handling: `src/services/notifications/push.ts`
- Foreground presentation + tap routing wiring: `src/services/notifications/usePushRegistration.ts`
- Mounted (headless, additive) in `src/app/_layout.tsx` via `<PushRegistration />`,
  inside `AppProvider` so it can read the signed-in session — it does **not**
  disturb the app-lock provider or other providers.

Taps are routed through the **same deep-link layer** as in-app notification
actions: the parsed payload becomes an `AppActionIntent` (`@/core/models`) and is
dispatched via `useAppAction().runAction`, exactly like tapping an in-app
notification's call-to-action.

## Backend contract

### 1. Device-token registration endpoint

The app registers the device's Expo push token on sign-in:

```
POST /employee/devices
Authorization: Bearer <access token>   # via the authed httpClient
Content-Type: application/json

{
  "token": "ExponentPushToken[...]",
  "platform": "ios" | "android" | "web"
}
```

The client call is **defensive**: if this endpoint does not exist yet (404) or
the network is down, the failure is logged in dev and swallowed — it never
breaks sign-in. Once the backend implements the endpoint, no client change is
needed.

### 2. Push message payload

The backend sends pushes through Expo's push service (or APNs/FCM) shaped as:

```jsonc
{
  "title": "New shift offered",
  "body": "Tap to review your shift on Friday",
  "data": {
    // Either a serialized AppActionIntent object (preferred):
    "action": { "type": "respondToShift", "shiftId": "shift-4" }
    // ...or a bare route string (treated as a navigate action):
    // "action": "/(app)/(tabs)/schedule"
  }
}
```

`data.action` is parsed by `parseNotificationAction` into the `AppActionIntent`
union. Supported actions (mirroring `useAppAction`):

| `action.type`             | Required fields        | Optional fields            |
| ------------------------- | ---------------------- | -------------------------- |
| `navigate`                | `route`*               |                            |
| `uploadDocument`          | `title`                | `documentId`               |
| `editAvailabilityTemplate`| —                      |                            |
| `editAvailabilityOverride`| —                      | `date`                     |
| `createScheduleRequest`   | —                      | `category`, `shiftId`      |
| `respondToShift`          | `shiftId`              |                            |

\* `route` is validated against `AppNavigationRoute`. Unknown routes/types are
ignored (the parser returns `null`) so a malformed or hostile payload cannot
navigate the app somewhere unexpected.

## Dev-client rebuild caveat

`expo-notifications` is a native module. Receiving **real** push notifications
requires a fresh **dev-client / EAS build** (`pnpm prebuild:clean` +
`pnpm build:ios:device` / `pnpm build:android:device`) — it will not work in
Expo Go and a JS-only reload is not enough. The unit tests and the parsing /
routing plumbing do not require a rebuild.

On a simulator/emulator (`Device.isDevice === false`) and when permission is
denied, `registerForPushNotifications()` returns `null` and everything no-ops
gracefully.
