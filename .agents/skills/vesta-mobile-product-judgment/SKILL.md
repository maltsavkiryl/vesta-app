---
name: vesta-mobile-product-judgment
description: Repo-specific product and UX judgment for vesta-mobile. Use when refining mobile screen usefulness, trimming low-signal UI, simplifying copy, deciding between local versus shared UI fixes, or matching the app to the user's preferred native-feeling employee experience.
---

# Vesta-Mobile Product Judgment

Use this skill when the main question is product judgment rather than framework mechanics. Bias toward useful, calm, native-feeling surfaces.

## Use This When

- The user asks for a critical UX review, cleaner copy, or less clutter.
- A screen should feel calmer, more focused, or more native without changing core architecture.
- You need to choose between a contextual local UI fix and a shared design-system change.

## Do Not Use This For

- Pure platform mechanics such as which iOS or Android component API to use.
- Repo-level architecture refactors, provider boundaries, or debugging root-cause triage.

## Workflow

- Use the repo rules below to choose the direction, scope, and shared-versus-local fix strategy.
- If a rule decides the product or platform direction but not the exact implementation mechanics, load the upstream guidance listed next.

## Upstream Fallback

- `react-native-design`: Use after the local rule picks the UX direction and you need React Native implementation patterns.
- `ios-design-guidelines`: Use when the judgment call should map to Apple-native hierarchy or control behavior.
- `android-design-guidelines`: Use when the judgment call should map to Android-native affordances or Material behavior.

## Repo Hotspots

- `src/features/documents/components/DocumentList.tsx`
- `src/features/profile`
- `src/features/schedule`
- `src/features/home`
- `src/features/time`
- `src/ui`
- `src/theme`
- `src/features`

## Active Repo Rules

## Prefer action-first compact rows over low-value status copy

- Directive: When a row already communicates the required action, prefer compact action-first rows and keep status labels only when they materially improve comprehension.
- Match when: `missing label feels stupid`, `action-first`, `take unnecessary space`
- Avoid:
  - Redundant status text that restates the obvious action
  - Extra helper copy that increases row height without adding meaning
- Review hotspots first:
  - `src/features/documents/components/DocumentList.tsx`
  - `src/features/profile`
  - `src/features/schedule`

## Prune low-signal data and exact visible clutter aggressively

- Directive: When the user calls out low-value copy or stats, delete the exact visible block and re-center the screen around its primary job instead of softening or renaming the clutter.
- Match when: `very critical look`, `not useful to show`, `remove this text`, `remove these stats`
- Avoid:
  - Decorative dashboards that mix multiple goals on one employee screen
  - Empty footer shells or card shells left behind after removing copy
- Review hotspots first:
  - `src/features/home`
  - `src/features/profile`
  - `src/features/time`

## Prefer contextual local UI fixes after the shared primitive is proven wrong in-context

- Directive: Once the problem is clearly local to a card or screen context, prefer a contextual local styling or component treatment instead of continuing to churn the shared primitive.
- Match when: `awkward here`, `still looks weird here`, `improve visibility`
- Avoid:
  - Repeatedly stretching a shared button to fit a compact card use case
  - Broad shared-component churn for a clearly local visibility problem
- Review hotspots first:
  - `src/features/time`
  - `src/features/home`

## Treat blue-accent buttons with white text as a design-system rule

- Directive: When accent-filled controls are blue, treat white foreground text as a shared design-system rule and fix it at the token or shared component layer instead of one screen at a time.
- Match when: `blue buttons`, `white text and never black text`, `accent foreground`
- Avoid:
  - One-off foreground overrides on individual screens
  - Accent-filled controls that render dark text
- Review hotspots first:
  - `src/ui`
  - `src/theme`
  - `src/features`
