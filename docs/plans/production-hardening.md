# Production Hardening

Status of the production-hardening items (launch-readiness task #14). Items that
require real secrets or a native build to verify are listed as release-engineering
follow-ups with the exact steps, rather than shipped unverified.

## Done
- **Version alignment** — `package.json` bumped `0.0.1` → `1.0.0` to match
  `app.config.ts` `version: "1.0.0"`. Store/build versioning itself is managed by
  EAS (`eas.json` `appVersionSource: "remote"`), which owns build-number increments.
- **No demo auth in prod** — `config.prod.ts` `DEMO_AUTH_ENABLED: false`.
- **Secrets out of the bundle** — Entra/API-key come from `EXPO_PUBLIC_*` EAS env
  (see README); none committed.
- **Transport** — production `API_URL` is HTTPS (`https://api.vesta.services`).
- **Crash + error reporting** — Sentry, DSN-gated, prod-only.
- **iOS encryption declaration** — `ITSAppUsesNonExemptEncryption: false`.
- **Android backup disabled** — `android.allowBackup: false`.

## Release-engineering follow-ups (need real secrets / a native build to verify)

### Certificate (SSL) pinning  — deferred, not skipped
Pin `api.vesta.services` so a compromised/rogue CA can't MITM the API.
- **Why deferred here:** requires the **SPKI public-key hashes** of the production
  cert chain (leaf + a backup/intermediate), which must come from ops — fabricating
  them is worse than not pinning. It is a native change only verifiable by a device
  build, and **bricks API connectivity if a pin is wrong or the cert rotates without
  a pin update**.
- **How to implement:**
  1. Capture two SPKI pins (current leaf + backup intermediate):
     `openssl s_client -connect api.vesta.services:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64`
  2. Add an Android `network_security_config.xml` `<pin-set>` and iOS
     `NSAppTransportSecurity`/`NSPinnedDomains` via `expo-build-properties` (config plugin).
  3. Establish a **pin-rotation runbook** (always ship a backup pin; update before cert rotation).
  4. Verify on a device build against staging before production.

### Disable Android cleartext for release builds only
`usesCleartextTraffic: false` hardens release, **but dev points at
`http://localhost:5162`**, so it must not be global. Apply via a release-only
network-security config (debug keeps cleartext to localhost). Verify with a build.

### App Store / Play submit credentials
`eas.json` `submit.production` is an empty skeleton. Populate with ASC API key
(iOS) and a service-account JSON (Android) as EAS secrets before first submission.

### Account/ownership
`app.config.ts` `owner: "kirylmaltsav"` is a personal account — move to the Vesta
EAS organization for production ownership/transfer safety (ops decision).
