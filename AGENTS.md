# Vesta-Mobile Agent Guide

This repository uses a local Codex overlay skill pack. For `vesta-mobile` work, use the repo-local skill first to choose repo policy, then fall through to the imported upstream React Native, iOS, or Android guidance when the task needs platform mechanics.

## Routing Order

- `vesta-mobile-debug-and-validation`: first stop for pasted logs, route crashes, Metro/import failures, native build failures, and validation loops.
- `vesta-mobile-native-ios`: first stop when the user asks for actual native, Apple-native, refined iPhone behavior, or real iOS controls.
- `vesta-mobile-native-android`: first stop when a compact Android flow should stay lightweight and platform-familiar.
- `vesta-mobile-react-native-architecture`: first stop for repository boundaries, provider cycles, oversized screens/hooks, and cleanup direction.
- `vesta-mobile-product-judgment`: first stop for low-signal UI removal, action-first rows, copy cleanup, and contextual local UX fixes.
- `vesta-mobile-skill-maintainer`: use only when evolving the skill system or preparing a cleanup program from it.

## Upstream Escalation

- Use the local skill to decide repo policy and user preference first.
- Then load `react-native-design`, `ios-design-guidelines`, `android-design-guidelines`, `react-native-best-practices`, or `react-native-testing` only when you need implementation mechanics that the local overlay intentionally does not duplicate.
- Do not edit vendored upstream skill snapshots for repo-specific behavior; keep repo policy in `.agents/skills` and `tools/codex-preferences`.

## Working Rules

- Check `git status` before broad sweeps and avoid clobbering in-progress feature work.
- Start from the exact failing file, route, stack trace, or native binary mismatch before expanding the search.
- Prefer real native controls and platform behavior over JavaScript lookalikes when the user asks for actual native behavior.
- Keep shell providers thin; do not recreate provider-to-feature cycles.
- Split large screens into shells, hooks, and reusable components instead of growing local monoliths.
- Remove exact low-value UI or copy when the user points it out; do not soften it into renamed clutter.

## Maintenance Commands

- `pnpm codex:skills:refresh`
- `pnpm codex:skills:generate`
- `pnpm codex:skills:audit`
- `pnpm codex:skills:report`
- `pnpm codex:skills:accept -- <rule-id>`

## Local Skills

- `vesta-mobile-product-judgment`: Repo-specific UX and product cleanup rules for vesta-mobile screens. Active rules: `4`.
- `vesta-mobile-native-ios`: Repo-local Apple-native guidance layered on top of the imported HIG skill. Active rules: `2`.
- `vesta-mobile-native-android`: Repo-local Android interaction guidance layered on top of the imported Material skill. Active rules: `1`.
- `vesta-mobile-react-native-architecture`: Repo-specific architecture rules for repositories, providers, workflows, and decomposition. Active rules: `3`.
- `vesta-mobile-debug-and-validation`: Repo-specific debugging workflow for route errors, stack traces, and native failures. Active rules: `2`.
- `vesta-mobile-skill-maintainer`: Maintains the local vesta-mobile skill overlay, reports, and cleanup backlog. Active rules: `1`.
