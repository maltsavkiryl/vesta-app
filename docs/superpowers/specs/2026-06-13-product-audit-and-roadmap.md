# Vesta Mobile — Critical Product Audit & Roadmap to 20/10

**Date:** 2026-06-13
**Scope:** Whole employee app, grounded in code (auth/onboarding/profile/employers, home/time, schedule, documents/notifications, design system).
**Method:** Four parallel domain audits by senior product+RN reviewers reading the actual screens.

## Executive verdict

The app is **visually ~8/10 but functionally hollow and not shippable for its market**. The craft is real (Live Activity, haptics, motion, layered architecture, a coherent design system). But the same disqualifying gaps appear in *every* domain: it doesn't speak the language of its users, it can't reach them when it matters, it shows fake/placeholder data, several "trust" features are theater, and it fabricates UI during loading. None of that is fixable by wiring features to the backend alone — it needs a **foundations pass first**, then per-feature product redesign on top of the real API.

The original slice plan (wire Time → Documents → Schedule/Home/Notifications to the backend) is **necessary but not sufficient**. This document reprioritizes.

---

## P0 — Ship-blockers (cross-cutting; flagged by all four audits)

### 1. Localization is non-existent — and Dutch isn't even present
- No `nl` resource file at all. `i18n` ships the Ignite boilerplate set `{ ar, en, es, fr, hi, ja, ko }`; `en.ts`/`fr.ts` are still *"So empty... so sad" / "psst — this probably isn't what your app looks like"*. `fr.ts` is fr-FR, not fr-BE.
- ~3 of ~125 screen files call `translate()`. Every string in auth/profile/schedule/documents/notifications is a hardcoded English literal.
- The Profile language picker offers **"Nederlands"** but selecting it translates nothing (no `nl` loaded) and there's no in-app `changeLanguage`.
- **Why disqualifying:** Belgium is Dutch-majority (Flanders) + French co-official. Hourly workers are the least likely to operate in English. Also missing: nl-BE/fr-BE date & currency/IBAN formatting.
- **Fix:** add real `nl-BE` / `fr-BE` / `en` resources, migrate all literals to keys, add a locale switcher, route all date/number formatting through `date-fns/locale` + `Intl`.

### 2. No push notifications
- `expo-notifications` is not a dependency; no token registration, no handler. Notifications are a **passive in-app inbox only**.
- The seeded events are exactly lock-screen-worthy: shift changed, ID-card needed, availability deadline.
- **Fix:** add `expo-notifications`, register tokens, and route taps through the existing typed `runAction` deep-link layer (already built — half the work is done).

### 3. No loading / skeleton / error / empty-during-load states; no pull-to-refresh (anywhere)
- Query hooks deliberately drop `isLoading`/`isError`/`refetch` and expose only `data`, with `?? 0` / `?? []` / merge-over-`createInitialState()` fallbacks. Result: on a cold/flaky load the user sees **fabricated data** — a green "available, no shifts" calendar, "€0.00" earnings with a trend arrow, mock profile defaults — then a content pop-in. No retry. `RefreshControl` appears nowhere in the repo.
- **Why disqualifying:** the workforce is explicitly on flaky mobile connections; fabricated "you have no shifts / you're available" can make someone miss work.
- **Fix:** surface query states; add skeletons; wire `RefreshControl` into the shared `AppScrollScreen` so every list gets pull-to-refresh.

### 4. Trust theater (security/financial claims the mechanism doesn't honor)
- **Face ID** toggle says "Enabled for app unlock" but `faceIdEnabled` gates nothing — there is no lock screen on launch/resume. Deceptive for an app holding IBAN, national-register number, payslips.
- **Contract signing** = typing your name into a `TextInput`; flips a local flag; no timestamp, no device/audit record, no immutable signed PDF, no receipt. These are legally binding Belgian contracts.
- **Hardcoded €12.02/hr** shown as the pay estimate at clock-out for everyone (real `averageHourlyRate` exists and is ignored). A wrong pay number in a payroll app.
- **Demo credentials prefilled** into the production sign-in form.
- **Dead social-login buttons** (Apple/Google) that animate on press but have no `onPress`.
- **Fix:** implement a real biometric lock gate; real e-signature (drawn signature + signed-at + device record + generated signed PDF + receipt); use real per-employer rate; remove demo prefill (gate behind `__DEV__`); wire or remove social buttons.

