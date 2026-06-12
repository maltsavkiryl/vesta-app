# Slice 0 — HTTP Plumbing & Auth Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A real employee signs in against the backend (social or email/password via Entra External ID, or a Development dev-token), the app holds a short-lived backend JWT with silent re-auth, and reads/updates the real employee profile — while the not-yet-migrated features keep working on mock data.

**Architecture:** Mobile gains an OIDC/dev token provider, a secure token store, an auth-orchestration service (Entra id_token → `employees/login` → `select-employer` → backend JWT), an authed `apisauce` http client with 401→silent-re-auth, and HTTP `auth`+`profile` repositories behind the existing repository interfaces. The composition root runs `auth`+`profile` over HTTP and the rest over mock (bridged by lazily seeding a mock account for the real `accountId`). Backend gains a Development-only dev-token validator + a Development employee/membership seed; no other backend changes.

**Tech Stack:** Expo / React Native / TypeScript, `expo-auth-session` + `expo-web-browser` + `expo-secure-store` + `expo-crypto`, `apisauce`, `@tanstack/react-query`, jest (`jest-expo`); .NET 10, xUnit + Moq.

**Two repos:**
- Mobile: `/Users/kirylmaltsav/Workspace/vesta-mobile` (branch `feat/backend-integration`)
- Backend: `/Users/kirylmaltsav/Workspace/vestatime-api` (branch a new `feat/employee-mobile-auth` off current)

**Backend contracts (verbatim, for reference):**
- `POST /api/v1/auth/employees/login` body `ExternalIdentityLoginDto { IdToken: string }` → `ExternalEmployeeLoginResultDto { Memberships: EmployerMembershipDto[] }`, `EmployerMembershipDto { EmployerUniqueCode: Guid, EmployerName: string }`.
- `POST /api/v1/auth/employees/select-employer` body `SelectEmployerSessionDto { IdToken: string, EmployerUniqueCode: Guid }` → `AccessTokenDto { access_token, token_type, expires_in, profile_complete }`.
- `GET /api/v1/employee` → `EmployeeDto`; `PUT /api/v1/employee` body `UpdateMyEmployeeDto` → `AccessTokenDto`.
- `IExternalIdTokenValidator.ValidateAsync(token) → MicrosoftIdentityTokenClaims { ObjectId, Email?, Name?, EmailVerified }`.

---

## Backend

### Task B1: Development-only dev-token validator

**Files:**
- Create: `apps/api/src/Vesta.Workforce.Infrastructure.Identity/DevExternalIdTokenValidator.cs`
- Modify: `apps/api/src/Vesta.Workforce.Infrastructure.Identity/ServiceCollectionExtensions.cs` (the `AddInfraIdentity` method, around the `services.AddSingleton<IExternalIdTokenValidator, ExternalIdTokenValidator>();` line)
- Test: `apps/api/tests/Vesta.Workforce.Application.Tests/UnitTests/Auth/DevExternalIdTokenValidator_Tests.cs`

**Dev-token contract:** the token is `base64url(UTF8(JSON))` where JSON is `{ "objectId": "...", "email": "...", "name": "..." }`. No signature (Development-only, registered only when `Auth:EnableDevTokens=true`).

- [ ] **Step 1: Write the failing test**

```csharp
using System.Text;
using System.Text.Json;
using Vesta.Workforce.Infrastructure.Identity;
using Xunit;

namespace Vesta.Workforce.Application.Tests.UnitTests.Auth;

public class DevExternalIdTokenValidator_Tests
{
    private static string Encode(object payload)
    {
        var json = JsonSerializer.Serialize(payload);
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(json))
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    [Fact]
    public async Task ValidateAsync_ReturnsClaims_ForWellFormedDevToken()
    {
        var sut = new DevExternalIdTokenValidator();
        var token = Encode(new { objectId = "oid-123", email = "demo@vesta.local", name = "Demo Employee" });

        var claims = await sut.ValidateAsync(token);

        Assert.NotNull(claims);
        Assert.Equal("oid-123", claims!.ObjectId);
        Assert.Equal("demo@vesta.local", claims.Email);
        Assert.Equal("Demo Employee", claims.Name);
        Assert.True(claims.EmailVerified);
    }

    [Fact]
    public async Task ValidateAsync_ReturnsNull_ForGarbage()
    {
        var sut = new DevExternalIdTokenValidator();
        Assert.Null(await sut.ValidateAsync("not-a-token"));
    }

    [Fact]
    public async Task ValidateAsync_ReturnsNull_WhenObjectIdMissing()
    {
        var sut = new DevExternalIdTokenValidator();
        var token = Encode(new { email = "demo@vesta.local" });
        Assert.Null(await sut.ValidateAsync(token));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test apps/api/tests/Vesta.Workforce.Application.Tests --filter DevExternalIdTokenValidator_Tests`
Expected: FAIL — `DevExternalIdTokenValidator` does not exist (compile error).

- [ ] **Step 3: Write minimal implementation**

```csharp
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Vesta.Workforce.Application.Abstractions.Identity;

namespace Vesta.Workforce.Infrastructure.Identity;

/// <summary>
/// Development-only validator that accepts an unsigned base64url(JSON) dev token.
/// Registered exclusively when <c>Auth:EnableDevTokens</c> is true; never in production.
/// </summary>
public sealed class DevExternalIdTokenValidator : IExternalIdTokenValidator
{
    public Task<MicrosoftIdentityTokenClaims?> ValidateAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            var padded = token.Replace('-', '+').Replace('_', '/');
            padded = padded.PadRight(padded.Length + (4 - padded.Length % 4) % 4, '=');
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(padded));
            var payload = JsonSerializer.Deserialize<DevTokenPayload>(json);

            if (payload is null || string.IsNullOrWhiteSpace(payload.ObjectId))
                return Task.FromResult<MicrosoftIdentityTokenClaims?>(null);

            return Task.FromResult<MicrosoftIdentityTokenClaims?>(
                new MicrosoftIdentityTokenClaims(payload.ObjectId, payload.Email, payload.Name, true));
        }
        catch
        {
            return Task.FromResult<MicrosoftIdentityTokenClaims?>(null);
        }
    }

    private sealed record DevTokenPayload(
        [property: JsonPropertyName("objectId")] string? ObjectId,
        [property: JsonPropertyName("email")] string? Email,
        [property: JsonPropertyName("name")] string? Name);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test apps/api/tests/Vesta.Workforce.Application.Tests --filter DevExternalIdTokenValidator_Tests`
