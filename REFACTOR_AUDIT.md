# Vesta Mobile Refactor Audit

## Purpose

This document captures the remaining codebase cleanup and refactor work after the first shared-UI consolidation pass.

It is focused on:

- UI uniformity
- shared component reuse
- styling consistency
- theme/token boundaries
- navigation/platform separation
- long-term maintainability

Current baseline at the time of writing:

- `pnpm compile` passes
- `pnpm lint:check` passes
- the first shared `src/ui` consolidation slice is already in place

What remains is mostly structural cleanup, wider feature migration, and removal of temporary escape hatches.

## What Has Already Been Improved

- `src/ui/composites/AppPrimitives.tsx` now owns more shared UI primitives
- `SearchField`, `ActionRow`, `MetaPill`, and `ProgressBar` exist and are exported through `@/ui`
- several repeated surfaces have already been migrated:
  - documents header
  - schedule actions
  - shift detail actions
  - profile progress
  - sign-in button/social button styling
- direct `@/theme/*` imports are now guarded in feature/app/navigation code through ESLint
- iOS-native tabs have been split into `src/app/(app)/(tabs)/_layout.ios.tsx`

## Priority 1: Finish The Theme Boundary Cleanup

### Problem

The codebase still has two styling systems in parallel:

- legacy `src/theme/*`
- newer `src/ui/foundations/*` and `src/ui/composites/*`

That split is still the biggest architectural source of drift.

### Remaining work

- keep `src/theme/context.tsx` only as provider/runtime infrastructure
- move remaining feature-level theme access toward `@/ui` abstractions
- reduce direct `useAppTheme()` usage in feature screens where it is only used for colors/backgrounds
- prefer `useDesignTokens()` and shared primitives over raw `theme.colors.*`

### Files still worth revisiting

- `src/features/documents/ContractDetailScreen.tsx`
- `src/features/schedule/AvailabilityScreen.tsx`
- `src/features/schedule/AvailabilityTemplateScreen.tsx`
- `src/features/schedule/AvailabilityTimePickerScreen.tsx`
- `src/features/profile/ProfileScreen.tsx`
- `src/features/profile/useProfileDetailScreen.ts`
- `src/app/(auth)/_layout.tsx`
- `src/app/(app)/_layout.tsx`

### UI internals that still bridge the old theme layer

- `src/ui/primitives/Text.tsx`
- `src/ui/primitives/Icon.tsx`
- `src/ui/primitives/Screen.tsx`
- `src/ui/navigation/Header.tsx`
- `src/ui/feedback/ErrorDetails.tsx`

### Refactor goal

The target state is:

- feature/app code consumes `@/ui`
- token-to-style translation lives inside `src/ui`
- legacy `theme` types/helpers stop leaking into feature code

## Priority 2: Remove Temporary `no-inline-styles` Escape Hatches

### Problem

A number of large screens still rely on file-level `react-native/no-inline-styles` disables. Some of them are acceptable temporarily because the screens are still mid-migration, but they should not remain long term.

### Current files still carrying file-level disable directives

- `src/features/notifications/NotificationsScreen.tsx`
- `src/features/time/ClockOutScreen.tsx`
- `src/features/time/TimeEntryDetailScreen.tsx`
- `src/features/schedule/ShiftDetailScreen.tsx`
- `src/features/schedule/AvailabilityTemplateScreen.tsx`
- `src/features/schedule/AvailabilityScreen.tsx`
- `src/features/schedule/RequestScreen.tsx`
- `src/features/auth/AuthScaffold.tsx`
- `src/features/auth/ForgotPasswordScreen.tsx`
- `src/features/auth/OnboardingScreen.tsx`
- `src/features/profile/sections/ProfileEmployerJoinPanels.tsx`
- `src/features/profile/sections/ProfileEmployerJoinShared.tsx`
- `src/features/home/components/NextShiftHeroCard.tsx`
- `src/features/home/components/EarningsSummaryCard.tsx`
- `src/ui/composites/AppPrimitives.tsx`

### Refactor goal

Each of those files should end up in one of two buckets:

