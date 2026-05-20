---
name: vesta-mobile-debug-and-validation
description: Repo-specific debugging and validation workflow for vesta-mobile. Use when the user pastes exact stack traces, route errors, native build failures, machine-state issues, or asks why a mobile runtime/build error is happening.
---

# Vesta-Mobile Debug And Validation

Use this skill when debugging. Start from the exact failing file, route, or first hard blocker.

## Workflow

- Prefer these repo-local rules over upstream imported mobile skill packs when they conflict.
- Apply the rule that matches the user's exact wording first, especially direct corrections and screenshot feedback.
- Favor the shared-layer fix only when the issue is clearly shared; otherwise localize the change to the affected context.

## Start from the exact file, route, or stack trace

- Directive: When the user pastes an exact stack trace, route error, or file path, inspect that precise on-disk module and code path first instead of jumping to generic config or environment theories.
- Trigger phrases: `why am i getting this error`, `Unable to resolve module`, `stack trace`, `app.transformer.ts`
- Avoid:
  - Starting with alias or config debugging before checking whether the imported file exists
  - General troubleshooting lists that do not address the first hard failure in the pasted log
- Review hotspots first:
  - `src/app`
  - `src/services/app/app.transformer.ts`
  - `src/features`

## Separate machine-state failures from repo-state failures

- Directive: When a failure is caused by local toolchain or machine setup, identify and state that immediately instead of editing application code first.
- Trigger phrases: `spawn fastlane ENOENT`, `pnpm ios failure`, `native build failure`
- Avoid:
  - Changing app code to chase missing Fastlane, missing simulator runtimes, or PATH problems
- Review hotspots first:
  - `ios`
  - `eas.json`
  - `app.config.ts`