Expected: PASS (3 tests).

- [ ] **Step 5: Gate DI registration on config flag**

In `ServiceCollectionExtensions.cs`, replace the line `services.AddSingleton<IExternalIdTokenValidator, ExternalIdTokenValidator>();` with:

```csharp
if (config.GetValue<bool>("Auth:EnableDevTokens"))
    services.AddSingleton<IExternalIdTokenValidator, DevExternalIdTokenValidator>();
else
    services.AddSingleton<IExternalIdTokenValidator, ExternalIdTokenValidator>();
```

- [ ] **Step 6: Build to verify wiring compiles**

Run: `dotnet build apps/api/src/Vesta.Workforce.Api`
Expected: Build succeeded.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/Vesta.Workforce.Infrastructure.Identity/DevExternalIdTokenValidator.cs \
        apps/api/src/Vesta.Workforce.Infrastructure.Identity/ServiceCollectionExtensions.cs \
        apps/api/tests/Vesta.Workforce.Application.Tests/UnitTests/Auth/DevExternalIdTokenValidator_Tests.cs
git commit -m "feat(auth): Development-only dev-token external-id validator"
```

### Task B2: Development employee + mobile-account membership seed

**Goal:** With `Auth:EnableDevTokens=true`, a dev token for `objectId=dev-employee-oid` resolves through `employees/login` to exactly one membership, and `select-employer` returns a 200 `AccessTokenDto`.

**Files (investigation-first — exact paths discovered in Step 1):**
- Read: the existing Development/bootstrap seeder (search), the `EmployeeMobileAccount` entity + its membership type, `IEmployeeMobileAccountRepository` impl (`apps/api/src/Vesta.Workforce.Infrastructure.Persistence/Repositories/Employee/EmployeeMobileAccountRepository.cs`).
- Modify/Create: the Development seeder to add one active `Employee` under an existing seeded employer + an `EmployeeMobileAccount` row mapping `dev-employee-oid` → that employer's employee.

- [ ] **Step 1: Locate the seeding infrastructure**

Run:
```bash
grep -rln "Seed\|Bootstrap\|ISeeder\|HostedService" apps/api/src --include=*.cs | grep -iv "/bin/\|/obj/" | grep -i "seed\|bootstrap"
```
Read the Development seeder it surfaces and `EmployeeMobileAccountRepository.cs` to learn the entity shape (`EmployeeMobileAccount`, its `Memberships`, `EntraObjectId`, link to `Employee.UniqueCode` + `Employer.UniqueCode`). Confirm how `FindOrCreateByEntraObjectIdAsync` and `GetEmployeeUniqueCodeAsync` read membership rows.

- [ ] **Step 2: Add the dev seed (Development + EnableDevTokens only)**

Following the existing seeder's pattern and idempotency style, seed (only when `Auth:EnableDevTokens` is true and environment is Development):
- an active `Employee` (`FirstName="Demo"`, `LastName="Employee"`, `Email="demo.employee@vesta.local"`, `IsActive=true`) under the first seeded employer, capturing its `EmployerUniqueCode`;
- an `EmployeeMobileAccount` with `EntraObjectId="dev-employee-oid"`, `Email="demo.employee@vesta.local"`, and one membership row linking that `EmployerUniqueCode` to the seeded employee's `UniqueCode`.

Make it idempotent: skip if an `EmployeeMobileAccount` with `EntraObjectId="dev-employee-oid"` already exists.

- [ ] **Step 3: Configure dev flag locally**

In `apps/api/src/Vesta.Workforce.Api/appsettings.Development.json`, add:
```json
"Auth": { "EnableDevTokens": true }
```

- [ ] **Step 4: Run the API and verify the chain by hand**

Run (Development): `dotnet run --project apps/api/src/Vesta.Workforce.Api` (note the listening URL).
Then, with `DEV_TOKEN` = base64url of `{"objectId":"dev-employee-oid","email":"demo.employee@vesta.local","name":"Demo Employee"}` and `APIKEY` from `appsettings.Development.json`:
```bash
# login → expect one membership with an employerUniqueCode
curl -s -X POST "$BASE/api/v1/auth/employees/login" -H "X-API-Key: $APIKEY" \
  -H "Content-Type: application/json" -d "{\"idToken\":\"$DEV_TOKEN\"}"
# select-employer → expect 200 with access_token
curl -s -X POST "$BASE/api/v1/auth/employees/select-employer" -H "X-API-Key: $APIKEY" \
  -H "Content-Type: application/json" -d "{\"idToken\":\"$DEV_TOKEN\",\"employerUniqueCode\":\"<from-login>\"}"
```
Expected: login returns `{ "memberships": [ { "employerUniqueCode": "...", "employerName": "..." } ] }`; select-employer returns an `access_token`.

- [ ] **Step 5: Verify profile endpoint with the issued token**

```bash
curl -s "$BASE/api/v1/employee" -H "Authorization: Bearer <access_token>"
```
Expected: 200 with an `EmployeeDto` JSON for Demo Employee.

- [ ] **Step 6: Commit**

```bash
git add -A apps/api/src/Vesta.Workforce.Infrastructure.Persistence apps/api/src/Vesta.Workforce.Api/appsettings.Development.json
git commit -m "feat(dev): seed Development employee + mobile-account membership for dev-token login"
```

### Task B3: Document the Entra config contract

**Files:**
- Modify: `apps/api/src/Vesta.Workforce.Api/appsettings.json` (add an `Auth:EnableDevTokens: false` default + a commented/empty `EntraExternalId` section if not already present)
- Create: `apps/api/docs/employee-mobile-auth.md`

- [ ] **Step 1: Add safe defaults to appsettings.json**

Ensure `appsettings.json` contains `"Auth": { "EnableDevTokens": false }` (production-safe default) without committing any secret.

- [ ] **Step 2: Write the ops note**

Create `apps/api/docs/employee-mobile-auth.md` documenting: the employee login → select-employer flow; that the Entra External ID **user flow** must federate Google/Apple/Facebook and enable local email/password; the required settings consumed by `EntraExternalIdOptions` (MetadataAddress / Issuer / ClientId / audience) and where they live; and that `Auth:EnableDevTokens` must remain `false` outside Development.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/Vesta.Workforce.Api/appsettings.json apps/api/docs/employee-mobile-auth.md
git commit -m "docs(auth): employee mobile auth config contract"
```

