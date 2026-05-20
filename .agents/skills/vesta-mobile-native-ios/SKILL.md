---
name: vesta-mobile-native-ios
description: Repo-specific native iOS guidance for vesta-mobile. Use when implementing or reviewing Apple-native UI, Liquid Glass, segmented controls, grouped settings panes, iPhone-first detail screens, or any request that says actual native, real native, Apple-native, refined, or still looks weird on iOS.
---

# Vesta-Mobile Native iOS

Use this skill when iOS-native feel is central. Prefer real platform behavior over JavaScript lookalikes.

## Use This When

- The user says actual native, real native, Apple-native, Liquid Glass, or refined on iOS.
- Profile, settings, tabs, segmented controls, or detail rows should feel like a real iPhone app.
- You must choose between a JS approximation and a real native iOS path already available in the stack.

## Do Not Use This For

- Generic copy cleanup or clutter removal with no iOS-specific behavior decision.
- Android-first interaction choices or architecture-level repository/provider refactors.

## Workflow

- Use the repo rules below to choose the direction, scope, and shared-versus-local fix strategy.
- If a rule decides the product or platform direction but not the exact implementation mechanics, load the upstream guidance listed next.

## Upstream Fallback

- `ios-design-guidelines`: Use for HIG mechanics, spacing, accessibility, and component conventions after the local rule chooses the direction.
- `react-native-design`: Use for the React Native implementation pattern once the Apple-native target behavior is clear.

## Repo Hotspots

- `src/app/(app)/(tabs)`
- `src/features/schedule`
- `src/features/documents`
- `src/features/auth/onboarding`
- `src/features/profile`

## Active Repo Rules

## Prefer the real native iOS path over lookalikes

- Directive: When the user asks for actual native iOS behavior or appearance, use the true native platform path that already exists in the repo or dependency stack instead of building a JavaScript approximation.
- Match when: `actual native`, `real native`, `Liquid Glass`, `Apple native`
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
- Match when: `real native experience`, `grouped settings`, `profile screens are ugly`, `detail row not implemented`
- Avoid:
  - Generic card piles for settings-style screens
  - Rows that navigate nowhere or only show placeholder text
- Review hotspots first:
  - `src/features/profile`

## Imported Upstream Links

- `ios-design-guidelines`
- `react-native-design`
