# Phase 2A Implementation Report — Planning screens re-skin

## Commits (7 total, `01beff5..8fbef79`)

| Hash | Subject |
|------|---------|
| `01beff5` | feat(planning): wire ToastProvider + claimSuccess i18n |
| `5eca575` | feat(planning/hub): premium hub screen |
| `6a48bd3` | feat(planning/shifts): stagger entrance + skeleton + today emphasis |
| `b742850` | feat(planning/todos): check-off signature moment |
| `4cba78f` | feat(planning/calls): claim signature moment |
| `cf111bf` | feat(planning/shift-detail): elevation1 hero + refinements |
| `8fbef79` | test(planning): useToast mock + signature moment coverage |

---

## Per-screen changes

### 1. PlanningHubScreen (`src/features/planning/PlanningHubScreen.tsx`)

**What changed:**
- Title row and segmented control each wrapped in `MotionView` with staggered delays (0ms / 60ms) — smooth entrance on first render.
- Availability button upgraded from `backgroundMuted` → `accentMuted` background + `accent`-colored icon (more prominent, visually coherent).
- All tab panes rendered simultaneously with `display: flex/none` toggle instead of conditional mounting — tabs switch instantly with no re-mount or refetch jitter.

**Reusable components used:** `MotionView` (existing), `AppSegmentedControl`, `Text`.

---

### 2. My Schedule (`PlanningShiftsScreen` + `PlanningShiftsSections`)

**What changed:**

*Skeleton states:*
- `PlanningShiftCardSkeleton`: full card outline with three `Skeleton` shimmer rows (date, time, venue chip)
- `PlanningAgendaSectionSkeleton`: two sections with section labels + cards shown on first load (replaces blank flash)
- `PlanningShiftsScreen`: `isLoading && shifts.length === 0` → skeleton; else data or empty state

*Shift cards (`PlanningShiftCard`):*
- Per-card `useListItemEntrance(index, { baseDelay: 40 })` stagger entrance (spring opacity + translateY)
- `usePressScale({ pressedScale: 0.975 })` for native press-scale feel on card tap
- **Today emphasis**: `isToday` detection → `elevationLevel={1}` SurfaceCard + `accent`-colored border ring
- Venue + role rendered as `accentMuted`/`backgroundMuted` rounded chips instead of plain text
- Note preview row with document icon when `shift.note` exists
- Chevron retained at top-right for navigation affordance

**Reusable components extracted:**
- `PlanningShiftCardSkeleton` — exported, reusable
- `PlanningAgendaSectionSkeleton` — exported, reusable

---

### 3. Shift Detail (`src/features/schedule/ShiftDetailSections.tsx`)

**What changed:**
- `ShiftDetailHero`: `elevationLevel={1}` on SurfaceCard → lifted hero card
- Map chip: `backgroundMuted → accentMuted` bg + `accent` icon/text (clearer action affordance)
- `ShiftChangeSummaryCallout`: `${tokens.warning}10` → `tokens.warningSoft` (token-based)
- `ShiftManagerNoteSection`: added `chatbubble-ellipses-outline` icon inline with note text
- `ShiftPlanRow` label: `textSecondary → textMuted` — clearer label/value contrast hierarchy
- `planRow` minHeight reduced (68 → 60) + paddingVertical tightened (18 → 14) for denser, more native feel

---

### 4. Today's Tasks (`PlanningTodosScreen` + `PlanningTodosSections`)

**What changed:**

*Skeleton:*
- `PlanningTodosSkeleton`: three checkbox + text rows shown while `isLoading && todos.length === 0`

*Task check-off SIGNATURE MOMENT:*
- `PlanningTodoItem` calls `fireHaptic('success')` + `triggerPulse()` (from `useCelebratePulse`) on every check-off
- Uncomplete fires `fireHaptic('selection')` only (softer feedback)
- Pulse = `scale 1 → 1.06 → 1` via `SPRING_SNAPPY`; no-op when `shouldReduceMotion`
- Each item animated in with `useListItemEntrance(index, { baseDelay: 20, step: 36 })` stagger