### 5. Accessibility is near-zero
- Whole domains have ~2 `accessibilityLabel`s; status conveyed by color/shape only (calendar dots, unread 7px dot); no `accessibilityState`; no dynamic-type support (fixed sizes/lineHeights, no `maxFontSizeMultiplier`); `textMuted` `#AEAEB2` on white ≈ 2:1 (fails WCAG AA) yet used for body-secondary copy.
- **Fix:** roles/labels/state on all custom pressables; per-calendar-cell descriptive labels; allow font scaling with min/max; raise muted-text contrast to ≥4.5:1.

### 6. Timezone & locale correctness bugs
- "Today" is computed as `new Date().toISOString().slice(0,10)` (**UTC**) in 5+ schedule places. Belgium is UTC+1/+2, so after ~22:00–24:00 local — exactly when hospitality shifts end — "today" highlight, default selected date, and "upcoming ≥ today" all point at the wrong day.
- Calendar week **starts Sunday** (US) and is internally inconsistent with the Monday-first availability model.
- **Fix:** one `getLocalToday()` via `date-fns format`; Monday-first grid + EU labels.

---

## P1 — Per-domain critical product gaps

### Home + Time clock (the core daily surface)
- **Earnings is decorative and partly dishonest:** card gets only `earnedAmount`+`monthLabel` (mock €0) yet `targetAmount`, `hoursWorked`, `shiftsWorked`, `averageHourlyRate` all exist and are dropped; a trend arrow renders with no trend data; the card is dead-last.
- **Clock-in is slow & modal-heavy:** up to 4 sequential blocking dialogs (location → employer picker → unconditional "add a selfie?" → camera), frozen button during GPS, no optimistic UI. Selfie is forced for everyone (no per-employer `proofRequired`).
- **Timer vs paid mismatch:** hero timer shows wall-clock incl. breaks; clock-out pays elapsed-minus-breaks → visible discrepancy.
- **Urgent items hidden:** home suppresses the tasks/updates sections unless there are **2+** items, so a single "Upload your ID card — required before payroll" is hidden. Backwards.
- **No offline support / mutation queue** for on-the-move workers; failed clock-in is simply lost behind an Alert.
- **End-of-shift moment wasted:** a 900ms auto-redirect instead of a celebratory summary.

### Schedule
- **Not glanceable:** it's a month dot-grid with no "next shift" hero, no agenda/week view; "do I work Thursday?" means decoding a 4px dot. The only upcoming-shift logic lives in Home, not Schedule.
- **Submit-availability (deadline-critical) is buried** inside an OS `Alert` behind an unlabeled gear; the planning-window **deadline is never shown**; the coverage metric is dead/always-true.
- **Can't decline a shift** — "action needed" offers only "Acknowledge"; model has no `declined`.
- **`dayLabel` is a baked static string** ("Today"/"Mon") driving logic and display → wrong relative dates the day after seeding.

### Documents + Notifications
- **Documents have no home in the IA:** buried two levels under Profile, split into 3 screens with 3 separate query/search states; **search is dead code** in the only place documents render. Payslips bypass the data layer (hardcoded array).
- **Notifications:** no push (see P0); fake `relativeTime` strings drive grouping via substring matching; rows not accessible.

### Design system
- Competent and cohesive but **no brand identity** — accent is literally iOS system blue, Apple's exact semantic palette, system font, near-black splash → reads as an iOS Settings clone. Features bypass the soft-color tokens with hand-mixed alpha hex (an unread tint that's invisible on dark). Three parallel type systems; uppercase eyebrows with zero letter-spacing. Lists (documents/notifications) are static while home/time animate.

---

## The 20/10 vision (what "next-level enjoyment" looks like here)

