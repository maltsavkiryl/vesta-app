# Codebase Improvement Report

- Scope: `vesta-mobile`
- Findings: `45`
- Work packets: `4`
- Worktree: `26` changed paths

## Worktree Guardrail

- Tracked changes: `14`
- Untracked paths: `12`
- Do not start broad sweeps in already-touched areas without isolating the work first.

## Start Here

- Screen decomposition: `5` findings. Start in `src/features/schedule/RequestScreen.tsx`, `src/features/schedule/ScheduleScreen.tsx`, `src/features/schedule/ShiftDetailScreen.tsx`.
- Hook decomposition: `3` findings. Start in `src/features/profile/useProfileDetailScreen.ts`, `src/features/schedule/useAvailabilityScreen.ts`, `src/features/time/useTimeCardController.ts`.
- Component decomposition: `3` findings. Start in `src/features/documents/components/DocumentList.tsx`, `src/features/home/components/HomeTaskSections.tsx`, `src/features/time/components/TimeOverviewActiveCard.tsx`.

## Screen decomposition

- `src/features/schedule/RequestScreen.tsx` -> `split_into_shell_hook_components`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Screen file is 386 lines; prefer a shell plus hooks/components split.
- `src/features/schedule/ScheduleScreen.tsx` -> `split_into_shell_hook_components`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Screen file is 611 lines; prefer a shell plus hooks/components split.
- `src/features/schedule/ShiftDetailScreen.tsx` -> `split_into_shell_hook_components`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Screen file is 293 lines; prefer a shell plus hooks/components split.
- `src/features/time/ClockOutScreen.tsx` -> `split_into_shell_hook_components`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Screen file is 257 lines; prefer a shell plus hooks/components split.
- `src/features/time/TimeEntryDetailScreen.tsx` -> `split_into_shell_hook_components`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Screen file is 355 lines; prefer a shell plus hooks/components split.

## Hook decomposition

- `src/features/profile/useProfileDetailScreen.ts` -> `split_hook_by_domain_or_responsibility`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Hook file is 218 lines; split by responsibility before it becomes a new hotspot.
- `src/features/schedule/useAvailabilityScreen.ts` -> `split_hook_by_domain_or_responsibility`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Hook file is 216 lines; split by responsibility before it becomes a new hotspot.
- `src/features/time/useTimeCardController.ts` -> `split_hook_by_domain_or_responsibility`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Hook file is 232 lines; split by responsibility before it becomes a new hotspot.

## Component decomposition

- `src/features/documents/components/DocumentList.tsx` -> `split_component_and_extract_helpers`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Component file is 284 lines; review whether it now mixes layout, state, and helpers.
- `src/features/home/components/HomeTaskSections.tsx` -> `split_component_and_extract_helpers`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Component file is 329 lines; review whether it now mixes layout, state, and helpers.
- `src/features/time/components/TimeOverviewActiveCard.tsx` -> `split_component_and_extract_helpers`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Component file is 223 lines; review whether it now mixes layout, state, and helpers.

## Manual product and native review

- `app.config.ts` -> `manual_review_against_rule`
  Rule: `debug-separate-machine-tooling-from-repo-bugs`
  Summary: Historical hotspot for rule `debug-separate-machine-tooling-from-repo-bugs`. Review this surface against the accepted preference.
- `eas.json` -> `manual_review_against_rule`
  Rule: `debug-separate-machine-tooling-from-repo-bugs`
  Summary: Historical hotspot for rule `debug-separate-machine-tooling-from-repo-bugs`. Review this surface against the accepted preference.
- `ios` -> `manual_review_against_rule`
  Rule: `debug-separate-machine-tooling-from-repo-bugs`
  Summary: Historical hotspot for rule `debug-separate-machine-tooling-from-repo-bugs`. Review this surface against the accepted preference.
- `src/app` -> `manual_review_against_rule`
  Rule: `debug-exact-stack-and-file-first`
  Summary: Historical hotspot for rule `debug-exact-stack-and-file-first`. Review this surface against the accepted preference.
- `src/app/(app)/(tabs)` -> `manual_review_against_rule`
  Rule: `native-ios-real-native-over-lookalikes`
  Summary: Historical hotspot for rule `native-ios-real-native-over-lookalikes`. Review this surface against the accepted preference.
- `src/composition/repositories.ts` -> `manual_review_against_rule`
  Rule: `arch-http-ready-clean-break`
  Summary: Historical hotspot for rule `arch-http-ready-clean-break`. Review this surface against the accepted preference.
- `src/composition/repositories.ts` -> `manual_review_against_rule`
  Rule: `arch-shell-only-app-provider`
  Summary: Historical hotspot for rule `arch-shell-only-app-provider`. Review this surface against the accepted preference.
- `src/features` -> `manual_review_against_rule`
  Rule: `arch-http-ready-clean-break`
  Summary: Historical hotspot for rule `arch-http-ready-clean-break`. Review this surface against the accepted preference.
- `src/features` -> `manual_review_against_rule`
  Rule: `debug-exact-stack-and-file-first`
  Summary: Historical hotspot for rule `debug-exact-stack-and-file-first`. Review this surface against the accepted preference.
- `src/features` -> `manual_review_against_rule`
  Rule: `design-system-accent-buttons-use-white-foreground`
  Summary: Historical hotspot for rule `design-system-accent-buttons-use-white-foreground`. Review this surface against the accepted preference.
