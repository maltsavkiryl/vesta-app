# Codebase Improvement Report

- Scope: `vesta-mobile`
- Findings: `0`
- Review surfaces: `34`
- Work packets: `0`
- Worktree: `10` changed paths

## Worktree Guardrail

- Tracked changes: `9`
- Untracked paths: `1`
- Do not start broad sweeps in already-touched areas without isolating the work first.

## Actionable Findings

- None. The current automated audit did not detect any live cleanup work.

## Historical Review Surfaces

- `src/services/api`
  Rule: `arch-http-ready-clean-break`
  Summary: Historical hotspot for rule `arch-http-ready-clean-break`. Review this surface against the accepted preference.
- `src/services/app`
  Rule: `arch-http-ready-clean-break`
  Summary: Historical hotspot for rule `arch-http-ready-clean-break`. Review this surface against the accepted preference.
- `src/features`
  Rule: `arch-http-ready-clean-break`
  Summary: Historical hotspot for rule `arch-http-ready-clean-break`. Review this surface against the accepted preference.
- `src/composition/repositories.ts`
  Rule: `arch-http-ready-clean-break`
  Summary: Historical hotspot for rule `arch-http-ready-clean-break`. Review this surface against the accepted preference.
- `src/providers/app-provider.tsx`
  Rule: `arch-shell-only-app-provider`
  Summary: Historical hotspot for rule `arch-shell-only-app-provider`. Review this surface against the accepted preference.
- `src/composition/repositories.ts`
  Rule: `arch-shell-only-app-provider`
  Summary: Historical hotspot for rule `arch-shell-only-app-provider`. Review this surface against the accepted preference.
- `src/features/home`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Historical hotspot for rule `arch-uniformity-small-files-hooks-components`. Review this surface against the accepted preference.
- `src/features/profile`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Historical hotspot for rule `arch-uniformity-small-files-hooks-components`. Review this surface against the accepted preference.
- `src/features/time`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Historical hotspot for rule `arch-uniformity-small-files-hooks-components`. Review this surface against the accepted preference.
- `src/features/schedule`
  Rule: `arch-uniformity-small-files-hooks-components`
  Summary: Historical hotspot for rule `arch-uniformity-small-files-hooks-components`. Review this surface against the accepted preference.
- `src/app`
  Rule: `debug-exact-stack-and-file-first`
  Summary: Historical hotspot for rule `debug-exact-stack-and-file-first`. Review this surface against the accepted preference.
- `src/services/app/app.transformer.ts`
  Rule: `debug-exact-stack-and-file-first`
  Summary: Historical hotspot for rule `debug-exact-stack-and-file-first`. Review this surface against the accepted preference.
- `src/features`
  Rule: `debug-exact-stack-and-file-first`
  Summary: Historical hotspot for rule `debug-exact-stack-and-file-first`. Review this surface against the accepted preference.
- `ios`
  Rule: `debug-separate-machine-tooling-from-repo-bugs`
  Summary: Historical hotspot for rule `debug-separate-machine-tooling-from-repo-bugs`. Review this surface against the accepted preference.
- `eas.json`
  Rule: `debug-separate-machine-tooling-from-repo-bugs`
  Summary: Historical hotspot for rule `debug-separate-machine-tooling-from-repo-bugs`. Review this surface against the accepted preference.
- `app.config.ts`
  Rule: `debug-separate-machine-tooling-from-repo-bugs`
  Summary: Historical hotspot for rule `debug-separate-machine-tooling-from-repo-bugs`. Review this surface against the accepted preference.
- `src/app/(app)/(tabs)`
  Rule: `native-ios-real-native-over-lookalikes`
  Summary: Historical hotspot for rule `native-ios-real-native-over-lookalikes`. Review this surface against the accepted preference.
- `src/features/schedule`
  Rule: `native-ios-real-native-over-lookalikes`
  Summary: Historical hotspot for rule `native-ios-real-native-over-lookalikes`. Review this surface against the accepted preference.
- `src/features/documents`
  Rule: `native-ios-real-native-over-lookalikes`
  Summary: Historical hotspot for rule `native-ios-real-native-over-lookalikes`. Review this surface against the accepted preference.
- `src/features/auth/onboarding`
  Rule: `native-ios-real-native-over-lookalikes`
  Summary: Historical hotspot for rule `native-ios-real-native-over-lookalikes`. Review this surface against the accepted preference.
- `src/features/profile`
  Rule: `native-ios-grouped-settings-and-real-detail-surfaces`
  Summary: Historical hotspot for rule `native-ios-grouped-settings-and-real-detail-surfaces`. Review this surface against the accepted preference.
- `src/features/schedule`
  Rule: `native-android-use-native-picker-patterns`
  Summary: Historical hotspot for rule `native-android-use-native-picker-patterns`. Review this surface against the accepted preference.
- `src/features/documents`
  Rule: `native-android-use-native-picker-patterns`
  Summary: Historical hotspot for rule `native-android-use-native-picker-patterns`. Review this surface against the accepted preference.
- `src/features/documents/components/DocumentList.tsx`
  Rule: `product-action-first-rows`
  Summary: Historical hotspot for rule `product-action-first-rows`. Review this surface against the accepted preference.
- `src/features/profile`
  Rule: `product-action-first-rows`
  Summary: Historical hotspot for rule `product-action-first-rows`. Review this surface against the accepted preference.
- `src/features/schedule`
  Rule: `product-action-first-rows`
  Summary: Historical hotspot for rule `product-action-first-rows`. Review this surface against the accepted preference.
- `src/features/home`
  Rule: `product-prune-low-signal-ui-aggressively`
  Summary: Historical hotspot for rule `product-prune-low-signal-ui-aggressively`. Review this surface against the accepted preference.
- `src/features/profile`
  Rule: `product-prune-low-signal-ui-aggressively`
  Summary: Historical hotspot for rule `product-prune-low-signal-ui-aggressively`. Review this surface against the accepted preference.
- `src/features/time`
  Rule: `product-prune-low-signal-ui-aggressively`
  Summary: Historical hotspot for rule `product-prune-low-signal-ui-aggressively`. Review this surface against the accepted preference.
- `src/features/time`
  Rule: `product-local-context-over-broad-shared-fix`
  Summary: Historical hotspot for rule `product-local-context-over-broad-shared-fix`. Review this surface against the accepted preference.
- `src/features/home`
  Rule: `product-local-context-over-broad-shared-fix`
  Summary: Historical hotspot for rule `product-local-context-over-broad-shared-fix`. Review this surface against the accepted preference.
- `src/ui`
  Rule: `design-system-accent-buttons-use-white-foreground`
  Summary: Historical hotspot for rule `design-system-accent-buttons-use-white-foreground`. Review this surface against the accepted preference.
- `src/theme`
  Rule: `design-system-accent-buttons-use-white-foreground`
  Summary: Historical hotspot for rule `design-system-accent-buttons-use-white-foreground`. Review this surface against the accepted preference.
- `src/features`
  Rule: `design-system-accent-buttons-use-white-foreground`
  Summary: Historical hotspot for rule `design-system-accent-buttons-use-white-foreground`. Review this surface against the accepted preference.
