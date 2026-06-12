# Vesta Mobile ↔ Backend Integration — Design

**Date:** 2026-06-12
**Status:** Approved (program decomposition + Slice 0 design)
**Repos:** `vesta-mobile` (Expo/React Native), `vestatime-api` (.NET 10 — `apps/api/src/Vesta.Workforce.Api`)

## Problem

The `vesta-mobile` employee app is fully functional against a local **mock backend**: every feature repository (auth, profile, time, schedule, documents, notifications, home) is implemented in-memory in `src/composition/repositories.ts`, and the HTTP adapter throws `"HTTP adapters are not implemented yet."`. The adapter selector at `repositories.ts:682` is hardcoded `Config.API_URL ? "mock" : "mock"`, so nothing ever hits the network.

The backend is a large enterprise workforce/payroll system focused on **employer / admin / kiosk**. It already has an **employee mobile auth foundation** (External-ID login → memberships → select-employer → scoped JWT) and employee self-service profile/documents, but has **no** employee-facing endpoints for home aggregate, shift scheduling/availability, notifications, or non-kiosk time clock.

"Finalise the mobile app and implement the backend" therefore means: build the missing employee-facing API surface, wire the mobile HTTP adapter to it, and reshape mobile auth to real OIDC.

## Decisions (from brainstorming)

- **Auth:** social login (Google/Apple/Facebook) + email/password fallback, all via **Microsoft Entra External ID (CIAM)** user flows. The IdP federates the social providers and hosts local accounts; the mobile app performs one OIDC/PKCE flow and receives an Entra `id_token`. No custom credential store on our backend.
- **Scope:** all four areas — Auth+Profile, Time clock, Documents, Schedule+Home+Notifications.
- **Contract direction:** pragmatic per-feature — reuse existing backend endpoints where they fit; build new mobile-shaped endpoints only where nothing exists.
- **Execution:** sequential vertical slices; finish + verify each before the next.
- **Entra config:** treated as out-of-scope ops work. Code + a documented config contract are delivered; a Development-only dev-token path enables end-to-end testing without a live tenant.

## Program decomposition (slice order)

| Slice | Title | Summary |
|-------|-------|---------|
| **0** | HTTP plumbing & auth foundation | Flip adapter to `http`; OIDC login (social + email/pw via Entra); token storage + silent refresh; wire `/employee` profile read/update. Unblocks everything. |
| **1** | Time clock | New employee-facing `/employee/time/*` endpoints (clock in/out, break start/end, session, entries, overview) reusing `TimePunch`/`TimeEntry` domain; wire mobile `time` repository. |
| **2** | Documents | Wire list/download to existing `/employee/documents`; add upload + contract-sign endpoints (new); wire mobile `documents` repository. |
| **3** | Schedule + Home + Notifications | New employee shift/availability/request domain, `/employee/home` aggregate, notifications domain. Largest; sub-split during planning. |

Each slice = backend endpoints + tests → mobile HTTP adapter + transformer wiring → verification. Each gets its own implementation plan.

---

## Slice 0 — HTTP plumbing & auth foundation (this design)

### Goal

A real employee signs in end-to-end against the backend (social or email/password via Entra External ID), the app holds a scoped JWT with silent refresh, and reads/updates the real employee profile. The adapter runs on `http`.

### Mobile architecture

- **`src/services/api/httpClient.ts` (new):** wraps the existing `apisauce` instance (`src/services/api/index.ts`). Adds:
  - request transform injecting `Authorization: Bearer <accessToken>`;
  - response interceptor: on `401`, call `/auth/refresh` **once**, retry the original request, else clear session and surface auth error;
  - `withCredentials` so the backend's HTTP-only refresh-token cookie is sent/stored;
  - access token kept in memory and persisted to **`expo-secure-store`**; cleared on sign-out.
- **`src/services/auth/oidc.ts` (new):** `expo-auth-session` PKCE flow against the Entra External ID authority. Returns the Entra `id_token`. Social and local email/password are IdPs configured *inside* the Entra user flow — the app calls one authorize endpoint; Entra renders provider choice. Native Apple/Google buttons are a later enhancement, not required for this slice.
- **`createHttpAuthRepository()` + `createHttpProfileRepository()` (new in `repositories.ts`):** replace the throwing stubs (`repositories.ts:562-621`). Flip `repositories.ts:682` to `Config.API_URL ? "http" : "mock"`.
- **Auth flow mapping (`AuthRepository`):**
  - `signIn` / social → OIDC → `POST /api/v1/auth/employees/login` (returns memberships) → `POST /api/v1/auth/employees/select-employer` (scoped token + refresh cookie). When exactly one membership exists, auto-select; otherwise present an employer picker.
  - `register`, `requestPasswordReset`, `resetPassword` → redirect into the Entra hosted user flow (signup / reset) rather than POSTing credentials to our API. Mobile screens become "continue with email" entry points.
  - `getSession` → read stored access token; if expired, silent `/auth/refresh`; map to `AppSession`.
  - `signOut` → `POST /api/v1/auth/revoke` + clear secure storage + clear cookie.
  - `changePassword` → Entra hosted flow (or hidden for this slice).
