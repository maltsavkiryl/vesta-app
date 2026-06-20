# Phase 4A Review Report

Reviewer: Claude (subagent), branch `feat/mobile-11star-phase4-screens`

---

## Summary

Phase 4A elevated Home, Time, and Profile screens to the premium bar. The implementation is structurally sound. Two defects were found and fixed in commit `759342b`.

---

## Findings

### Fixed in this review

#### 1. JSX indentation — `ProfileCompletenessCard` (`ProfileOverviewSections.tsx`)
`<SurfaceCard>` was not indented inside the wrapping `<Animated.View>`. The closing tags were at the same level as the open tag, making the nesting relationship visually wrong and potentially surprising to diff readers.

**Fix**: re-indented `SurfaceCard` and all its children one level deeper inside `Animated.View`.

#### 2. Remaining hex-alpha — `TimeOverviewActiveCardSections.tsx` line 144
`${tokens.accentForeground}BF` (75% opacity white) on the café icon in the "Start break" button was not cleaned up. Phase 4A correctly removed `${tokens.accentForeground}0D/10/12` from the same file but missed this one.

**Fix**: replaced with `tokens.accentForeground` (matches the adjacent button text colour — same button, same surface, no visual regression).

---

### No-action items (verified clean)

| Area | Verdict |
|------|---------|
| Token consistency — elevation | All cards use `...tokens.elevation1` spread. No raw `shadowColor/shadowOffset/shadowOpacity/shadowRadius/elevation` in changed files. |
| Token consistency — soft colors | `tokens.accentMuted`, `tokens.warningSoft`, `tokens.dangerSoft`, `tokens.successSoft` used correctly throughout. `getToneSoftColor` helper in `HomeTaskSectionRows` mirrors the `getToneColor` pattern cleanly. |
| HomeCockpitCards hex-alpha | All four `${tokens.accent}10/12/14/18` replaced with `tokens.accentMuted`. Slightly lighter (7-8% vs 6-12%) but semantically correct. |
| Motion — reduce-motion | `useListItemEntrance` and `useCelebratePulse` both guard against `shouldReduceMotion` before running animations. Clock-in pulse and profile-complete pulse are both no-ops under reduced motion. |
| Motion — press scale | `usePressScale` in `UpcomingShiftCard` replaces the crude `pressed ? 0.99 : 1` inline transform. Stagger params (baseDelay:30, step:40) match the planning screen pattern. |
| Signature beats — clock-in | `handleClockIn` fires `triggerPulse()` before delegating to `onClockIn`. Optimistic — correct. |
| Signature beats — profile-complete | `useEffect` fires `triggerPulse()` when `remainingCount === 0`. `triggerPulse` is a stable closure value even without being in deps (effect re-runs on `remainingCount` change, always picks up current `triggerPulse`). Not a bug. |
| i18n keys completeness | All `translate("home:…")`, `translate("time:…")`, `translate("profile:…")` calls resolve to leaf strings in `en.ts`. TypeScript `TxKeyPath` type enforces this at compile time. |
| i18n mock soundness | `resolveKey` in `test/setup.ts` walks the `en.ts` object by `namespace + dot-path`, applies `{{var}}` interpolation, and falls back to the raw key. This is a correct upgrade from the previous mock that returned raw keys verbatim. Tests now assert on real English copy, not key strings — stronger, not weaker. |
| Planning tests | All 14 assertion changes in `planning.test.tsx` updated from key-string patterns to real English strings. The assertions are equivalent in intent and now catch regressions in actual copy. |
| Behavior — data/logic unchanged | Clock-in/out delegation, profile row navigation, home card navigation, earnings calculation — none of these were touched. Only presentation layer (tokens, motion wrappers, translate calls). |
| Pre-existing hex-alpha (out of scope) | `TimeOverviewShared.tsx` `CollapseToggle` still uses `${tokens.accentForeground}12` (bg) and `${tokens.accentForeground}D6` (chevron icon). These are inside the time hero card dark overlay context and were not introduced by phase 4A. Left for a future pass. `ProfileEmployerShared.tsx` and `ProfileEmployerListings.tsx` still have raw shadow props — also pre-existing. |
| a11y | `CollapseToggle` has `accessibilityLabel` (expand/collapse). Notification button in `HomeHeader` inherits accessible label. Upcoming shift cards are `Pressable` (implicit `button` role). `EarningsSummaryCard` payslip `Pressable` has explicit `accessibilityRole="button"` and `accessibilityLabel`. No ≥44pt target violations observed in the changed files. Decorative icons paired with labels throughout. |

---

## Consistency with planning screens

| Pattern | Planning screens | Home/Time/Profile (phase 4A) |
|---------|-----------------|-------------------------------|
| Entrance stagger | `useListItemEntrance(index, ...)` | Same — shift cards + time entry rows |
| Press feedback | `usePressScale` | Same — shift cards |
| Celebration pulse | `useCelebratePulse` | Same — clock-in button + profile card |
| Shadow | `...tokens.elevation1` spread | Same |
| Soft-color backgrounds | `tokens.accentMuted`, `*Soft` | Same |
| i18n | `translate(key, params)` | Same |

The pattern parity is complete. No one-off divergences remain after the two fixes above.

---

## Compile + Test

```
TypeScript: 0 errors (pnpm tsc --noEmit)
Test Suites: 60 passed, 60 total
Tests:       274 passed, 274 total
Time:        ~3.1 s
```

---

## Fix commit

`759342b` — `fix(phase4a): JSX indentation in ProfileCompletenessCard and last hex-alpha in ActiveCardActions`