- inline styles replaced by shared style helpers, style constants, or shared primitives
- the file is intentionally part of the shared UI layer and keeps narrowly justified inline token-driven styles

### Recommended migration order

1. `ClockOutScreen.tsx`
2. `TimeEntryDetailScreen.tsx`
3. `AvailabilityScreen.tsx`
4. `RequestScreen.tsx`
5. `ForgotPasswordScreen.tsx`
6. `OnboardingScreen.tsx`
7. `NotificationsScreen.tsx`
8. profile employer-join screens
9. remaining home hero/stat cards

## Priority 3: Convert Repeated Feature Patterns Into Shared UI

### Problem

Several screens still rebuild the same visual concepts locally:

- hero status blocks
- icon chips and metadata pills
- grouped empty states
- summary rows
- CTA rows
- success states
- tile selections

### Shared primitives that likely still need to be added or expanded

- `SummaryRow`
- `InfoPill` or a generalized richer `MetaPill`
- `HeroStat`
- `SuccessState`
- `SectionEmptyState`
- `SplitMetricRow`
- `CardActionButtonGroup`
- `ScreenIntro`

### Good current candidates for extraction

- `src/features/time/ClockOutScreen.tsx`
- `src/features/time/TimeEntryDetailScreen.tsx`
- `src/features/time/components/TimeOverview.tsx`
- `src/features/documents/components/DocumentList.tsx`
- `src/features/notifications/NotificationsScreen.tsx`
- `src/features/auth/AuthScaffold.tsx`
- `src/features/auth/OnboardingScreen.tsx`
- `src/features/profile/sections/ProfileEmployerJoinPanels.tsx`

### Refactor rule

Do not extract single-use abstractions just to reduce line count.

Only extract when:

- the shape already appears in multiple screens
- the primitive has a clear semantic role
- the primitive can own its own tokens, spacing, and interaction behavior

## Priority 4: Normalize Typography

### Problem

Typography is still inconsistent across major screens. Some screens use shared `Text` presets or `appTypography`, while others embed one-off `fontSize` and `lineHeight` overrides directly in JSX.

### Hotspots

- `src/features/auth/OnboardingScreen.tsx`
- `src/features/auth/AuthScaffold.tsx`
- `src/features/time/ClockOutScreen.tsx`
- `src/features/time/TimeEntryDetailScreen.tsx`
- `src/features/time/components/TimeOverview.tsx`
- `src/features/auth/RegisterScreen.tsx`
- `src/features/documents/ContractDetailScreen.tsx`

### Refactor goal

- define the remaining missing app typography presets in `src/ui/foundations/layout.ts`
- stop scattering title/hero sizes inline
- standardize:
  - page titles
  - hero values
  - caps/eyebrow labels
  - row titles
  - muted metadata
  - centered success-state copy

### Desired end state

Feature files should mostly choose from:

- `Text` presets
- `appTypography`
- narrowly scoped local style constants

They should not frequently redefine font scales ad hoc.

## Priority 5: Normalize Spacing, Radius, And Card Construction

### Problem

The app visually trends in the right direction, but many screens still define their own versions of:

- card padding
- grouped section spacing
- border radii
- icon chip sizes
- row heights

### Remaining hotspots

- `src/features/notifications/NotificationsScreen.tsx`
- `src/features/time/components/TimeOverview.tsx`
- `src/features/time/components/TimeHeroCard.tsx`
- `src/features/documents/components/DocumentList.tsx`
- `src/features/documents/ContractDetailScreen.tsx`
- `src/features/documents/PayslipDetailScreen.tsx`
- `src/features/auth/AuthScaffold.tsx`
- `src/features/auth/RegisterScreen.tsx`
- `src/features/auth/OnboardingScreen.tsx`

### Refactor goal

- expand `appLayout` where necessary
- keep shared card shells inside `SurfaceCard`, `ListCard`, `GroupedSection`, and related primitives
- reduce feature-local radius/padding tuning unless a surface is intentionally unique

### Specific consistency targets

- standard card radii
- standard icon-button radii
- standard pill radii and padding
- standard screen padding values
- standard grouped section vertical rhythm