Highest-impact, concrete, mostly building on data/infra that already exists:
1. **Live earnings ticker** while clocked in (on the card + Live Activity) — the per-second tick and rate already exist. *Highest impact, low effort.*
2. **Honest, motivating earnings card** — progress ring to target, hours/shifts, real trend.
3. **Agenda-first Schedule** — "Next shift in 4h · Bistro Noir" hero, week/month toggle, jump-to-today.
4. **Interactive widget + lock-screen one-tap clock-in/out** (App Intents) and **smart geofence auto-detect** (the geofence math is already written).
5. **Frictionless clock-in** — optimistic, background photo, conditional selfie, location spinner.
6. **Employer-branded join** — logo/brand color, "managed by {manager}", what-happens-next — turn the coldest moment into a warm welcome.
7. **Magic-link + passkeys**, progressive/contextual profile completion ("add your IBAN — your first payslip is being prepared").
8. **Trustworthy signing + document expiry reminders** (ID/work-permit).
9. **Shift swap marketplace** with colleague selection and accept/decline.
10. **A real Vesta brand** — distinctive accent, secondary typeface, a signature motion language.

---

## Quick wins (≤1 day each — high value-to-effort)
- Flip home tasks/updates threshold to `>= 1` and sort by urgency (one line).
- Remove hardcoded €12.02; use `earnings.averageHourlyRate`.
- Pass `targetAmount`/`hoursWorked` into the earnings card; drop or data-back the trend arrow.
- Fix the UTC "today" bug with one `getLocalToday()` helper; Monday-first calendar.
- Remove demo-credential prefill (gate behind `__DEV__`).
- Wire or disable the dead Apple/Google buttons (+ a11y labels).
- Surface onboarding `complete()` failure instead of a silent error haptic; fix/remove "Skip for now."
- Disable+spinner async CTAs while pending (sign-in/register/save are double-tappable today).
- Add `accessibilityLabel`/`Role`/`State` to notification + calendar rows.
- Replace dev copy "Rebuild the development app to enable document uploads" with real user copy.
- Add `nl` to i18n (even stubbed) or remove "Nederlands" so it isn't a silent no-op.
- Swap hand-mixed alpha hex for the existing soft tokens (fixes invisible dark-mode unread tint).

---

## How this reshapes the roadmap

The backend integration program (Slice 0 done; Slices 1–3 = wire Time/Documents/Schedule-Home-Notifications) stays, but a **Foundations slice (Slice F)** comes first, and each feature slice now means *redesign + wire*, not just wire.

- **Slice 0 — Auth foundation. ✅ DONE** (this session): real employee auth + profile over HTTP; backend clean build.
- **Slice F — Foundations (NEW, do next).** P0 cross-cutting: i18n + nl-BE/fr-BE; loading/skeleton/error states + pull-to-refresh in `AppScrollScreen`; accessibility baseline (labels, dynamic type, contrast); timezone/Monday-first fixes; remove trust-theater (real biometric lock, real rate, kill demo prefill, wire/disable social). Plus push-notification plumbing.
- **Slice 1 — Time & Home (redesign + wire).** Real time-clock endpoints; frictionless optimistic clock-in; honest earnings + live ticker; fix timer/paid mismatch; urgent-task surfacing; offline mutation queue; end-of-shift celebration.
- **Slice 2 — Documents (redesign + wire).** Promote to first-class destination, unified searchable list; payslips through the data layer; trustworthy e-signature; expiry reminders.
- **Slice 3 — Schedule + Notifications (redesign + wire).** Agenda-first schedule + next-shift hero; planning-window cockpit with deadline; decline/swap; real push notifications routed through deep-links.
- **Continuous — Brand & design-system** identity pass (accent, typography, motion) + close out REFACTOR_AUDIT P1–P15.

### Note on REFACTOR_AUDIT.md
Honest and real, but ~90% internal code hygiene — it's **silent on every product gap above** (localization, a11y, push, loading states, e-signature, brand). Necessary, not sufficient. Track the product gaps separately (this doc).
