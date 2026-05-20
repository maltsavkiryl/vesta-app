---
name: vesta-mobile-product-judgment
description: Repo-specific product and UX judgment for vesta-mobile. Use when refining mobile screen usefulness, trimming low-signal UI, simplifying copy, deciding between local versus shared UI fixes, or matching the app to the user's preferred native-feeling employee experience.
---

# Vesta-Mobile Product Judgment

Use this skill when the main question is product judgment rather than framework mechanics. Bias toward useful, calm, native-feeling surfaces.

## Workflow

- Prefer these repo-local rules over upstream imported mobile skill packs when they conflict.
- Apply the rule that matches the user's exact wording first, especially direct corrections and screenshot feedback.
- Favor the shared-layer fix only when the issue is clearly shared; otherwise localize the change to the affected context.

## Prefer action-first compact rows over low-value status copy

- Directive: When a row already communicates the required action, prefer compact action-first rows and keep status labels only when they materially improve comprehension.
- Trigger phrases: `missing label feels stupid`, `action-first`, `take unnecessary space`
- Avoid:
  - Redundant status text that restates the obvious action
  - Extra helper copy that increases row height without adding meaning
- Review hotspots first:
  - `src/features/documents/components/DocumentList.tsx`
  - `src/features/profile`
  - `src/features/schedule`

## Prune low-signal data and exact visible clutter aggressively

- Directive: When the user calls out low-value copy or stats, delete the exact visible block and re-center the screen around its primary job instead of softening or renaming the clutter.
- Trigger phrases: `very critical look`, `not useful to show`, `remove this text`, `remove these stats`
- Avoid:
  - Decorative dashboards that mix multiple goals on one employee screen
  - Empty footer shells or card shells left behind after removing copy
- Review hotspots first:
  - `src/features/home`
  - `src/features/profile`
  - `src/features/time`

## Prefer contextual local UI fixes after the shared primitive is proven wrong in-context

- Directive: Once the problem is clearly local to a card or screen context, prefer a contextual local styling or component treatment instead of continuing to churn the shared primitive.
- Trigger phrases: `awkward here`, `still looks weird here`, `improve visibility`
- Avoid:
  - Repeatedly stretching a shared button to fit a compact card use case
  - Broad shared-component churn for a clearly local visibility problem
- Review hotspots first:
  - `src/features/time`
  - `src/features/home`

## Treat blue-accent buttons with white text as a design-system rule

- Directive: When accent-filled controls are blue, treat white foreground text as a shared design-system rule and fix it at the token or shared component layer instead of one screen at a time.
- Trigger phrases: `blue buttons`, `white text and never black text`, `accent foreground`
- Avoid:
  - One-off foreground overrides on individual screens
  - Accent-filled controls that render dark text
- Review hotspots first:
  - `src/ui`
  - `src/theme`
  - `src/features`
