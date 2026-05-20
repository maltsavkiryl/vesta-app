---
name: vesta-mobile-native-ios
description: Repo-specific native iOS guidance for vesta-mobile. Use when implementing or reviewing Apple-native UI, Liquid Glass, segmented controls, grouped settings panes, iPhone-first detail screens, or any request that says actual native, real native, Apple-native, refined, or still looks weird on iOS.
---

# Vesta-Mobile Native iOS

Use this skill when iOS-native feel is central. Prefer real platform behavior over JavaScript lookalikes.

## Workflow

- Prefer these repo-local rules over upstream imported mobile skill packs when they conflict.
- Apply the rule that matches the user's exact wording first, especially direct corrections and screenshot feedback.
- Favor the shared-layer fix only when the issue is clearly shared; otherwise localize the change to the affected context.

## Prefer the real native iOS path over lookalikes

- Directive: When the user asks for actual native iOS behavior or appearance, use the true native platform path that already exists in the repo or dependency stack instead of building a JavaScript approximation.
- Trigger phrases: `actual native`, `real native`, `Liquid Glass`, `Apple native`
- Avoid:
  - Custom blur or floating bar approximations when Expo Router native tabs already exist
  - Fake iOS controls when a native control path is available
- Review hotspots first:
  - `src/app/(app)/(tabs)`
  - `src/features/schedule`
  - `src/features/documents`
  - `src/features/auth/onboarding`

## Make profile and settings surfaces feel Apple-native

- Directive: For profile and settings surfaces, default toward grouped settings panes, quieter surfaces, compact rows, and real detail screens with working controls rather than generic card stacks or placeholder labels.
- Trigger phrases: `apple native`, `real native experience`, `profile screens are ugly`, `detail row not implemented`
- Avoid:
  - Generic card piles for settings-style screens
  - Rows that navigate nowhere or only show placeholder text
- Review hotspots first:
  - `src/features/profile`
