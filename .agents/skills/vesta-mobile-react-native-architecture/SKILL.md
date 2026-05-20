---
name: vesta-mobile-react-native-architecture
description: Repo-specific React Native architecture guidance for vesta-mobile. Use when refactoring screens, providers, repositories, workflows, or app structure; when splitting large files into hooks and reusable components; or when enforcing the repo's clean-break HTTP-ready architecture direction.
---

# Vesta-Mobile React Native Architecture

Use this skill for architectural refactors and screen decomposition. Optimize for repo-specific boundaries, not generic patterns.

## Use This When

- The task is about repo structure, provider boundaries, repositories, workflows, or cleanup direction.
- A screen, hook, or component has become too large and should be decomposed.
- You need the vesta-mobile opinion on clean-break boundaries rather than generic React Native advice.

## Do Not Use This For

- Pure product polish, copy cleanup, or platform styling with no structural decision.
- Native build troubleshooting or machine-state diagnostics.

## Workflow

- Use the repo rules below to choose the direction, scope, and shared-versus-local fix strategy.
- If a rule decides the product or platform direction but not the exact implementation mechanics, load the upstream guidance listed next.

## Upstream Fallback

- `react-native-design`: Use for implementation-level React Native composition patterns after the repo boundary choice is made.
- `react-native-best-practices`: Use for complementary React Native engineering guidance that does not override the repo's boundary decisions.

## Repo Hotspots

- `src/services/api`
- `src/services/app`
- `src/features`
- `src/composition/repositories.ts`
- `src/providers/app-provider.tsx`
- `src/features/home`
- `src/features/profile`
- `src/features/time`
- `src/features/schedule`

## Active Repo Rules

## Prefer clean-break repository and workflow boundaries

- Directive: For repo-level architecture work, default toward feature-owned repositories and workflows, an HTTP-ready contract, and clean-break boundaries instead of preserving old shared app-state hooks for compatibility.
- Match when: `architecture`, `refactor`, `backend boundary`, `repositories + commands`, `http-ready`
- Avoid:
  - Preserving shared snapshot contracts only for backwards compatibility
  - Mixing feature workflow logic back into shell providers
- Review hotspots first:
  - `src/services/api`
  - `src/services/app`
  - `src/features`
  - `src/composition/repositories.ts`

## Keep shell providers thin and out of feature cycles

- Directive: Keep shell providers such as AppProvider shell-only. When shell code needs feature state, query repositories directly instead of importing feature query hooks and recreating provider-to-feature cycles.
- Match when: `AppProvider`, `provider cycle`, `shell-only`, `feature query hooks`
- Avoid:
  - Provider imports from feature query hooks
  - Shared shell state coupled to feature-layer hooks
- Review hotspots first:
  - `src/providers/app-provider.tsx`
  - `src/composition/repositories.ts`

## Push toward reusable hooks, components, and smaller files

- Directive: When refactoring screens, split them into a thin shell plus hooks and reusable components with explicit file-size pressure rather than leaving large screen-local monoliths.
- Match when: `more uniform`, `reusable components`, `reusable logic into hooks`, `small files`
- Avoid:
  - Huge screen files that mix data, layout, and local helpers
  - Single extracted helper files that keep growing after the first split
- Review hotspots first:
  - `src/features/home`
  - `src/features/profile`
  - `src/features/time`
  - `src/features/schedule`

## Imported Upstream Links

- `react-native-best-practices`
- `react-native-design`
