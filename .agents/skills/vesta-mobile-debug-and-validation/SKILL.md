---
name: vesta-mobile-debug-and-validation
description: Repo-specific debugging and validation workflow for vesta-mobile. Use when the user pastes exact stack traces, route errors, native build failures, machine-state issues, or asks why a mobile runtime/build error is happening.
---

# Vesta-Mobile Debug And Validation

Use this skill when debugging. Start from the exact failing file, route, or first hard blocker.

## Use This When

- The user pastes a stack trace, import error, route failure, or native build failure.
- You must separate repo-state bugs from missing local tooling or simulator setup.
- The correct first step is determining which exact file, route, or binary mismatch caused the failure.

## Do Not Use This For

- Intentional feature refactors where nothing is currently broken.
- Pure UI polish or product judgment requests with no error or validation loop.

## Workflow

- Use the repo rules below to choose the direction, scope, and shared-versus-local fix strategy.
- If a rule decides the product or platform direction but not the exact implementation mechanics, load the upstream guidance listed next.

## Upstream Fallback

- `react-native-best-practices`: Use for supporting React Native engineering practices after the repo-specific root cause is identified.
- `react-native-testing`: Use when the next step after diagnosis is validating or hardening the behavior with tests.

## Repo Hotspots

- `src/app`
- `src/services/app/app.transformer.ts`
- `src/features`
- `ios`
- `eas.json`
- `app.config.ts`

## Active Repo Rules

## Start from the exact file, route, or stack trace

- Directive: When the user pastes an exact stack trace, route error, or file path, inspect that precise on-disk module and code path first instead of jumping to generic config or environment theories.
- Match when: `why am i getting this error`, `Unable to resolve module`, `stack trace`, `app.transformer.ts`
- Avoid:
  - Starting with alias or config debugging before checking whether the imported file exists
  - General troubleshooting lists that do not address the first hard failure in the pasted log
- Review hotspots first:
  - `src/app`
  - `src/services/app/app.transformer.ts`
  - `src/features`

## Separate machine-state failures from repo-state failures

- Directive: When a failure is caused by local toolchain or machine setup, identify and state that immediately instead of editing application code first.
- Match when: `spawn fastlane ENOENT`, `pnpm ios failure`, `native build failure`
- Avoid:
  - Changing app code to chase missing Fastlane, missing simulator runtimes, or PATH problems
- Review hotspots first:
  - `ios`
  - `eas.json`
  - `app.config.ts`