- `src/features/auth/onboarding` -> `manual_review_against_rule`
  Rule: `native-ios-real-native-over-lookalikes`
  Summary: Historical hotspot for rule `native-ios-real-native-over-lookalikes`. Review this surface against the accepted preference.
- `src/features/documents` -> `manual_review_against_rule`
  Rule: `native-ios-real-native-over-lookalikes`
  Summary: Historical hotspot for rule `native-ios-real-native-over-lookalikes`. Review this surface against the accepted preference.
- `src/features/documents` -> `manual_review_against_rule`
  Rule: `native-android-use-native-picker-patterns`
  Summary: Historical hotspot for rule `native-android-use-native-picker-patterns`. Review this surface against the accepted preference.
- `src/features/documents/components/DocumentList.tsx` -> `manual_review_against_rule`
  Rule: `product-action-first-rows`
  Summary: Historical hotspot for rule `product-action-first-rows`. Review this surface against the accepted preference.
- `src/features/home` -> `manual_review_against_rule`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Historical hotspot for rule `arch-uniformity-small-files-hooks-components`. Review this surface against the accepted preference.
- `src/features/home` -> `manual_review_against_rule`
  Rule: `product-prune-low-signal-ui-aggressively`
  Summary: Historical hotspot for rule `product-prune-low-signal-ui-aggressively`. Review this surface against the accepted preference.
- `src/features/home` -> `manual_review_against_rule`
  Rule: `product-local-context-over-broad-shared-fix`
  Summary: Historical hotspot for rule `product-local-context-over-broad-shared-fix`. Review this surface against the accepted preference.
- `src/features/profile` -> `manual_review_against_rule`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Historical hotspot for rule `arch-uniformity-small-files-hooks-components`. Review this surface against the accepted preference.
- `src/features/profile` -> `manual_review_against_rule`
  Rule: `native-ios-grouped-settings-and-real-detail-surfaces`
  Summary: Historical hotspot for rule `native-ios-grouped-settings-and-real-detail-surfaces`. Review this surface against the accepted preference.
- `src/features/profile` -> `manual_review_against_rule`
  Rule: `product-action-first-rows`
  Summary: Historical hotspot for rule `product-action-first-rows`. Review this surface against the accepted preference.
- `src/features/profile` -> `manual_review_against_rule`
  Rule: `product-prune-low-signal-ui-aggressively`
  Summary: Historical hotspot for rule `product-prune-low-signal-ui-aggressively`. Review this surface against the accepted preference.
- `src/features/schedule` -> `manual_review_against_rule`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Historical hotspot for rule `arch-uniformity-small-files-hooks-components`. Review this surface against the accepted preference.
- `src/features/schedule` -> `manual_review_against_rule`
  Rule: `native-ios-real-native-over-lookalikes`
  Summary: Historical hotspot for rule `native-ios-real-native-over-lookalikes`. Review this surface against the accepted preference.
- `src/features/schedule` -> `manual_review_against_rule`
  Rule: `native-android-use-native-picker-patterns`
  Summary: Historical hotspot for rule `native-android-use-native-picker-patterns`. Review this surface against the accepted preference.
- `src/features/schedule` -> `manual_review_against_rule`
  Rule: `product-action-first-rows`
  Summary: Historical hotspot for rule `product-action-first-rows`. Review this surface against the accepted preference.
- `src/features/time` -> `manual_review_against_rule`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Historical hotspot for rule `arch-uniformity-small-files-hooks-components`. Review this surface against the accepted preference.
- `src/features/time` -> `manual_review_against_rule`
  Rule: `product-prune-low-signal-ui-aggressively`
  Summary: Historical hotspot for rule `product-prune-low-signal-ui-aggressively`. Review this surface against the accepted preference.
- `src/features/time` -> `manual_review_against_rule`
  Rule: `product-local-context-over-broad-shared-fix`
  Summary: Historical hotspot for rule `product-local-context-over-broad-shared-fix`. Review this surface against the accepted preference.
- `src/providers/app-provider.tsx` -> `manual_review_against_rule`
  Rule: `arch-shell-only-app-provider`
  Summary: Historical hotspot for rule `arch-shell-only-app-provider`. Review this surface against the accepted preference.
- `src/services/api` -> `manual_review_against_rule`
  Rule: `arch-http-ready-clean-break`
  Summary: Historical hotspot for rule `arch-http-ready-clean-break`. Review this surface against the accepted preference.
- `src/services/app` -> `manual_review_against_rule`
  Rule: `arch-http-ready-clean-break`
  Summary: Historical hotspot for rule `arch-http-ready-clean-break`. Review this surface against the accepted preference.
- `src/services/app/app.transformer.ts` -> `manual_review_against_rule`
  Rule: `debug-exact-stack-and-file-first`
  Summary: Historical hotspot for rule `debug-exact-stack-and-file-first`. Review this surface against the accepted preference.
- `src/theme` -> `manual_review_against_rule`
  Rule: `design-system-accent-buttons-use-white-foreground`
  Summary: Historical hotspot for rule `design-system-accent-buttons-use-white-foreground`. Review this surface against the accepted preference.
- `src/ui` -> `manual_review_against_rule`
  Rule: `design-system-accent-buttons-use-white-foreground`
  Summary: Historical hotspot for rule `design-system-accent-buttons-use-white-foreground`. Review this surface against the accepted preference.
