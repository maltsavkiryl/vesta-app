# Vesta-Mobile Agent Guide

This repository has a local Codex overlay skill pack. For `vesta-mobile` work, prefer these repo-local skills before relying on the imported upstream mobile plugins when their guidance conflicts.

## Skill Order

- `vesta-mobile-debug-and-validation` for errors, stack traces, and native build/runtime issues.
- `vesta-mobile-native-ios` when the user asks for actual native, Apple-native, refined, Liquid Glass, or real iOS controls.
- `vesta-mobile-native-android` when the flow should stay lightweight and platform-familiar on Android.
- `vesta-mobile-react-native-architecture` for repo structure, repositories/workflows, provider boundaries, and screen decomposition.
- `vesta-mobile-product-judgment` for copy, chrome pruning, low-signal UI removal, and contextual UI choices.
- `vesta-mobile-skill-maintainer` when updating the preference system or generating the cleanup backlog.

## Working Rules

- Inspect `git status` before broad sweeps or large refactors.
- Start from the exact failing file, route, or first hard blocker in the user's pasted log.
- Prefer real native controls and platform behavior over JavaScript lookalikes when the user asks for actual native behavior.
- Keep shell providers thin; do not recreate provider-to-feature cycles.
- Split large screens into shells, hooks, and reusable components instead of growing monoliths.
- Delete exact low-value UI blocks when the user points them out; do not soften them into renamed clutter.
- Separate machine-state failures from repo-state failures before changing application code.

## Maintenance Commands

- `pnpm codex:skills:refresh`
- `pnpm codex:skills:generate`
- `pnpm codex:skills:audit`
- `pnpm codex:skills:report`
- `pnpm codex:skills:accept -- <rule-id>`

## Local Skills

- `vesta-mobile-product-judgment` with `4` active rules
- `vesta-mobile-native-ios` with `2` active rules
- `vesta-mobile-native-android` with `1` active rules
- `vesta-mobile-react-native-architecture` with `3` active rules
- `vesta-mobile-debug-and-validation` with `2` active rules
- `vesta-mobile-skill-maintainer` with `1` active rules
