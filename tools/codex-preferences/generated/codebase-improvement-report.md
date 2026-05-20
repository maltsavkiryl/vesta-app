# Codebase Improvement Report

- Scope: `vesta-mobile`
- Findings: `34`
- Work packets: `1`
- Worktree: `33` changed paths

## Worktree Guardrail

- Tracked changes: `13`
- Untracked paths: `20`
- Do not start broad sweeps in already-touched areas without isolating the work first.

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
