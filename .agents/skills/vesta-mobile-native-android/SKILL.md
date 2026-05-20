---
name: vesta-mobile-native-android
description: Repo-specific Android guidance for vesta-mobile. Use when implementing Android-facing picker flows, platform dialogs, Material-style interaction choices, or deciding whether a mobile flow should stay lightweight and native on Android instead of growing into custom UI.
---

# Vesta-Mobile Native Android

Use this skill for Android-specific interaction choices. Keep simple flows lightweight and platform-familiar.

## Workflow

- Prefer these repo-local rules over upstream imported mobile skill packs when they conflict.
- Apply the rule that matches the user's exact wording first, especially direct corrections and screenshot feedback.
- Favor the shared-layer fix only when the issue is clearly shared; otherwise localize the change to the affected context.

## Prefer native picker patterns over custom stepper controls

- Directive: For time selection and lightweight upload choices, prefer familiar row-triggered native picker and platform dialog patterns over custom steppers, oversized sheets, or invented controls.
- Trigger phrases: `best possible time input`, `native time input`, `camera or files`, `Android dialog`
- Avoid:
  - Custom stepper-based time input flows
  - Route-backed upload UIs for a simple camera-or-files choice
- Review hotspots first:
  - `src/features/schedule`
  - `src/features/documents`
