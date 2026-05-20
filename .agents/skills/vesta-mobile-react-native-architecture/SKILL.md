---
name: vesta-mobile-react-native-architecture
description: Repo-specific React Native architecture guidance for vesta-mobile. Use when refactoring screens, providers, repositories, workflows, or app structure; when splitting large files into hooks and reusable components; or when enforcing the repo's clean-break HTTP-ready architecture direction.
---

# Vesta-Mobile React Native Architecture

Use this skill for architectural refactors and screen decomposition. Optimize for repo-specific boundaries, not generic patterns.

## Workflow

- Prefer these repo-local rules over upstream imported mobile skill packs when they conflict.
- Apply the rule that matches the user's exact wording first, especially direct corrections and screenshot feedback.
- Favor the shared-layer fix only when the issue is clearly shared; otherwise localize the change to the affected context.

## Prefer clean-break repository and workflow boundaries

- Directive: For repo-level architecture work, default toward feature-owned repositories and workflows, an HTTP-ready contract, and clean-break boundaries instead of preserving old shared app-state hooks for compatibility.
- Trigger phrases: `architecture`, `refactor`, `backend boundary`, `repositories + commands`, `http-ready`
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
- Trigger phrases: `AppProvider`, `provider cycle`, `shell-only`, `feature query hooks`
- Avoid:
  - Provider imports from feature query hooks
  - Shared shell state coupled to feature-layer hooks
- Review hotspots first:
  - `src/providers/app-provider.tsx`
  - `src/composition/repositories.ts`

## Push toward reusable hooks, components, and smaller files

- Directive: When refactoring screens, split them into a thin shell plus hooks and reusable components with explicit file-size pressure rather than leaving large screen-local monoliths.
- Trigger phrases: `more uniform`, `reusable components`, `reusable logic into hooks`, `small files`
- Avoid:
  - Huge screen files that mix data, layout, and local helpers
  - Single extracted helper files that keep growing after the first split
- Review hotspots first:
  - `src/features/home`
  - `src/features/profile`
  - `src/features/time`
  - `src/features/schedule`
