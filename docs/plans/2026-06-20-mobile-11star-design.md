# Vesta Mobile — Road to 11★ (production + world-class UI/UX) — Design Spec

**Decisions (locked):** Foundation-first then waves · Premium-native off the Vesta brand (on-brand blue, native depth/motion/haptics) · All four pillars (motion & delight, speed & offline, clarity & glanceability, accessibility & inclusivity) · Full production bar (tests + real pickers + complete i18n + live end-to-end run).

**Principle:** make it REAL before BEAUTIFUL, lay the system ONCE, then roll it out in reviewable waves. EXTEND the existing `src/theme` + `src/ui` foundation (light/dark, Dynamic Type, `app-motion`, a11y tests already exist) — do not replace it.

## Phase 0 — Close production gaps (finish the planning feature for real)
- Replace free-text swap/change inputs with REAL pickers: shift picker (from my schedule) + native date/time fields + validation; remove the `bijv. shift-abc-123` / `jjjj-mm-dd` placeholders.
- Complete i18n: remove remaining hardcoded Dutch (planning tab labels, form placeholders); en/nl/fr parity for all planning strings.
- Planning tests: integration tests for each planning screen + claim/swap/change/availability/leave flows (feature currently has 0 of 28 files tested).
- Live end-to-end run against the backend on a simulator/device; fix what surfaces (auth, real data, claim establishment path). Document the run.

## Phase 1 — Premium-native design-system foundation (extend `src/theme` + `src/ui`)
- **Tokens**: refine semantic color roles on the Vesta blue (light+dark), elevation/shadow scale, radius scale, Dynamic-Type type ramp, spacing — audit + fill gaps in `colors.ts`/`colorsDark.ts`/`typography.ts`/`spacing.ts`.
- **Motion system** (extend `app-motion.tsx`): shared spring/timing vocabulary, screen-transition + list-stagger presets, press/haptic feedback helpers, signature moments (claim call, check-off task, submit availability), all `reduce-motion` aware.
- **Primitives** (extend `src/ui`): Card, Sheet/BottomSheet (add a sheet primitive; no @gorhom dep — build on existing modal/reanimated), List/Row, Button variants + loading, SegmentedControl, Badge/Chip, Avatar, EmptyState, **Skeleton**, Toast — themed, a11y, ≥44pt targets.

## Phase 2 — Planning feature → 10/10
Re-skin every planning screen on the foundation + pillars: glanceable schedule (week/day, today emphasis, rich cards), crafted shift detail, delightful task check-off (haptic+spring+brief), satisfying call-claim moment, tactile availability editor, swap/change with the new pickers, leave summary card. Every screen: skeletons, empty/error states, optimistic actions.

## Phase 3 — Cross-cutting pillars (app-wide)
- Speed & offline: add `@tanstack/react-query-persist-client` + AsyncStorage/MMKV persister, optimistic mutations everywhere, instant skeletons, retry/backoff.
- Accessibility audit: Dynamic Type on all new components, contrast + dark-mode pass, screen-reader labels + focus order, ≥44pt targets, reduce-motion.

## Phase 4 — Other screens in waves (each its own PR)
Home → Time → Profile → Documents → Auth: re-skin to the foundation + pillars, one reviewable wave at a time.

## Process
Each phase = its own branch → build green + tests → opus critical review → simplify/cleanup/fix → PR → merge to main → next phase. Follow repo policy (AGENTS.md/.agents/skills): feature-first, thin shells + hooks + components, Result<T,E>, no DTO in components, design tokens only, i18n via translate(), light integration tests.

## Out of scope (YAGNI)
Crash/analytics instrumentation + perf budgets (the "above + hardening" tier was not selected); a brand redesign (stay on the Vesta brand); web-portal changes.
