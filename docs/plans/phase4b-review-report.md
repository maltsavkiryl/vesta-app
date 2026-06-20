# Phase 4B — Review Report

**Branch:** `feat/mobile-11star-phase4b-screens`
**Reviewer commit:** `b2714f2`
**Date:** 2026-06-20

---

## Auth Safety

Auth logic is untouched. `SignInScreen` still calls `router.push("/(auth)/sign-in-email")` for all three buttons — the `SignInButton` extraction is purely structural. `OnboardingWelcome` `onStart`/`onSkip` callbacks flow through unchanged. No token handling, session state, navigation guard, or form submission was altered. Auth tests (`SignInScreen.test.tsx`, `useSignInScreen.test.ts`, `auth.workflow.test.ts`, `auth.api.test.ts`) all pass.

---

## Findings & Fixes

### 1. Press-scale animation broken on non-Pressable responder elements (FIXED — `b2714f2`)

**Root cause:** `usePressScale` returns `pressHandlers: { onPressIn, onPressOut }`. These are `Pressable`-specific event props — they are silently ignored when spread on a raw `View`/`Animated.View`. Phase 4b used a raw `Animated.View` with `onStartShouldSetResponder` + `onResponderRelease` as the interaction layer and spread `pressHandlers` on the same element. The press animation never fired.

**Affected components:**
- `SignInButton` in `SignInScreen.tsx` — inner `Animated.View`
- Both CTA buttons in `OnboardingWelcome.tsx` — inner `Animated.View`
- `NotificationsClearAll` in `NotificationsSections.tsx` — inner `Animated.View`
- `NotificationRowItem` notification body — inner `Animated.View`
- `RequiredDocumentRow` and `PayslipRow` in `DocumentList.tsx` — inner `Animated.View`
- Both close buttons in `EmployerQrScannerScreen.tsx` — inner `Animated.View`

**Fix:** Replace inner `Animated.View` (responder layer) with `Pressable` using `onPress` + `{...pressHandlers}`, matching the correct pattern already used in `EmployerInviteCodeEntry` and `ContractActionRow`. The outer `Animated.View` keeps `animatedStyle`.

Note: `ContractActionRow` in `ContractDetailSections.tsx` was already correct — it used `Pressable` + `{...downloadHandlers/signHandlers}` directly.

### 2. Dead `index` prop in `NotificationRowItem` (FIXED — `b2714f2`)

`index: number` was declared in the component props interface, destructured in the function signature, and passed from `NotificationGroup`'s map, but never used in the component body. Removed from interface, destructure, and call site.

### 3. Hardcoded `Paid ${payslip.date}` in `PayslipRow` (FIXED — `b2714f2`)

`PayslipDetailScreen` was correctly updated to use `translate("documents:paidOn", { date })`, but the same string in `DocumentList.tsx`'s `PayslipRow` was missed. Fixed to use the same i18n key. Import of `translate` added to `DocumentList.tsx`.

### 4. Missing `accessibilityLabel` on OnboardingWelcome CTAs (FIXED — `b2714f2`)

"Get started" and "Skip for now" buttons had `accessibilityRole="button"` but no `accessibilityLabel`. VoiceOver would announce button role + child text content, but a dedicated label is clearer and avoids announcing the arrow icon name. Added `accessibilityLabel="Get started"` and `accessibilityLabel="Skip for now"`.

---

## Consistency Assessment

**Token compliance:** All `${token}08/10/12/14/18` hex-alpha patterns in changed files replaced with proper semantic soft tokens (`accentMuted`, `successSoft`, `warningSoft`, `dangerSoft`). Camera overlay whites in `EmployerQrScannerScreen` correctly preserved as documented exception.

**Elevation:** `tokens.elevation1` consistently applied to floating cards across documents, notifications, employers, and auth. Pattern matches planning + home + time.

**Motion:** `MotionView` entrance stagger in `OnboardingWelcome` matches the phase 3 planning board entrance pattern. `usePressScale` applied uniformly to all interactive rows and buttons (now correctly wired after the fix).

**Skeleton / empty / error:** EmptyState components use the same `Ionicons` + title + subtitle structure as previous phases. Error states use `EmptyState` with `actionLabel` for navigation.

**i18n:** All bare strings in changed files removed. New namespaces `documents:*` and `employers:*` added in all three locales (en/nl/fr). `markAllReadSuccess` key in `documents:` namespace is misnamed (semantically belongs in `notifications:`) but this is a pre-existing structural oddity — not introduced as a regression.

**A11y:**
- Touch targets: all interactive elements have `minHeight: 44+` or explicit `height: 44+`. Dismiss button is 44×34 (narrow but within tolerance). QR code box height is 56pt.
- Unread notification state is not color-only: unread rows use `weight="semiBold"` vs `weight="medium"` in addition to `accentMuted` background + accent dot.
- Decorative icons: `Ionicons` in icon containers are not given separate `accessibilityLabel`, so they're not announced as separate elements.
- `accessible` + `accessibilityRole="button"` present on all interactive elements. `accessibilityLabel` added to CTA buttons in this review.

---

## Compile / Test Summary

```
TypeScript: 0 errors (tsc --noEmit)

Test Suites: 60 passed, 60 total
Tests:       274 passed, 274 total
Snapshots:   0 total
Time:        3.08 s
```

No regressions. All tests that existed before phase 4b continue to pass.

---

## Blocking Concerns

None. The press-scale animation fix (`b2714f2`) is the only behavioral issue found. All visual-only changes in phase 4b are confirmed visual-only.

## Follow-Ups (non-blocking)

- `ProfileDetailDocumentsContent.tsx` error/empty state strings still hardcoded English (pre-existing, noted in phase 4b self-review)
- `documents:markAllReadSuccess` key is semantically misplaced (belongs in `notifications:` namespace) — cosmetic issue, no user impact
- `EmployerQrScannerScreen` `eslint-disable react-native/no-color-literals` comment scoped to file — acceptable given camera overlay context