- **Profile (`ProfileRepository`):** `getProfile` → `GET /api/v1/employee` (`EmployeeDto`) mapped via a new transformer to the domain `UserProfile`; `updateProfile` → `PUT /api/v1/employee` (`UpdateMyEmployeeDto`). `getEmployers`/`joinEmployer` deferred to a later slice (employer-join is invite-driven on the backend); for Slice 0 they may remain mock-backed or return the membership list from login.
- **`accountId` semantics:** the mock repositories are `accountId`-keyed. With a real backend the JWT identifies the user, so HTTP repositories ignore the passed `accountId` (the token is the identity). The repository interfaces are unchanged to avoid churn; this is documented at the seam.
- **DTO boundary:** per project rule, no generated `*Dto` types leak into Vue/RN domain code — every backend DTO is mapped to a domain model in a transformer in the service layer.

### Backend work

1. **Refresh token for employee scoped session (the one real fix).** `employees/select-employer` (`AuthController.cs:187`) and `SelectEmployerSessionUseCase` (`SelectEmployerSessionUseCase.cs:38`) currently return only an `AccessTokenDto` — no refresh token, unlike employer login (`AuthController.cs:96-97`). Issue and append a refresh-token cookie for the employee scoped token so the mobile app can silently refresh. Apply the same to `employee-invitations/accept` for consistency.
2. **Development-only dev-token path.** Add a Development-gated `IExternalIdTokenValidator` implementation that accepts a signed dev token encoding `{ objectId, email, name }`, enabling integration tests of login → select-employer → profile without a live Entra tenant. Selected via configuration; never registered in non-Development environments.
3. **Dev seed.** Ensure a Development employee with an employer membership and an Entra object-id matching the dev token exists, so `employees/login` returns a membership and `select-employer` succeeds.
4. **Config contract.** Document required Entra settings (authority/tenant, employee app client id, user-flow/policy name, scopes/audience) in `appsettings` + a short ops note. No secrets committed.

Email/password, signup, and password reset are handled by the Entra hosted user flow (same `id_token` path); **no backend credential endpoints are added**.

### Components & boundaries

- **`oidc.ts`** — input: provider intent; output: `id_token`. Depends on Entra config only. Testable by mocking `expo-auth-session`.
- **`httpClient.ts`** — input: requests; output: authed responses with refresh handling. Depends on token storage. Testable with a mocked apisauce.
- **`auth.transformer` / `profile.transformer`** — pure DTO→domain mappers. Testable in isolation.
- **HTTP repositories** — orchestrate client + transformers behind the existing repository interfaces. Swappable with mock via the adapter selector.
- **Backend:** the change is localized to the auth use-cases/controller and a dev validator registration; the employee self-service controller is reused unchanged.

### Error handling

- Map backend `ProblemDetails` / `401` / `400` to the existing `AuthError` / `ProfileError` domain unions via `apiProblem.ts`.
- Refresh is attempted **once** per failed request; a failed refresh clears the session and routes to login.
- Network/timeout errors surface as a retriable transport error, not an auth error.
- Login edge cases: no memberships → actionable "no employer linked" state; inactive employee (`select-employer` returns 401) → clear message.

### Testing strategy

- **Backend:** unit tests for refresh-on-select-employer and the dev-token validator; existing auth use-case tests remain green; `dotnet build` + `dotnet test` pass.
- **Mobile:** `pnpm check` + `pnpm lint:check` pass; unit tests for `httpClient` (token inject, 401→refresh→retry), `oidc` (mocked), and the profile transformer, following `maes-mobile-testing` conventions.
- **Manual E2E:** run app against local API; sign in via dev path; land on home with real profile; force token expiry to prove silent refresh; sign out clears session.

### Exit criteria

A real employee can sign in against the local backend; the app shows their real profile; token refresh and sign-out work; the adapter runs on `http`. Other features may still be mock-backed (wired in later slices).

### Risks / open items

- Entra tenant + user-flow configuration is ops work; the dev-token path covers testing until it lands.
- `getEmployers`/`joinEmployer` real semantics (invite/QR claim) are deferred — Slice 0 keeps them mock or membership-list backed; revisited in a later slice.
- Multi-employer membership UX (picker) is in scope only as far as needed to pick a token; richer employer-switching is later.