## Priority 6: Refactor The Largest Screens Into Smaller Units

### Problem

Some files are still too large and mix rendering, styling, state logic, and micro-components in one place.

### Largest current maintenance risks

- `src/features/auth/OnboardingScreen.tsx`
- `src/features/time/components/TimeOverview.tsx`
- `src/features/time/TimeEntryDetailScreen.tsx`
- `src/features/schedule/RequestScreen.tsx`
- `src/features/notifications/NotificationsScreen.tsx`
- `src/features/documents/components/DocumentList.tsx`

### Refactor goal

Split these screens into:

- local presentation subcomponents
- local pure helpers
- reusable shared primitives only where repetition is real

### Important constraint

Prefer module-local decomposition before promoting something into `src/ui`.

Not every repeated block is a global primitive.

## Priority 7: Clean Up Auth Surface Consistency

### Problem

The auth area still has the highest concentration of one-off styling and color/typography overrides.

### Key files

- `src/features/auth/AuthScaffold.tsx`
- `src/features/auth/SignInScreen.tsx`
- `src/features/auth/RegisterScreen.tsx`
- `src/features/auth/ForgotPasswordScreen.tsx`
- `src/features/auth/OnboardingScreen.tsx`

### Refactor goals

- define a clearer shared auth shell API
- stop mixing literal dark-surface styling with token-driven surfaces
- standardize:
  - title sizes
  - auth card shell
  - text button pattern
  - social button pattern
  - success states
  - field spacing

### Recommended target

Auth should feel like one subsystem with a shared layout language, not a collection of individually styled screens.

## Priority 8: Clean Up Time Module Consistency

### Problem

The time module is visually strong but still relies heavily on bespoke styling.

### Key files

- `src/features/time/components/TimeOverview.tsx`
- `src/features/time/components/TimeHeroCard.tsx`
- `src/features/time/ClockOutScreen.tsx`
- `src/features/time/TimeEntryDetailScreen.tsx`
- `src/features/time/components/TimeEntriesList.tsx`

### Refactor goals

- unify hero treatment between time overview and detail screens
- extract repeated summary row and stat row patterns
- normalize success-state treatment
- reduce bespoke accent-foreground alpha strings sprinkled through the feature

### Specific issues

- multiple custom hero metadata pills
- repeated centered success blocks
- repeated manual section row layouts
- dense inline token interpolation

## Priority 9: Clean Up Documents Module Consistency

### Problem

Documents now uses some shared primitives, but detail screens and list cards still define too many one-off action/button/card variants.

### Key files

- `src/features/documents/components/DocumentList.tsx`
- `src/features/documents/ContractDetailScreen.tsx`
- `src/features/documents/PayslipDetailScreen.tsx`

### Refactor goals

- standardize document row/list treatment
- standardize contract action buttons
- standardize details-page sheet spacing and content shells
- reduce feature-local button and badge implementations

## Priority 10: Clean Up Schedule Module Consistency

### Problem

Schedule has improved significantly, but availability/template/request screens still have local style duplication and a mixed use of shared versus local patterns.

### Key files

- `src/features/schedule/AvailabilityScreen.tsx`
- `src/features/schedule/AvailabilityTemplateScreen.tsx`
- `src/features/schedule/RequestScreen.tsx`
- `src/features/schedule/ShiftDetailScreen.tsx`
- `src/features/schedule/PlanningMonthCalendar.tsx`

### Refactor goals

- unify status row treatment
- unify template/date selection rows
- standardize sheet/picker/subform shell behavior
- normalize action rows and summary cards

## Priority 11: Clean Up Notifications And Home Detail Surfaces

### Problem

Home and notifications still contain several custom list-row and badge variants that should either be promoted into shared UI or aligned more tightly with existing shared components.

### Key files

- `src/features/notifications/NotificationsScreen.tsx`
- `src/features/home/components/HomeHeader.tsx`
- `src/features/home/components/HomeTaskSections.tsx`
- `src/features/home/components/UpcomingShiftsSection.tsx`
- `src/features/home/components/NextShiftHeroCard.tsx`
- `src/features/home/components/EarningsSummaryCard.tsx`

