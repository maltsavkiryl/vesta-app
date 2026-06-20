# Vesta Mobile — Finalisation Program Design

**Date:** 2026-06-20
**Goal:** Take the `vesta-mobile` employee app to a genuinely complete, "15-star" state — every feature backed by real data, no trust-theater, a clean navigation model, plus high-value additions. Delivered slice-by-slice; each slice is reviewed, simplified, PR'd and merged before the next.

## Context (verified, not assumed)

The original product audit (`docs/superpowers/specs/2026-06-13-product-audit-and-roadmap.md`) judged the app by its mock-vs-HTTP wiring and concluded large gaps. Re-mapping both repos shows reality is better:

- **Backend (`vestatime-api`) already supports** profile, the full planning suite (schedule, availability, todos, open calls, swaps, changes, leave), notifications (inbox + SSE stream + unread counts + push-device registration), documents (paged list + signed download URL), and an iCal calendar feed.
- **Mobile already wires** (HTTP): auth (Entra), profile, planning. Foundations the audit flagged as missing are in fact done: the i18n language switcher is wired (`ProfileDetailSettingsContent` → `changeAppLanguage`), demo prefill is `__DEV__`-gated, shared state primitives exist (`EmptyState`, `Skeleton`, `Toast`).
- **Still mock** (mobile composition): documents, home, notifications, schedule, time.
- **Genuine backend gaps:** no employee-self-service time-clock endpoints (only the Kiosk PIN API), and no contract-signing endpoint.

## Decisions

- **Full-stack.** Build the two missing backend endpoint groups in `vestatime-api` (employee time-clock; contract signing) so nothing stays faked.
- **Navigation:** 5 standard tabs — Home / Schedule / Time / Inbox / Profile. Promote Notifications to a real Inbox tab; fold the duplicate Planning-hub modal routes into the Schedule tab; clock-in lives inside Time (with history); Documents stay under Profile.
- **Consolidate the duplicated schedule domain:** retire the mock `schedule` feature; make the existing `planning` HTTP repository the single source of truth for shifts/availability/swaps/leave/open-calls.
- **Cuts (necessity filter):** remove the prod demo-auth flag; replace fake contract "signing" with real signing; no document *upload* feature (backend has no upload endpoint — defer, don't fake).
- **New features:** offline clock-in queue; smart push reminders; calendar sync (surface existing iCal feed); iOS Live Activity for the running shift.

## Architecture notes

- Mobile keeps its **repository-swap** pattern: each feature has an interface + a mock impl + (new) an HTTP impl; `createAppRepositories()` wires mock vs HTTP by `Config.API_URL`. New HTTP repos follow `planning.http.repository.ts` (DTO files + transformers, `Result<T>` for writes, throw for reads).
- React Query + MMKV persistence stay. The offline clock-in queue layers on top of the time HTTP repo (persisted mutation queue drained on reconnect), not a new global store.
- Backend additions follow existing controller/use-case conventions; employee endpoints under `api/v1/employee/*`, JWT-scoped to the calling employee.

## Slice plan

Each slice: implement → self-review → simplify/cleanup → verify (`pnpm compile && pnpm lint:check && pnpm test && pnpm depcruise:check`) → PR → merge to `main`.

- **S0 Foundations** — this spec; prod demo-auth hardening (`config.prod.ts DEMO_AUTH_ENABLED → false`). (Foundations the audit listed are already complete.)
- **S1 Notifications + Inbox** — HTTP notifications repo (list, mark read/important/delete, unread counts) + SSE live stream; surface as the Inbox tab.
- **S2 Documents** — HTTP documents repo (paged list + signed-URL download), payslip/contract views.
- **S3 Schedule consolidation + open shifts** — retire mock `schedule`; planning HTTP becomes the single source; surface "pick up open shifts", swaps, availability, leave in one Schedule tab; Home assembles from real data.
- **S4 Backend** (`vestatime-api`) — employee time-clock endpoints (current session, clock-in/out, break start/end) + time-entry history; contract list/detail/sign.
- **S5 Mobile time + offline** — HTTP time repo against S4 endpoints, wrapped in an offline mutation queue; real contract-signing UI.
- **S6 Navigation overhaul** — 5-tab structure; fold planning-hub modals into Schedule; route/deep-link cleanup.
- **S7 New features** — calendar sync (iCal), smart push reminders (device register + SSE/push routing + local shift reminders), iOS Live Activity.
- **S8 Final 15-star polish** — cross-app consistency, motion, empty/error states, accessibility sweep, perf, end-to-end pass.

## Verification & risk

- Per-slice gate: `pnpm check` (compile + jest + depcruise + doctor) or the individual commands.
- No CI on the repo → merges performed via `gh` after local gates pass.
- Backend slice (S4) gated in `vestatime-api` with its own build/tests; mobile time wiring (S5) depends on S4 being merged/deployed, so S4 precedes S5.
