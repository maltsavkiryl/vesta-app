# Vesta

Expo Router React Native app for the Vesta employee mobile experience.

## Requirements

- Node.js 20 or newer
- pnpm 10.7.1 or newer
- Xcode or Android Studio for native simulator builds
- EAS CLI for local native builds

## Setup

```bash
pnpm install
pnpm start
```

For local native development, use Expo run commands:

```bash
pnpm ios
pnpm android
```

The app uses a development client. Use the local EAS archive builds when you specifically need installable simulator or device artifacts:

```bash
pnpm build:ios:sim
pnpm build:android:sim
```

`pnpm build:ios:device` and `pnpm build:ios:prod` require valid Apple signing credentials that can be imported into the local keychain.

For local Android API access, reverse the common development ports:

```bash
pnpm adb
```

## Configuration

Runtime config lives in `src/config`.

- Development API URL: `http://localhost:3000/api/v1`
- Production API URL: `https://api.vesta.services/api/v1`
- Demo auth is enabled only in development config.

Do not put API secrets, signing keys, or private tokens in the JavaScript config. Mobile bundles are inspectable by end users.

## Validation

Run these before opening a PR:

```bash
pnpm check
pnpm lint:check
```

`pnpm lint` rewrites files. Use `pnpm lint:check` when you only want validation.
`pnpm doctor` runs `expo-doctor` directly when you want to validate the Expo/EAS setup surface without running the full check suite.

## Production environment variables

The production build reads these `EXPO_PUBLIC_*` variables at build time (they are
inlined into the JS bundle, so they must be **non-secret public client values** —
never private secrets). Set them as EAS environment variables for the
`production` / `preview` build profiles (or in a gitignored `.env.local` for local
prod-config builds). Login fails closed until they are provided.

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_VESTA_API_KEY` | Public client key for the rate-limited login endpoints |
| `EXPO_PUBLIC_ENTRA_AUTHORITY` | Entra (Azure AD) authority URL for the OIDC tenant |
| `EXPO_PUBLIC_ENTRA_CLIENT_ID` | Entra public client (application) ID |

```bash
# one-time, per EAS environment
eas env:create --environment production --name EXPO_PUBLIC_ENTRA_AUTHORITY --value "https://login.microsoftonline.com/<tenant>/v2.0"
eas env:create --environment production --name EXPO_PUBLIC_ENTRA_CLIENT_ID --value "<client-id>"
eas env:create --environment production --name EXPO_PUBLIC_VESTA_API_KEY --value "<public-api-key>"
```

## Architecture Notes

- `src/app` contains Expo Router route files.
- `src/features` contains feature screens.
- `src/providers/app-provider.tsx` owns the current local demo session state.
- `src/services/api` is the boundary for backend integration.
- `src/design-system` and `src/theme` contain shared UI primitives and tokens.

The repository also contains `design/` and `vesta_mobile_app/` reference artifacts. Treat them as design/prototype inputs, not production app code.

## Testing

Unit and component tests use Jest with `jest-expo`. Add tests beside the code they cover using `*.test.ts` or `*.test.tsx`.

Maestro support is scaffolded through `.maestro/shared/_OnFlowStart.yaml`; production E2E flows should live under `.maestro/flows`.