### Refactor goals

- align list/update/task row patterns with shared rows
- normalize notification badges and CTA chips
- reduce one-off card borders, shadows, and pill patterns

## Priority 12: Reduce Color Literal And Alpha-String Drift

### Problem

The codebase still contains many direct color constructions in feature files:

- hardcoded hex values
- manual alpha strings such as `${tokens.accent}10`
- custom rgba strings repeated locally

### Examples

- `src/features/notifications/NotificationsScreen.tsx`
- `src/features/time/components/TimeOverview.tsx`
- `src/features/auth/AuthScaffold.tsx`
- `src/features/auth/OnboardingScreen.tsx`
- `src/features/home/components/NextShiftHeroCard.tsx`

### Refactor goal

Move repeated color treatments into:

- `useDesignTokens()`
- `getTonePalette(...)`
- shared primitive internal mappings

### Desired outcome

Feature files should describe semantic tone and state, not handcraft alpha variants repeatedly.

## Priority 13: Review Platform And Navigation Boundaries

### What was fixed

- native tabs are now in `src/app/(app)/(tabs)/_layout.ios.tsx`

### Remaining review points

- confirm generic `_layout.tsx` tab fallback is acceptable on non-iOS
- review `src/navigation/native-sheet.tsx` for further token cleanup
- review whether header/button/icon behavior should move deeper into `src/ui/navigation`

## Priority 14: Tighten The Shared UI Public API

### Problem

The shared layer is improving, but the exported public vocabulary is still broader and looser than ideal.

### Current issues

- aliases like `Button`, `Card`, `Badge`, `Label`, `ListItem`, and `ListSection` still exist
- some feature code still imports deep UI subpaths instead of only `@/ui`
- naming is not yet fully canonical

### Refactor goals

- choose one canonical export name per concept
- keep compatibility aliases only temporarily
- prefer `@/ui` imports in feature code
- document what belongs in:
  - `primitives`
  - `composites`
  - `navigation`
  - `foundations`

## Priority 15: Add Structural Guidance For Future Contributors

### Missing artifact

The repo now needs a short contributor-facing guideline for UI refactors and new screens.

### Recommended additions

- when to use `SurfaceCard` versus `ListCard` versus `GroupedSection`
- when to add a shared primitive
- when to keep a pattern feature-local
- when `no-inline-styles` is acceptable
- how to choose between `useDesignTokens()` and a shared primitive
- how to avoid importing `@/theme/*` directly

## Recommended Execution Order

### Phase 1: Finish shared layer stabilization

- finalize `src/ui` token/theme boundaries
- add any missing shared primitives for obvious repeated shapes
- document canonical usage

### Phase 2: Clean the biggest visual subsystems

- auth
- time
- schedule
- documents

### Phase 3: Clean supporting surfaces

- notifications
- home detail components
- profile employer join flows

### Phase 4: Remove remaining escape hatches

- remove file-level `no-inline-styles`
- reduce remaining `no-color-literals`
- tighten lint rules further if needed

## Definition Of Done

The refactor effort should be considered complete when all of the following are true:

- feature/app code does not directly import `@/theme/*`
- the majority of UI surfaces are built from shared `@/ui` primitives/composites
- large feature files are decomposed into smaller local presentation units where needed
- typography, spacing, and radius systems are consistent across modules
- file-level `no-inline-styles` suppressions are either gone or restricted to justified shared-layer internals
- repeated color/tone treatments are centralized
- navigation/platform-specific behavior lives in platform-appropriate files
- lint rules enforce the intended boundaries instead of merely documenting them

## Immediate Next Targets

If continuing this refactor now, the most valuable next files are:

1. `src/features/time/components/TimeOverview.tsx`
2. `src/features/time/ClockOutScreen.tsx`
3. `src/features/time/TimeEntryDetailScreen.tsx`
4. `src/features/auth/AuthScaffold.tsx`
5. `src/features/auth/OnboardingScreen.tsx`
6. `src/features/documents/components/DocumentList.tsx`
7. `src/features/schedule/AvailabilityScreen.tsx`
8. `src/features/notifications/NotificationsScreen.tsx`
