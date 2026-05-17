# Vesta Mobile Native Refactor Plan

## Goal

Refactor the mobile app into an Expo-first React Native application that keeps the existing product scope while adopting native iOS and Android interaction patterns, stronger architecture boundaries, and a more premium visual system.

## Product Scope

- Authentication: sign in, register, password reset, onboarding
- Home: daily overview, next shift, quick actions, highlights, notifications
- Schedule: month view, day detail, availability editing, requests
- Time: active shift state, breaks, history, clock-out summary
- Documents: payroll, contracts, verification tasks
- Profile: account data, preferences, employers, banking, legal details
- Notifications: actionable inbox for shift and account updates

## Architecture Direction

- Expo Router route groups for auth, tabs, and modals
- Feature-first structure under `src/features/*`
- Shared design system under `src/design-system/*`
- Mock-first domain state with clean model boundaries in `src/core/*`
- Single app/session provider for persisted app state and user actions
- Native-safe layout primitives with safe-area handling and reusable cards, buttons, fields, pills, and headers

## UX And Design Direction

- Native large-title hierarchy instead of web-style dense headings
- Floating iOS-style tab bar with clear iconography
- Editorial hero surfaces and grouped content cards
- Semantic dark palette inspired by Apple system colors
- Cleaner account, notifications, and document flows
- Better consistency across home, schedule, time, library, and account tabs

## Progress

- [x] Replace starter shell with Expo Router auth, tab, and modal flows
- [x] Add domain models, mock state, and persisted app session provider
- [x] Build feature screens for auth, home, schedule, time, documents, profile, and notifications
- [x] Introduce shared native design-system primitives and semantic tokens
- [x] Exclude legacy `vesta_mobile_app` prototype from Expo compile and lint targets
- [x] Restyle the app toward a more native iOS / App Store-inspired visual language
- [ ] Add richer motion, haptics, and sheet transitions where they improve UX
- [ ] Replace mock repositories with production API adapters
- [ ] Add broader component coverage and end-to-end mobile flow tests
- [ ] Run device QA on iOS and Android for final polish

## Current Notes

- The design pass now emphasizes large titles, grouped surfaces, floating navigation, and simplified top-level information architecture.
- The current data layer is still mock-first by design so the visual and architectural rewrite can stabilize before backend integration.
- The next high-value step is device-level polish: animations, haptics, spacing refinement, and API integration boundaries.