---

## Mobile

> Run all mobile commands from `/Users/kirylmaltsav/Workspace/vesta-mobile`. Single test: `pnpm test -- <file>`. Full gate: `pnpm check && pnpm lint:check`.

### Task M1: Add auth dependencies

**Files:**
- Modify: `package.json` (via installer)

- [ ] **Step 1: Install Expo auth/storage packages**

Run: `pnpm expo install expo-auth-session expo-web-browser expo-secure-store expo-crypto`
Expected: the four packages added to `dependencies` with Expo-compatible versions.

- [ ] **Step 2: Verify typecheck still passes**

Run: `pnpm compile`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add expo-auth-session, web-browser, secure-store, crypto"
```

### Task M2: Auth configuration keys

**Files:**
- Modify: `src/config/config.base.ts`, `src/config/config.dev.ts`, `src/config/config.prod.ts`
- Test: `src/config/config.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import Config from "@/config"

describe("auth config", () => {
  it("exposes an AUTH block with the dev-token flag and entra fields", () => {
    expect(typeof Config.AUTH.devTokenEnabled).toBe("boolean")
    expect(typeof Config.AUTH.entra.authority).toBe("string")
    expect(typeof Config.AUTH.entra.clientId).toBe("string")
    expect(Array.isArray(Config.AUTH.entra.scopes)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- config.test.ts`
Expected: FAIL — `Config.AUTH` is undefined.

- [ ] **Step 3: Extend the config shape**

In `config.base.ts`, add to `ConfigBaseProps`:
```typescript
  AUTH: {
    devTokenEnabled: boolean
    devObjectId: string
    devEmail: string
    devName: string
    entra: {
      authority: string
      clientId: string
      scopes: string[]
    }
  }
```
And to the base value object:
```typescript
  AUTH: {
    devTokenEnabled: false,
    devObjectId: "dev-employee-oid",
    devEmail: "demo.employee@vesta.local",
    devName: "Demo Employee",
    entra: { authority: "", clientId: "", scopes: ["openid", "profile", "email", "offline_access"] },
  },
```
In `config.dev.ts` add `AUTH: { devTokenEnabled: true }` merged appropriately (override only the flag; keep base entra/dev values). In `config.prod.ts` add `AUTH: { devTokenEnabled: false }`. Match the file's existing merge style (the dev/prod files currently set top-level keys; mirror that with a nested `AUTH` partial that the `index.ts` merge already deep-or-shallow merges — if the merge is shallow, set the full `AUTH` object in each file).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- config.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config
git commit -m "feat(config): add AUTH (entra + dev-token) configuration"
```

### Task M3: Secure token store

**Files:**
- Create: `src/services/auth/tokenStore.ts`
- Test: `src/services/auth/tokenStore.test.ts`

The store holds the backend JWT `{ accessToken, expiresAt }`. Backed by `expo-secure-store`, with an in-memory cache so synchronous reads in interceptors are possible after an initial load.

- [ ] **Step 1: Write the failing test**

```typescript
const store: Record<string, string> = {}
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (k: string) => store[k] ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => { store[k] = v }),
  deleteItemAsync: jest.fn(async (k: string) => { delete store[k] }),
}))

import { tokenStore } from "./tokenStore"

describe("tokenStore", () => {
  beforeEach(async () => { await tokenStore.clear() })

  it("persists and returns the access token", async () => {
    await tokenStore.set({ accessToken: "jwt-abc", expiresAt: 9999999999000 })
    expect(tokenStore.getAccessToken()).toBe("jwt-abc")
    const reloaded = await tokenStore.load()
    expect(reloaded?.accessToken).toBe("jwt-abc")
  })

  it("reports expiry", async () => {
    await tokenStore.set({ accessToken: "x", expiresAt: 1000 })
    expect(tokenStore.isExpired(2000)).toBe(true)
    expect(tokenStore.isExpired(500)).toBe(false)
  })

  it("clears", async () => {
    await tokenStore.set({ accessToken: "x", expiresAt: 9999999999000 })
    await tokenStore.clear()
    expect(tokenStore.getAccessToken()).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tokenStore.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the store**

```typescript
import * as SecureStore from "expo-secure-store"

const KEY = "vesta-mobile.backend-token"

export interface BackendToken {
  accessToken: string
  expiresAt: number // epoch ms
}

let cache: BackendToken | null = null

export const tokenStore = {
  async load(): Promise<BackendToken | null> {
    const raw = await SecureStore.getItemAsync(KEY)
    cache = raw ? (JSON.parse(raw) as BackendToken) : null
    return cache
  },
  async set(token: BackendToken): Promise<void> {
    cache = token
    await SecureStore.setItemAsync(KEY, JSON.stringify(token))
  },
  getAccessToken(): string | null {
    return cache?.accessToken ?? null
  },
  isExpired(nowMs: number): boolean {
    return !cache || cache.expiresAt <= nowMs
  },
  async clear(): Promise<void> {
    cache = null
    await SecureStore.deleteItemAsync(KEY)
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tokenStore.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/auth/tokenStore.ts src/services/auth/tokenStore.test.ts
git commit -m "feat(auth): secure backend-token store"
```

### Task M4: Identity-token provider (Entra OIDC + dev token)

**Files:**
- Create: `src/services/auth/identityProvider.ts`
- Test: `src/services/auth/identityProvider.test.ts`

Exposes `acquireIdToken(): Promise<string>` and `refreshIdToken(): Promise<string>`. When `Config.AUTH.devTokenEnabled`, both return a synchronous base64url dev token built from `Config.AUTH.dev*`. Otherwise they delegate to `expo-auth-session` (PKCE) against `Config.AUTH.entra`. Also `signOutIdentity(): Promise<void>`.

- [ ] **Step 1: Write the failing test (dev-token branch only — the real OIDC branch is covered by manual E2E)**

```typescript
jest.mock("@/config", () => ({
  __esModule: true,
  default: {
    AUTH: {
      devTokenEnabled: true,
      devObjectId: "dev-employee-oid",
      devEmail: "demo.employee@vesta.local",
      devName: "Demo Employee",
      entra: { authority: "", clientId: "", scopes: [] },
    },
  },
}))

import { acquireIdToken } from "./identityProvider"

function decode(token: string) {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/")
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"))
}

describe("identityProvider (dev)", () => {
  it("returns a base64url dev token encoding the configured identity", async () => {
    const token = await acquireIdToken()
    const payload = decode(token)
    expect(payload.objectId).toBe("dev-employee-oid")
    expect(payload.email).toBe("demo.employee@vesta.local")
    expect(payload.name).toBe("Demo Employee")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- identityProvider.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the provider**

```typescript
import * as AuthSession from "expo-auth-session"
import Config from "@/config"

function base64url(input: string): string {
  // btoa is available in the RN/Hermes runtime; fall back to Buffer in tests.
  const b64 = typeof btoa === "function" ? btoa(input) : Buffer.from(input, "utf8").toString("base64")
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function devToken(): string {
  return base64url(
    JSON.stringify({
      objectId: Config.AUTH.devObjectId,
      email: Config.AUTH.devEmail,
      name: Config.AUTH.devName,
    }),
  )
}

let cachedTokens: AuthSession.TokenResponse | null = null

async function discovery() {
  return AuthSession.fetchDiscoveryAsync(Config.AUTH.entra.authority)
}

function redirectUri(): string {
  return AuthSession.makeRedirectUri({ scheme: "vesta" })
}

export async function acquireIdToken(): Promise<string> {
  if (Config.AUTH.devTokenEnabled) return devToken()

  const d = await discovery()
  const request = new AuthSession.AuthRequest({
    clientId: Config.AUTH.entra.clientId,
    scopes: Config.AUTH.entra.scopes,
    redirectUri: redirectUri(),
    usePKCE: true,
  })
  const result = await request.promptAsync(d)
  if (result.type !== "success" || !result.params.code) {
    throw new Error("entra-auth-cancelled")
  }
  cachedTokens = await AuthSession.exchangeCodeAsync(
    {
      clientId: Config.AUTH.entra.clientId,
      code: result.params.code,
      redirectUri: redirectUri(),
      extraParams: { code_verifier: request.codeVerifier ?? "" },
    },
    d,
  )
  if (!cachedTokens.idToken) throw new Error("entra-no-id-token")
  return cachedTokens.idToken
}

export async function refreshIdToken(): Promise<string> {
  if (Config.AUTH.devTokenEnabled) return devToken()
  if (!cachedTokens?.refreshToken) return acquireIdToken()

  const d = await discovery()
  cachedTokens = await AuthSession.refreshAsync(
    { clientId: Config.AUTH.entra.clientId, refreshToken: cachedTokens.refreshToken },
    d,
  )
  if (!cachedTokens.idToken) throw new Error("entra-no-id-token")
  return cachedTokens.idToken
}

export async function signOutIdentity(): Promise<void> {
  cachedTokens = null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- identityProvider.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/auth/identityProvider.ts src/services/auth/identityProvider.test.ts
git commit -m "feat(auth): identity-token provider (Entra OIDC + dev token)"
```

### Task M5: Auth API DTOs + transformers

**Files:**
- Create: `src/features/auth/data/auth.api.ts` (request/response DTO types + transformers)
- Test: `src/features/auth/data/auth.api.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { toAppSessionFromToken, decodeJwtExp } from "./auth.api"

describe("auth.api transformers", () => {
  it("maps an access-token response + accountId to an AppSession", () => {
    const session = toAppSessionFromToken(
      { access_token: "x", token_type: "Bearer", expires_in: 300, profile_complete: true },
      "emp-uuid",
      "2026-06-12T10:00:00.000Z",
    )
    expect(session).toEqual({
      accountId: "emp-uuid",
      isSignedIn: true,
      needsOnboarding: false,
      signedInAt: "2026-06-12T10:00:00.000Z",
    })
  })

  it("flags onboarding when profile is incomplete", () => {
    const session = toAppSessionFromToken(
      { access_token: "x", token_type: "Bearer", expires_in: 300, profile_complete: false },
      "emp-uuid",
      "2026-06-12T10:00:00.000Z",
    )
    expect(session.needsOnboarding).toBe(true)
  })

  it("reads exp from a JWT payload", () => {
    // {"exp":1893456000}
    const jwt = "h." + Buffer.from(JSON.stringify({ exp: 1893456000 })).toString("base64") + ".s"
    expect(decodeJwtExp(jwt)).toBe(1893456000)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- auth.api.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement DTOs + transformers**

```typescript
import type { AppSession } from "@/services/app/app.session"

export interface AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  profile_complete: boolean
}

export interface EmployerMembershipResponse {
  employerUniqueCode: string
  employerName: string
}

export interface EmployeeLoginResponse {
  memberships: EmployerMembershipResponse[]
}

export function decodeJwtExp(jwt: string): number | null {
  const parts = jwt.split(".")
  if (parts.length < 2) return null
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8")
    const payload = JSON.parse(json) as { exp?: number }
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

export function toAppSessionFromToken(
  token: AccessTokenResponse,
  accountId: string,
  signedInAt: string,
): AppSession {
  return {
    accountId,
    isSignedIn: true,
    needsOnboarding: !token.profile_complete,
    signedInAt,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- auth.api.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/data/auth.api.ts src/features/auth/data/auth.api.test.ts
git commit -m "feat(auth): backend auth DTOs + session/jwt transformers"
```

### Task M6: Authed HTTP client

**Files:**
- Create: `src/services/api/httpClient.ts`
- Test: `src/services/api/httpClient.test.ts`

Wraps `apisauce`. Injects `Authorization: Bearer` from `tokenStore`. On a `401`, calls an injected `reauthenticate()` once, then retries the original request once; if re-auth fails or the retry still 401s, returns the failed response. Re-auth is injected (not imported) to avoid a cycle with the auth service.

- [ ] **Step 1: Write the failing test**

```typescript
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}))

import { tokenStore } from "@/services/auth/tokenStore"
import { createHttpClient } from "./httpClient"

describe("httpClient", () => {
  it("retries once after re-auth on 401", async () => {
    await tokenStore.set({ accessToken: "stale", expiresAt: Date.now() + 60000 })
    let calls = 0
    const apisauce: any = {
      axiosInstance: { interceptors: { request: { use: jest.fn() } } },
      get: jest.fn(async () => {
        calls += 1
        return calls === 1 ? { ok: false, status: 401, problem: "CLIENT_ERROR" } : { ok: true, status: 200, data: { hi: true } }
      }),
      setHeader: jest.fn(),
    }
    const reauthenticate = jest.fn(async () => {
      await tokenStore.set({ accessToken: "fresh", expiresAt: Date.now() + 60000 })
      return true
    })
    const client = createHttpClient(apisauce, reauthenticate)

    const res = await client.get("/employee")

    expect(reauthenticate).toHaveBeenCalledTimes(1)
    expect(calls).toBe(2)
    expect(res.ok).toBe(true)
  })

  it("does not loop when re-auth fails", async () => {
    await tokenStore.set({ accessToken: "stale", expiresAt: Date.now() + 60000 })
    const apisauce: any = {
      axiosInstance: { interceptors: { request: { use: jest.fn() } } },
      get: jest.fn(async () => ({ ok: false, status: 401, problem: "CLIENT_ERROR" })),
      setHeader: jest.fn(),
    }
    const reauthenticate = jest.fn(async () => false)
    const client = createHttpClient(apisauce, reauthenticate)

    const res = await client.get("/employee")

    expect(reauthenticate).toHaveBeenCalledTimes(1)
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- httpClient.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the client**

```typescript
import type { ApiResponse, ApisauceInstance } from "apisauce"
import { tokenStore } from "@/services/auth/tokenStore"

export type Reauthenticate = () => Promise<boolean>

export interface HttpClient {
  get<T>(url: string, params?: object): Promise<ApiResponse<T>>
  post<T>(url: string, body?: object): Promise<ApiResponse<T>>
  put<T>(url: string, body?: object): Promise<ApiResponse<T>>
}

export function createHttpClient(api: ApisauceInstance, reauthenticate: Reauthenticate): HttpClient {
  function authHeaders(): Record<string, string> {
    const token = tokenStore.getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function withRetry<T>(send: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
    const first = await send()
    if (first.status !== 401) return first
    const refreshed = await reauthenticate()
    if (!refreshed) return first
    return send()
  }

  return {
    get: (url, params) => withRetry(() => api.get(url, params, { headers: authHeaders() })),
    post: (url, body) => withRetry(() => api.post(url, body, { headers: authHeaders() })),
    put: (url, body) => withRetry(() => api.put(url, body, { headers: authHeaders() })),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- httpClient.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/services/api/httpClient.ts src/services/api/httpClient.test.ts
git commit -m "feat(api): authed http client with single 401 re-auth retry"
```

### Task M7: Auth service (login orchestration + session)

**Files:**
- Create: `src/services/auth/authService.ts`
- Test: `src/services/auth/authService.test.ts`

Orchestrates: `acquireIdToken` → `POST /auth/employees/login` (pick the only membership; if multiple, the caller supplies a chooser — for Slice 0 auto-pick first and record a TODO) → `POST /auth/employees/select-employer` → store JWT (`tokenStore.set` with `expiresAt` from `decodeJwtExp` or `expires_in`). Provides `signIn()`, `reauthenticate()`, `getCurrentAccountId()`, `signOut()`. The login/select-employer calls use the bare `apisauce` instance with the API-key header (these endpoints use API-key auth, not Bearer).

- [ ] **Step 1: Write the failing test**

```typescript
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}))
jest.mock("./identityProvider", () => ({
  acquireIdToken: jest.fn(async () => "id-token"),
  refreshIdToken: jest.fn(async () => "id-token"),
  signOutIdentity: jest.fn(async () => {}),
}))

import { tokenStore } from "./tokenStore"
import { createAuthService } from "./authService"

function jwtWithExp(expSec: number) {
  return "h." + Buffer.from(JSON.stringify({ exp: expSec })).toString("base64") + ".s"
}

describe("authService", () => {
  beforeEach(async () => { await tokenStore.clear() })

  it("logs in, selects employer, stores the backend jwt", async () => {
    const jwt = jwtWithExp(1893456000)
    const authApi: any = {
      post: jest.fn(async (url: string) => {
        if (url.endsWith("/auth/employees/login"))
          return { ok: true, status: 200, data: { memberships: [{ employerUniqueCode: "emp-1", employerName: "Bistro" }] } }
        if (url.endsWith("/auth/employees/select-employer"))
          return { ok: true, status: 200, data: { access_token: jwt, token_type: "Bearer", expires_in: 300, profile_complete: true } }
        throw new Error("unexpected " + url)
      }),
    }
    const service = createAuthService(authApi)

    const result = await service.signIn()

    expect(result.ok).toBe(true)
    expect(service.getCurrentAccountId()).toBe("emp-1")
    expect(tokenStore.getAccessToken()).toBe(jwt)
  })

  it("returns failure when there are no memberships", async () => {
    const authApi: any = {
      post: jest.fn(async () => ({ ok: true, status: 200, data: { memberships: [] } })),
    }
    const service = createAuthService(authApi)
    const result = await service.signIn()
    expect(result.ok).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- authService.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the service**

```typescript
import type { ApisauceInstance } from "apisauce"
import { failure, success, type Result } from "@/shared/result"
import type { AuthError } from "@/features/auth/data/auth.errors"
import {
  decodeJwtExp,
  type AccessTokenResponse,
  type EmployeeLoginResponse,
} from "@/features/auth/data/auth.api"
import { acquireIdToken, refreshIdToken, signOutIdentity } from "./identityProvider"
import { tokenStore } from "./tokenStore"

let currentAccountId: string | null = null

function expiresAtMs(token: AccessTokenResponse): number {
  const exp = decodeJwtExp(token.access_token)
  return exp ? exp * 1000 : Date.now() + token.expires_in * 1000
}

export function createAuthService(authApi: Pick<ApisauceInstance, "post">) {
  async function exchange(idToken: string): Promise<Result<string, AuthError>> {
    const login = await authApi.post<EmployeeLoginResponse>("/auth/employees/login", { idToken })
    if (!login.ok || !login.data) {
      return failure<AuthError>({ type: "invalid-credentials", message: "Sign-in failed." })
    }
    const memberships = login.data.memberships
    if (memberships.length === 0) {
      return failure<AuthError>({ type: "account-not-found", message: "No employer is linked to this account yet." })
    }
    // TODO(slice-later): present an employer picker when memberships.length > 1.
    const employerUniqueCode = memberships[0].employerUniqueCode

    const selected = await authApi.post<AccessTokenResponse>("/auth/employees/select-employer", {
      idToken,
      employerUniqueCode,
    })
    if (!selected.ok || !selected.data) {
      return failure<AuthError>({ type: "invalid-credentials", message: "Could not start a session for this employer." })
    }
    await tokenStore.set({ accessToken: selected.data.access_token, expiresAt: expiresAtMs(selected.data) })
    currentAccountId = employerUniqueCode
    return success(employerUniqueCode)
  }

  return {
    async signIn(): Promise<Result<string, AuthError>> {
      const idToken = await acquireIdToken()
      return exchange(idToken)
    },
    async reauthenticate(): Promise<boolean> {
      try {
        const idToken = await refreshIdToken()
        const result = await exchange(idToken)
        return result.ok
      } catch {
        return false
      }
    },
    getCurrentAccountId(): string | null {
      return currentAccountId
    },
    async signOut(): Promise<void> {
      currentAccountId = null
      await tokenStore.clear()
      await signOutIdentity()
    },
  }
}

export type AuthService = ReturnType<typeof createAuthService>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- authService.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/services/auth/authService.ts src/services/auth/authService.test.ts
git commit -m "feat(auth): employee login orchestration + session service"
```

### Task M8: Profile transformer

**Files:**
- Create: `src/features/profile/data/profile.transformer.ts`
- Test: `src/features/profile/data/profile.transformer.test.ts`

Maps backend `EmployeeDto` → domain `UserProfile`, and `Partial<UserProfile>` → `UpdateMyEmployeeDto`. Only fields the backend owns are mapped; UI-only fields (preferences, security, privacy, etc.) keep sensible defaults from a provided base profile.

- [ ] **Step 1: Write the failing test**

```typescript
import { toUserProfile, toUpdateMyEmployeeDto } from "./profile.transformer"

const employeeDto = {
  uniqueCode: "emp-uuid",
  firstName: "Demo",
  lastName: "Employee",
  iban: "BE00",
  ssin: "123",
  address: { street: "Main", houseNumber: "1", boxNumber: null, zipCode: "1000", city: "Brussels", country: "BE" },
  email: "demo@vesta.local",
  phoneNumber: "+32",
  culture: "nl-BE",
  isActive: true,
  employerUniqueCode: "emp-1",
  employerName: "Bistro",
}

describe("profile.transformer", () => {
  it("maps EmployeeDto to UserProfile core fields", () => {
    const p = toUserProfile(employeeDto as any)
    expect(p.id).toBe("emp-uuid")
    expect(p.firstName).toBe("Demo")
    expect(p.email).toBe("demo@vesta.local")
    expect(p.phone).toBe("+32")
    expect(p.address.city).toBe("Brussels")
    expect(p.address.postalCode).toBe("1000")
    expect(p.legal.socialSecurityNumber).toBe("123")
    expect(p.bankAccount.iban).toBe("BE00")
    expect(p.language).toBe("nl-BE")
  })

  it("maps a partial UserProfile to UpdateMyEmployeeDto", () => {
    const dto = toUpdateMyEmployeeDto({ firstName: "Newname", phone: "+33", address: { street: "X", postalCode: "2000", city: "Antwerp", country: "BE" } })
    expect(dto.firstName).toBe("Newname")
    expect(dto.phoneNumber).toBe("+33")
    expect(dto.address?.zipCode).toBe("2000")
    expect(dto.address?.city).toBe("Antwerp")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- profile.transformer.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the transformer**

```typescript
import type { UserProfile } from "@/core/models"

export interface AddressDto {
  street?: string | null
  houseNumber?: string | null
  boxNumber?: string | null
  zipCode?: string | null
  city?: string | null
  country?: string | null
}

export interface EmployeeDto {
  uniqueCode: string
  firstName?: string | null
  lastName?: string | null
  iban?: string | null
  ssin?: string | null
  address?: AddressDto | null
  email?: string | null
  phoneNumber?: string | null
  culture?: string | null
  isActive?: boolean
  employerUniqueCode?: string
  employerName?: string | null
}

export interface UpdateMyEmployeeDto {
  firstName?: string
  lastName?: string
  iban?: string
  ssin?: string
  address?: AddressDto
  email?: string
  phoneNumber?: string
  culture?: string
}

const EMPTY = ""

export function toUserProfile(dto: EmployeeDto, base?: Partial<UserProfile>): UserProfile {
  const a = dto.address ?? {}
  return {
    id: dto.uniqueCode,
    firstName: dto.firstName ?? EMPTY,
    lastName: dto.lastName ?? EMPTY,
    email: dto.email ?? EMPTY,
    preferredName: base?.preferredName ?? dto.firstName ?? EMPTY,
    avatarUri: base?.avatarUri,
    phone: dto.phoneNumber ?? EMPTY,
    dateOfBirth: base?.dateOfBirth ?? EMPTY,
    nationality: base?.nationality ?? EMPTY,
    homeCity: a.city ?? base?.homeCity ?? EMPTY,
    address: {
      street: [a.street, a.houseNumber].filter(Boolean).join(" "),
      postalCode: a.zipCode ?? EMPTY,
      city: a.city ?? EMPTY,
      country: a.country ?? EMPTY,
    },
    emergencyContact: base?.emergencyContact ?? { name: EMPTY, relationship: EMPTY, phone: EMPTY },
    onboardingComplete: base?.onboardingComplete ?? true,
    bio: base?.bio ?? EMPTY,
    language: dto.culture ?? base?.language ?? "en",
    motionPreference: base?.motionPreference ?? "system",
    themePreference: base?.themePreference ?? "system",
    security: base?.security ?? { faceIdEnabled: false, biometricType: EMPTY, passwordLastChangedAt: EMPTY },
    privacy: base?.privacy ?? { analyticsEnabled: true, crashReportsEnabled: true, employerDataSharingEnabled: true },
    bankAccount: {
      iban: dto.iban ?? EMPTY,
      bic: base?.bankAccount?.bic ?? EMPTY,
      bankName: base?.bankAccount?.bankName ?? EMPTY,
      accountHolder: base?.bankAccount?.accountHolder ?? [dto.firstName, dto.lastName].filter(Boolean).join(" "),
    },
    legal: {
      nationalRegisterNumber: base?.legal?.nationalRegisterNumber ?? EMPTY,
      taxId: base?.legal?.taxId ?? EMPTY,
      socialSecurityNumber: dto.ssin ?? EMPTY,
      workPermitStatus: base?.legal?.workPermitStatus ?? EMPTY,
      payrollStatus: base?.legal?.payrollStatus ?? EMPTY,
    },
    notificationPreferences:
      base?.notificationPreferences ?? {
        shiftReminders: true,
        scheduleChanges: true,
        documentRequests: true,
        payslips: true,
        employerAnnouncements: true,
      },
  }
}

export function toUpdateMyEmployeeDto(profile: Partial<UserProfile>): UpdateMyEmployeeDto {
  const dto: UpdateMyEmployeeDto = {}
  if (profile.firstName !== undefined) dto.firstName = profile.firstName
  if (profile.lastName !== undefined) dto.lastName = profile.lastName
  if (profile.email !== undefined) dto.email = profile.email
  if (profile.phone !== undefined) dto.phoneNumber = profile.phone
  if (profile.language !== undefined) dto.culture = profile.language
  if (profile.bankAccount?.iban !== undefined) dto.iban = profile.bankAccount.iban
  if (profile.legal?.socialSecurityNumber !== undefined) dto.ssin = profile.legal.socialSecurityNumber
  if (profile.address) {
    dto.address = {
      street: profile.address.street,
      zipCode: profile.address.postalCode,
      city: profile.address.city,
      country: profile.address.country,
    }
  }
  return dto
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- profile.transformer.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/profile/data/profile.transformer.ts src/features/profile/data/profile.transformer.test.ts
git commit -m "feat(profile): EmployeeDto<->UserProfile transformers"
```

### Task M9: HTTP auth + profile repositories and composition wiring

**Files:**
- Modify: `src/services/api/index.ts` (export a configured `apisauce` and an http-client factory bound to the auth service)
- Modify: `src/composition/repositories.ts` (replace the throwing `auth`/`profile` stubs with real HTTP repos; build a hybrid http+mock composition; flip the adapter selector)
- Modify: `src/services/app/app.store.ts` (add idempotent `ensureSeededAccount(accountId)` used to bridge real auth into still-mock features)
- Test: `src/composition/repositories.http.test.ts`

- [ ] **Step 1: Write the failing test (bridge + composition)**

```typescript
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}))

import { ensureSeededAccount, getAccountState } from "@/services/app/app.store"

describe("ensureSeededAccount", () => {
  it("creates a usable mock account for an unknown real accountId", () => {
    const accountId = "real-emp-uuid"
    ensureSeededAccount(accountId)
    const state = getAccountState(accountId)
    expect(state).toBeTruthy()
    expect(Array.isArray(state.notifications)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- repositories.http.test.ts`
Expected: FAIL — `ensureSeededAccount` not exported.

- [ ] **Step 3: Add `ensureSeededAccount` to app.store.ts**

Add (reusing existing imports `createSeededAccountRecord` from `./app.transformer` is in `repositories.ts`; here use the store's own helpers):

```typescript
import { createInitialState } from "@/core/mockState"
import { toPersistedAggregates } from "./app.transformer"

export function ensureSeededAccount(accountId: string): void {
  const db = ensureDb()
  if (db.accounts.some((account) => account.id === accountId)) return
  const now = new Date().toISOString()
  const seededAccount: MockAccountDto = {
    id: accountId,
    email: `${accountId}@linked.local`,
    password: "",
    aggregates: toPersistedAggregates(createInitialState()),
    createdAt: now,
    updatedAt: now,
  }
  writeDb({ ...db, accounts: [seededAccount, ...db.accounts] })
}
```
(Adjust field names to match `MockAccountDto` exactly — confirm against `src/services/app/app.types.ts`. If `MockAccountDto` requires additional fields, copy the shape produced by `createSeededAccountRecord` in `app.transformer.ts`.)

- [ ] **Step 4: Run the bridge test**

Run: `pnpm test -- repositories.http.test.ts`
Expected: PASS.

- [ ] **Step 5: Export a configured apisauce + auth-bound http client from services/api/index.ts**

Add to `src/services/api/index.ts`:
```typescript
import { createAuthService } from "@/services/auth/authService"
import { createHttpClient } from "./httpClient"

// apisauce instance for API-key auth endpoints (login/select-employer)
export const authApi = api.apisauce
export const authService = createAuthService(authApi)
export const httpClient = createHttpClient(api.apisauce, authService.reauthenticate)
```
(If login/select-employer require an API-key header, set it here once: `api.apisauce.setHeader("X-API-Key", Config.AUTH /* add api key field */)`. The API key is non-secret for the mobile public client per backend rate-limited design; if a key field is needed, add `apiKey` to `Config.AUTH` in Task M2 and set the header here.)

- [ ] **Step 6: Implement HTTP auth + profile repositories in repositories.ts**

Replace the `auth` and `profile` stubs inside `createApiRepositories()` (and import the service/transformers at top of file):

```typescript
import { authService, httpClient } from "@/services/api"
import { ensureSeededAccount } from "@/services/app/app.store"
import {
  toUserProfile,
  toUpdateMyEmployeeDto,
  type EmployeeDto,
} from "@/features/profile/data/profile.transformer"
import { toAppSession } from "@/features/auth/data/auth.transformer"
```

`auth` repository:
```typescript
auth: {
  async signIn() {
    const result = await authService.signIn()
    if (!result.ok) return result
    ensureSeededAccount(result.data)
    setSession({ accountId: result.data, signedInAt: new Date().toISOString() })
    return success(buildSessionForAccount(result.data))
  },
  async signOut() {
    await authService.signOut()
    setSession({ accountId: null })
    return toAppSession({ accountId: null })
  },
  async getSession() {
    const accountId = authService.getCurrentAccountId()
    if (!accountId) return toAppSession({ accountId: null })
    return buildSessionForAccount(accountId)
  },
  // Entra hosted flows handle these; surface a clear domain error for now.
  register: async () => failure<AuthError>({ type: "validation", message: "Use Continue with email." }),
  requestPasswordReset: async () => failure<AuthError>({ type: "reset-unavailable", message: "Password reset is handled by the identity provider." }),
  resetPassword: async () => failure<AuthError>({ type: "reset-unavailable", message: "Password reset is handled by the identity provider." }),
  changePassword: async () => failure<AuthError>({ type: "validation", message: "Password change is handled by the identity provider." }),
  completeOnboarding: async (accountId: string) => success(buildSessionForAccount(accountId)),
} satisfies AuthRepository,
```

`profile` repository:
```typescript
profile: {
  async getProfile() {
    const res = await httpClient.get<EmployeeDto>("/employee")
    if (!res.ok || !res.data) throw new Error("Failed to load profile")
    return toUserProfile(res.data)
  },
  async updateProfile(_accountId, profile) {
    const res = await httpClient.put<unknown>("/employee", toUpdateMyEmployeeDto(profile))
    if (!res.ok) return failure(toProfileError("validation", "Could not save profile."))
    const reloaded = await httpClient.get<EmployeeDto>("/employee")
    if (!reloaded.ok || !reloaded.data) return failure(toProfileError("not-found", "Profile not found."))
    return success(toUserProfile(reloaded.data))
  },
  // Employer directory/join is invite-driven; deferred to a later slice — keep mock behaviour.
  getEmployers: createMockProfileRepository().getEmployers,
  joinEmployer: createMockProfileRepository().joinEmployer,
} satisfies ProfileRepository,
```

Then change the hybrid composition: in `createAppRepositories()`, replace the selector and branches so the http path uses real `auth`+`profile` and mock for the rest:
```typescript
export function createAppRepositories(): AppRepositories {
  const useHttp = Boolean(Config.API_URL)
  if (!useHttp) {
    return {
      auth: createMockAuthRepository(),
      documents: createMockDocumentsRepository(),
      home: createMockHomeRepository(),
      notifications: createMockNotificationsRepository(),
      profile: createMockProfileRepository(),
      schedule: createMockScheduleRepository(),
      time: createMockTimeRepository(),
    }
  }
  const httpRepos = createApiRepositories()
  return {
    auth: httpRepos.auth,
    profile: httpRepos.profile,
    // Migrated in later slices:
    documents: createMockDocumentsRepository(),
    home: createMockHomeRepository(),
    notifications: createMockNotificationsRepository(),
    schedule: createMockScheduleRepository(),
    time: createMockTimeRepository(),
  }
}
```
Remove the now-unused throwing stubs for `auth`/`profile` only; keep the remaining stub entries (documents/home/notifications/schedule/time) in `createApiRepositories()` for future slices, or delete them since they are no longer referenced — prefer deleting unreferenced stubs to keep the file honest.

- [ ] **Step 7: Typecheck + full test run**

Run: `pnpm compile && pnpm test --runInBand`
Expected: no type errors; all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/services/api/index.ts src/composition/repositories.ts src/services/app/app.store.ts src/composition/repositories.http.test.ts
git commit -m "feat: http auth+profile repositories with hybrid mock composition"
```

### Task M10: Validation gate + manual E2E

**Files:** none (verification only)

- [ ] **Step 1: Run the full mobile gate**

Run: `pnpm check && pnpm lint:check`
Expected: PASS (compile + tests + depcruise + doctor + lint).

- [ ] **Step 2: Start the backend (Development, dev tokens on)**

In the backend repo: `dotnet run --project apps/api/src/Vesta.Workforce.Api`. Confirm it listens and note the URL/port. Update `src/config/config.dev.ts` `API_URL` to match the backend's actual dev URL if it is not `http://localhost:3000/api/v1` (the backend may listen on a different port — set it to the real one, e.g. `http://localhost:<port>/api/v1`; on Android use `pnpm adb` reverse or the host IP).

- [ ] **Step 3: Launch the app and sign in via dev token**

Run: `pnpm ios` (or `pnpm android`). On the sign-in screen, trigger sign-in. Because `Config.AUTH.devTokenEnabled` is true in dev, the app sends the dev token; expect to land on Home and see the Demo Employee profile (real data via `GET /employee`).

- [ ] **Step 4: Verify silent re-auth**

Wait for the 5-minute backend JWT to expire (or temporarily lower the employee token lifetime in the backend to ~1 min for the test), then trigger a profile reload. Expect the request to 401 once, silently re-auth, and succeed — no forced logout.

- [ ] **Step 5: Verify sign-out**

Sign out; confirm the secure token is cleared and the app returns to the sign-in screen. Re-launch the app cold and confirm it starts signed-out.

- [ ] **Step 6: Final commit (any doc/config tweaks from E2E)**

```bash
git add -A
git commit -m "chore: finalize Slice 0 dev config after E2E"
```

---

## Self-Review Notes (coverage vs spec)

- Auth (social/email-pw via Entra + dev path), token storage, silent re-auth, profile read/update, adapter flip: Tasks M1–M10. ✅
- Backend dev-token path + seed + config contract: Tasks B1–B3. ✅
- Refresh model corrected to Entra-managed re-auth (no backend refresh-token work): reflected in Task M7 `reauthenticate` + M9 wiring; no `select-employer`/`RefreshUseCase` changes. ✅
- `getEmployers`/`joinEmployer` deferred (kept mock): Task M9 Step 6. ✅
- Hybrid mock+http composition keeps un-migrated features working via `ensureSeededAccount`: Task M9. ✅
- Multi-membership employer picker is explicitly deferred with a TODO (auto-pick first): Task M7 Step 3. Acceptable for Slice 0 (dev seed has exactly one membership).