*Brief card:*
- `PlanningTodosBrief`: `shirt-outline` icon for dress note + `information-circle-outline` for note — visual hierarchy improvement over plain text block

**Reusable components extracted:**
- `PlanningTodosSkeleton` — exported

---

### 5. Open Calls (`PlanningCallsScreen` + `PlanningCallsSections`)

**What changed:**

*Skeleton:*
- `PlanningCallCardSkeleton`: full card skeleton with header + note + CTA button placeholders
- `PlanningCallsListSkeleton`: two skeletons with stagger entrance
- `PlanningCallsScreen`: shown while `isLoading && calls.length === 0`

*Claim SIGNATURE MOMENT:*
- `PlanningCallCard.handleClaim`: fires `fireHaptic('success')` + `triggerPulse()` optimistically (before API round-trip) — immediate tactile feedback
- Entire card is wrapped in `Animated.View` with `useCelebratePulse` style — whole card scale-pulses on claim
- `PlanningCallsScreen`: `useEffect` watches `claimStates` for first `idle → claimed` transition → `showSuccess(translate('planning:calls.claimSuccess'))` toast
- Claimed state: `successSoft` bg badge (was inline hex alpha); `borderColor: success+22` tint on card
- `CallModeBadge`: compact `accentMuted` pill vs raw UPPERCASE text
- Error row: `borderWidth: 1` + `dangerSoft` bg (was inline hex alpha)
- `AppButton`: `isLoading={isClaiming}` prop wires loading spinner state

**Reusable components extracted:**
- `PlanningCallCardSkeleton` — exported
- `PlanningCallsListSkeleton` — exported
- `CallModeBadge` — internal helper

---

## New i18n keys

| Key | en | nl | fr |
|-----|----|----|-----|
| `planning:calls.claimSuccess` | "Shift claimed! You're all set." | "Shift geclaimd! Je bent klaar." | "Service pris ! Vous êtes prêt." |

---

## Foundation (Phase 1) usage

| Primitive | Where |
|-----------|-------|
| `useListItemEntrance` | Every shift card, todo item, call card |
| `useCelebratePulse` | Todo check-off + call claim |
| `usePressScale` | Shift card press |
| `SurfaceCard elevationLevel` | Shift cards (today=1), call cards (unclaimed=1), shift detail hero (1) |
| `Skeleton` | All three skeleton components |
| `useToast` / `ToastProvider` | Root layout + PlanningCallsScreen |
| `MotionView` | PlanningHubScreen header |
| `fireHaptic` | Todo check-off (success/selection) + call claim (success) |

---

## Compile + test

```
TypeScript: 0 errors (pnpm compile → tsc --noEmit)
Tests: 59 suites, 265 tests, 0 failures
  (263 original + 2 new signature-moment tests)
```

---

## Self-review

**What's solid:**
- Skeleton → data transition uses existing `isLoading && data.length === 0` guard; no new loading state needed.
- Signature moments fire optimistically (before network) for instant responsiveness.
- All tokens used throughout; no hardcoded hex colors, spacing, or shadow values.
- `useToast` correctly kept out of `PlanningCallCard` (no context requirement in card); toast is called at screen level via `useEffect` watching state.
- Test mock for `@/ui/feedback` is minimal — only stubs `useToast`, other feedback exports still use `requireActual`.

**Concerns / deferred:**
- `display: flex/none` tab-keep-alive in `PlanningHubScreen` means all five sub-screens mount on first render. Memory cost is low (no heavy computations; queries are lazy). If the tab count grows or screens become heavier, switch to `visibility` or a proper stack navigator.
- `usePressScale` is not re-exported via `@/ui/composites/index.ts` — imported directly from `@/ui/composites/app-motion`. Could add re-export in a follow-up.
- `fireHaptic('success')` for claim fires before the API response. If the mutation returns an error, the user has already felt the "success" haptic. This is the optimistic UX trade-off; the error state then appears inline. Could be deferred to post-result if the product team prefers.
- ShiftDetailSections hardcoded English strings ("Back to Planning", "Open in Maps", "Action needed", etc.) were pre-existing and not in scope for Phase 2A i18n — left as-is to match prior phase.
