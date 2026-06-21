# Vesta-mobile "15-star / 10-10 UI-UX" audit + fix plan (2026-06-21)

Status: **AUDIT COMPLETE, IMPLEMENTATION NOT YET DONE** (interrupted by weekly usage limit).
Branch: `chore/mobile-15star` (off origin/main `51cc4ab`). Worktree: `~/Workspace/vesta-mobile-wt/15star`.

Baseline validation on origin/main: `compile` clean, `depcruise` clean (509 modules), jest **292 pass / 1 flaky** (`app-lock-provider.test.tsx` — times out only under full-suite load). Repo-wide `lint:check` has pre-existing drift → lint only changed files. Earnings removal verified **clean** in time/profile/core (only orphaned `formatCurrency` helpers remain — delete).

Fixes are partitioned by non-overlapping file ownership so they can run in parallel.

## A. Auth / shell / providers  (src/providers, src/app/_layout, index, (app)/_layout, (app)/(tabs)/_layout, (auth), features/auth, useOnboardingScreen, utils/formatDate.ts)
- [HIGH] `app-lock-provider.test.tsx` flaky: before pressing "Unlock", `await waitFor(() => expect(getByLabelText("Unlock").props.accessibilityState?.disabled).toBe(false))`. Ensure overlay exposes `accessibilityState={{disabled: authenticating}}`.
- [HIGH] `app-lock-provider.tsx`: cold-start flashes protected UI because `locked` inits from `lockEnabled` (false until profile query resolves). Keep `locked=true` while profile pending for a signed-in account.
- [HIGH] Session-loading redirect flicker: app-provider derives isSignedIn/needsOnboarding with `?? false`. Expose `isSessionReady`; render null in `index.tsx`, `(app)/_layout.tsx`, `(auth)/_layout.tsx` until session settles before redirecting.
- [HIGH] Auth screens no loading/double-submit guard: `useSignInScreen`, `useRegisterScreen`, `ForgotPasswordScreen` — add isSubmitting + disable + `isLoading` on buttons; early-return while pending.
- [MED] `_layout.tsx`: `initI18n().then().then(loadDateFnsLocale)` has no `.catch` (app stuck on splash if it rejects) → add catch+report+unblock. Remove dead `loadDateFnsLocale` and DELETE `src/utils/formatDate.ts` (no real callers).
- [MED] `(app)/(tabs)/_layout.tsx`: cap unread badge `unreadCount > 99 ? "99+" : unreadCount`.
- [MED] `useOnboardingScreen.ts`: replace positional `canContinue` array with named per-step validator; add submit loading + visible error on `complete()`.
- [MED] `app-lock-provider.tsx`: show "Biometrics unavailable — lock disabled" when isUnavailable; retry hint after a failed attempt.
- [LOW] Nav titles in `(app)/_layout.tsx` mix English + untranslated Dutch ("Taken voor vandaag", "Open oproepen", "Mijn aanvragen", "Verlof", "Shift ruilen", "Wijziging aanvragen") → route through `t()`.

## B. Time / clock  (src/features/time, src/services/liveActivity)
- [HIGH] `time.http.repository.ts` `flushClockQueue` has no concurrency lock (called from sendPunch + getClockSession) → duplicate punch replay. Guard with in-flight promise singleton.
- [HIGH] `sendPunch` POSTs new punch even when queue still non-empty after flush → out-of-order replay. Enqueue instead when `hasQueuedPunches()`.
- [HIGH] `useTimeClockActions.ts`: break-start/break-end/clock-out lack the pending-ref guard `handleClockIn` has → double-tap duplicates. Add guard to all four.
- [HIGH] Clock-out confirm button (`ClockOutScreen`/`ClockOutSections`/`useClockOutScreen`): no loading/disabled during location+network; no visible error on failure. Add pending+spinner and surface Alert/inline error.
- [MED] `useTimeCardController.ts`: `query.data ?? createInitialState()` swallows loading/error behind mock. Surface isLoading skeleton + isError retry when there is no data.
- [MED] offline clock-out synthetic id `pending-${occurredAtUtc}` has colons + collides; dead detail nav. Use collision-safe id; detail tolerates/hides pending.
- [MED] `useTimeEntryDetailScreen`/`TimeEntryDetailScreen`: same empty state for loading vs not-found. Thread isLoading → skeleton.
- [MED] liveActivity: `sessionId = startedAt` collision; returned token discarded. Use composite session id; store/await token for update/end.
- [LOW] Extract magic numbers (overtime `6*3600`, early window `-15`); import shared ENDPOINT map in sendPunch.

