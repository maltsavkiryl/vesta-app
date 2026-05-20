---
name: vesta-mobile-native-android
description: Repo-specific Android guidance for vesta-mobile. Use when implementing Android-facing picker flows, platform dialogs, Material-style interaction choices, or deciding whether a mobile flow should stay lightweight and native on Android instead of growing into custom UI.
---

# Vesta-Mobile Native Android

Use this skill for Android-specific interaction choices. Keep simple flows lightweight and platform-familiar.

## Use This When

- A time picker, upload flow, dialog, or compact choice should stay lightweight on Android.
- You need to choose between a custom React Native flow and a platform-familiar Android pattern.
- The user wants native-feeling Android behavior rather than a larger custom UI.

## Do Not Use This For

- Broad visual cleanup or copy simplification that is not Android-specific.
- iOS-native behavior decisions or shared architecture cleanup.

## Workflow

- Use the repo rules below to choose the direction, scope, and shared-versus-local fix strategy.
- If a rule decides the product or platform direction but not the exact implementation mechanics, load the upstream guidance listed next.

## Upstream Fallback

- `android-design-guidelines`: Use for Material 3 mechanics, accessibility, and Android behavior once the local flow decision is made.
- `react-native-design`: Use for the React Native implementation path after the Android interaction choice is clear.

## Repo Hotspots

- `src/features/schedule`
- `src/features/documents`

## Active Repo Rules

## Prefer native picker patterns over custom stepper controls

- Directive: For time selection and lightweight upload choices, prefer familiar row-triggered native picker and platform dialog patterns over custom steppers, oversized sheets, or invented controls.
- Match when: `best possible time input`, `native time input`, `camera or files`, `Android dialog`
- Avoid:
  - Custom stepper-based time input flows
  - Route-backed upload UIs for a simple camera-or-files choice
- Review hotspots first:
  - `src/features/schedule`
  - `src/features/documents`

## Imported Upstream Links

- `android-design-guidelines`
- `react-native-design`
