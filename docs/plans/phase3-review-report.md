# Phase 3 — Review Report

Branch: `feat/mobile-11star-phase3-crosscutting`  
Date: 2026-06-20  
Fix commit: `586cb98`

---

## 1. Persistence Safety — Findings & Fixes

### 1a. CRITICAL: Persisted cache not cleared on sign-out (FIXED)

**Finding**: `useSignOutMutation.onSuccess` called `queryClient.removeQueries()` on the in-memory
cache only. It did not call `persister.removeClient()`. This left PII (profile, schedule, time
entries, planning data) in the MMKV file on disk. On the next cold start (potentially by a
different user on a shared device), `PersistQueryClientProvider` hydrated that stale cache before
any fresh queries resolved — User A could briefly see User B's data.

**Fix** (`src/features/auth/data/auth.mutations.ts`):  
Added `void queryPersister.removeClient()` in `useSignOutMutation.onSuccess` after clearing
in-memory queries. This wipes the `rq-cache-v1` MMKV key at the moment of sign-out.

### 1b. Auth session persisted to disk (FIXED)

**Finding**: The `["auth", "session"]` query was being serialised into the persisted cache. On cold
start it could hydrate a stale session (non-null `accountId`) from a previous run before
`initialData` from the in-memory store resolved. This created a brief window where the app rendered
as signed-in even after a sign-out-and-restart.

**Fix** (`src/app/_layout.tsx`):  
Added `shouldDehydrateQuery` to `dehydrateOptions` that excludes the auth session query key:

```ts
shouldDehydrateQuery: (query) =>
  query.queryKey[0] !== appQueryKeys.session[0] ||
  query.queryKey[1] !== appQueryKeys.session[1],
```

The auth session is authoritative from the native secure store via `initialData`; it must not come
from the persisted cache.

### 1c. Singleton persister (FIXED)

**Finding**: `_layout.tsx` called `createMmkvPersister()` to create a local `persister` constant.
Auth mutations could not reach this instance to call `removeClient()` without coupling to the
layout or introducing circular imports.

**Fix** (`src/services/app/query.persister.ts`):  
Exported a `queryPersister` singleton created at module load time. Both `_layout.tsx` and
`auth.mutations.ts` import this singleton, ensuring they reference the same persister instance.

### 1d. MMKV encryption

MMKV is created via `createMMKV({ id: "vesta-mobile.storage" })` without an `encryptionKey`. The
storage is therefore plaintext on device. For a shared-device scenario this is a concern, but for
a personal mobile device it is acceptable — the file is inside the app sandbox (not accessible to
other apps without jailbreak). Encryption can be added if the threat model requires it by passing
`encryptionKey` to `createMMKV`. This is out of scope for phase 3 but noted as a follow-up.

### 1e. Auth tokens in the query cache

Auth tokens are not stored in the React Query cache — the `["auth", "session"]` query returns an
`AppSession` model that contains `accountId`, `isSignedIn`, and `needsOnboarding`, not raw
credential tokens. Tokens live in the mock backend store (MMKV, separate key) or, in the real
backend path, in the HTTP-only cookie / secure native store. No token leakage via the query cache.

### 1f. buster / maxAge / gcTime consistency

- `maxAge: 24 h` matches `gcTime: 24 h` — correct; React Query will not GC entries that the
  persister would restore.
- `staleTime: 30 s` — short enough to trigger a background refresh on mount, long enough to avoid
  request storms on fast navigation.
- `buster: "v1"` — must be bumped when any cached query's response shape changes incompatibly. A
  comment was added in `_layout.tsx` to remind maintainers.

---

## 2. Query Defaults Correctness

All defaults are sound:

| Default | Value | Assessment |
|---|---|---|
| `mutations.retry` | `false` | Correct — no silent duplicate writes |
| `queries.retry` | skips 401/403; ≤3 attempts | Correct — auth failures are not retried |
| `queries.retryDelay` | exponential, capped at 30 s | Correct |
| `queries.refetchOnReconnect` | `true` | Correct |
| `queries.gcTime` | 24 h | Matched to `maxAge` |
| `queries.staleTime` | 30 s | Reasonable; per-query overrides remain possible |

No existing features were affected — the defaults apply globally but each query/mutation can
override them individually.

---

## 3. Accessibility — Spot-check Results

All a11y changes from phase 3 are correct:

- **Pill / StatusBadge / MetaPill**: `accessible + accessibilityRole="text" + accessibilityLabel`
  on the outer View; inner decorative dot hidden via `accessibilityElementsHidden +
  importantForAccessibility="no-hide-descendants"` (both platforms covered).
- **Decorative icons** (chevron, building, document, checkmark): wrapped in hidden Views as
  described above. Screen readers receive no noise from them.
- **DecideButton**: `accessibilityLabel` added; `hitSlop={6}` + `paddingVertical: 10` → effective
  tap area ≈ 46 pt, meeting the 44 pt WCAG recommendation.
- **CallModeBadge / ClaimedBadge**: correct `accessibilityRole="text"` with meaningful labels.

One note: `accessibilityRole="text"` on a `View` is not a standard ARIA role in React Native — RN
maps it to `staticText` on iOS and plain `View` on Android. The role causes no harm (screen readers
read the label correctly), but if strict role conformance is required, these could be changed to
`accessibilityRole={undefined}` with just `accessible + accessibilityLabel`. This is left as-is
since the current implementation produces the intended screen reader output.

---

## 4. Code Simplification Changes

No duplication or dead code was found in the phase 3 additions beyond the singleton consolidation
already described above. The persister factory function (`createMmkvPersister`) is retained for
testability; the singleton is a thin wrapper around it.

---

## 5. Compile & Test Output

```
tsc --noEmit: 0 errors
Test Suites: 60 passed, 60 total
Tests:       274 passed, 274 total  (+2 vs phase 3 baseline of 272)
```

The 2 new tests cover `queryPersister` singleton shape and the `removeClient` path used on
sign-out.

---

## 6. Remaining Limitations / Follow-ups

1. **MMKV encryption**: The shared `vesta-mobile.storage` MMKV instance is unencrypted. For
   high-sensitivity data (medical, financial) or shared-device deployments, pass an
   `encryptionKey` to `createMMKV`. Deferred.

2. **Employer-switch cache isolation**: There is no employer-switch flow in the current mobile app.
   All user data queries are already scoped by `accountId` in their query keys (e.g.
   `["profile", accountId, "detail"]`), so switching accounts would naturally fetch fresh data.
   When sign-out clears the persisted cache (this fix), stale data from the previous account is
   gone. If employer-switch without sign-out is added later, a targeted `removeQueries` + cache
   wipe will be needed at that point.

3. **buster tooling**: Incrementing `buster` on shape changes is a manual convention. Consider a
   script or comment-lint rule to enforce this when query response DTOs change.

4. **`act()` warnings in planning.test.tsx**: Pre-existing; unrelated to phase 3.