## C. Planning / profile  (src/features/planning, src/features/profile)
- [HIGH] `usePlanningChangeNewScreen.ts`: change request submittable with no change → require date/start/end to differ; seed date picker from selected shift.
- [HIGH] `profileDetailFormState.ts`/`useProfileDetailScreen.ts`: `onSaved()` called regardless of mutation success → lost edits on failure. Gate on `result.ok`, Alert on failure.
- [MED] `planning.mutations.ts:177`: hand-built schedule key misses `{from,to}` → swap/change won't refresh schedule. Use `planningQueryKeys` factory.
- [MED] `ProfileDetailEmployerContent.tsx`: join-employer success shown even on failure → gate on `result.ok`.
- [MED] Swap/Change screens render raw API time strings → `formatTimeValue`.
- [LOW] Extract duplicated `ShiftPickerRow`; profile a11y (avatar label, decorative chevrons); notification labels i18n + device row via Platform (not "This iPhone").

## D. Home  (src/features/home)
- [HIGH] `useHomeScreen.ts:48`: `shifts.slice(1,7)` drops the soonest shift (feeds list + policy nextShift). Change to `slice(0,6)`.
- [MED] 60s greeting interval re-renders whole screen → recompute on mount + AppState 'active'.
- [LOW] Greeting + homeSummary strings → i18n.

## E. Core / ui / utils / schedule.utils  (src/core, src/ui, src/utils[!formatDate], features/schedule/schedule.utils.ts)
- [HIGH] `core/date.ts` formatFullDate/formatShortDate/formatMonthLabel parse UTC midnight → off-by-one (verified NY: "June 20" for "2026-06-21"). Route through `resolveLocalDate`.
- [HIGH] `schedule.utils.ts` getWeekdayKey + enumerateDateRange mix UTC/local → use `resolveLocalDate` + `format(...,'yyyy-MM-dd')`.
- [HIGH cleanup] Delete orphaned earnings helpers `formatCurrency`/`formatCompactCurrency` (`core/format.ts` + `utils/formatters.ts` wrappers + `core/format.test.ts` currency tests). Keep `localeToBcp47`.
- [HIGH a11y] `ui/feedback/ErrorDetails.tsx` renders raw error + componentStack to end user in prod → gate behind `__DEV__`.
- [MED] date-fns root imports → subpath (`date-fns/format`) for bundle size.
- [MED a11y] `ui/primitives/TextField.tsx`: forward `accessibilityLabel={label}` to TextInput; fix hardcoded fontSize / allowFontScaling.
- [MED a11y] `SuccessState.tsx`/`ErrorDetails.tsx`: add live-region announce; decorative icons hidden.
- [MED i18n] `utils/formatters.ts` maskIban/maskSensitiveId "Not added" → i18n.
- [LOW] Consolidate `formatDurationFromMinutes` into core `formatDurationLabel`; `app-actions.tsx` danger badge → `tokens.dangerSoft`.

## Out of scope (need product/infra decisions — do NOT auto-merge)
- Multi-employer picker (auth memberships[0] TODO) — feature.
- Social sign-in (Apple/Google buttons are placeholders) — feature flag.
- Production crash reporting provider (crashReporting is a stub) — needs Sentry/Crashlytics keys.
- Full retirement of legacy `src/theme/*` system (3 files still use it) — larger refactor; migrate ErrorDetails/Header/Text to design tokens if time permits.

## Acceptance before PR
`pnpm compile` clean · `pnpm test` all green (incl. de-flaked app-lock test) · `pnpm depcruise:check` clean · lint changed files only · Maestro re-walk (mock mode) of login/home/planning/time/profile + clock-in. Then revert temp `config.dev.ts` (API_URL must stay `http://localhost:5162/api/v1`), commit, PR, merge to main.
