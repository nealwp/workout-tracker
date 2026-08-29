# AGENTS.md — IronDog

## Monorepo Structure

**IronDog is now an npm workspaces monorepo** with three packages:

- **`@irondog/shared`** - TypeScript types shared across packages
- **`@irondog/api`** - Express REST API server
- **`@irondog/web`** - Expo app (web + mobile)

## Expo Version

Expo SDK 54. Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

- `expo@~54.0.35`, `react@19.1.0`, `react-native@0.81.5`, `typescript@~5.9.2`
- `typedRoutes: true` and `reactCompiler: true` are enabled in `packages/web/app.json` experiments
- Expo generates route types in `.expo/types/router.d.ts` automatically — do not hand-edit

## Tech Stack

- **UI**: Tamagui v2.7.7 with `@tamagui/config/v5`. Always use shorthands: `bg`, `rounded`, `justify`, `items`, `p`, `px`, `py`, `mt`, `mb`, etc. (`onlyAllowShorthands: true` is default)
- **Navigation**: Expo Router v6 (file-based) with Stack navigator
- **State**: React Context (`packages/web/context/WorkoutContext.tsx`, `AuthContext.tsx`)
- **API**: Express 5.2.1 server on port 3001 (`packages/api/src/index.ts`)
  - Runs under Lambda via `serverless-http` — note: has a body-parsing quirk under
    Express 5 (see middleware comment in `src/index.ts`); **planned migration to Hono**
    (`@hono/aws-lambda`) to eliminate the adapter's socket-mocking bugs
  - **Logging**: structured JSON logger (`packages/api/src/logger.ts`) — emits single-line
    JSON via `console.log`/`console.error` (groups logs for CloudWatch Logs). Use
    `logger.error`/`logger.warn` in every catch block; a global error middleware logs any
    unhandled route error. Query CloudWatch with `{ $.level = "error" }`.
- **Auth**: Google Sign-In via `@react-native-google-signin/google-signin` (web) →
  `/auth/google` (JWKS exchange) → `jsonwebtoken` access/refresh tokens; refresh tokens
  hashed in storage
- **Icons**: `@expo/vector-icons`
- **Types**: Shared via `@irondog/shared` package

## Design

- Dark theme by default (dark gray `#1a1a1a` background)
- Gym-use-first UX: large touch targets, minimal taps, easy one-handed input
- No social features, no gamification — just tracking and progression
- See `FEATURES.md` for full feature specification

## Commands

### Workspace Commands
| Command | Description |
|---|---|
| `npm run dev` | Start all dev servers (API + Web) |
| `npm run dev:api` | Start API server only (:3001) |
| `npm run dev:web` | Start Expo dev server (:8081) |
| `npm run build` | Build all packages |
| `npm test` | Run all tests across packages |
| `npm run lint` | Lint all packages |

### Package-Specific Commands
| Command | Description |
|---|---|
| `npm run build --workspace=@irondog/api` | Build API only (tsc → `dist/`) |
| `npm run bundle --workspace=@irondog/api` | esbuild single-file bundle for Lambda (`dist/index.js`) |
| `npm run test --workspace=@irondog/api` | Test API only (node:test via tsx) |
| `npm run test --workspace=@irondog/web` | Test web package only (jest) |
| `npm run type-check --workspace=@irondog/api` | TypeScript check API only |

Always run `npm test` and `npm run lint` after making code changes.

## Development Workflow

1. Make changes in any package
2. Types from `@irondog/shared` are automatically available
3. Run tests: `npm test`
4. Push to branch - CI runs automatically
5. Create PR

## Testing

### Web (Jest)

Jest with `jest-expo` preset. Config lives in `packages/web/package.json` under `"jest"`.

#### Key Dependencies

- `@testing-library/react-native@^12.9.0` — **must be v12**, not v14. v14's `test-renderer@1.2.0` uses `react-reconciler@0.33.0` which requires `react@^19.2.0`, incompatible with Expo SDK 54's `react@19.1.0`. Install with `--legacy-peer-deps`.
- `react-test-renderer@19.1.0` (not `@testing-library/react-test-renderer`)
- `jest-environment-jsdom` is installed but **cannot be used** as the test environment — `react-native/jest/setup.js` conflicts with jsdom (`Cannot redefine property: window`). All tests run in the `node` environment.

#### Writing Web Tests

- Place tests in `packages/web/__tests__/` directory
- Use `.test.ts` for pure data/logic, `.test.tsx` for component tests
- Helper files go in `__tests__/helpers/` (excluded via `testPathIgnorePatterns`)
- Component tests must wrap with `TestWrapper` from `__tests__/helpers/TestWrapper.tsx` which provides `TamaguiProvider` with `defaultTheme="dark"`
- Mock `expo-router` with `jest.mock("expo-router", ...)` — provide `useRouter` and `useLocalSearchParams` as needed
- Mock `WorkoutContext` with `jest.mock("@/context/WorkoutContext", ...)` and cast to `jest.MockedFunction`
- Global module mocks live in `packages/web/__mocks__/` (`@react-native-google-signin/google-signin`, `expo-secure-store`)

#### Transform Ignore (Web)

`transformIgnorePatterns` in `packages/web/package.json` allows transforming: `react-native`, `expo`, `@expo/*`, `tamagui`, `@tamagui/*`, `react-navigation`, `@react-navigation/*`, `react-native-svg`, `native-base`, `@react-native/babel-preset`, `@sentry/react-native`, `@expo-google-fonts/*`, `@react-native-google-signin/google-signin`.

### API (node:test)

- Tests live in `packages/api/test/*.test.ts` and run via `node --import tsx --test` (no jest)
- Set `process.env.AWS_LAMBDA_FUNCTION_NAME = "test"` before importing `src/index` so the
  handler exits instead of listening, then drive routes through the exported `handler`
  (serverless-http) with API Gateway event-shaped payloads (see `test/handler.test.ts`)
- Memory storage is used for tests (no `STORAGE=dynamodb`)

## Path Aliases

### Web Package
`@/*` maps to `packages/web/*` (configured in `packages/web/tsconfig.json`). Use for imports like `@/lib/api/client`, `@/data/exercises`, `@/context/WorkoutContext`.

### Shared Types
`@irondog/shared` imports from `packages/shared/src`. Example:
```typescript
import type { User, Workout, ExerciseData } from '@irondog/shared';
```

## Type Safety

- **Shared types** in `packages/shared/src/types/`
- **API imports**: `import type { User } from '@irondog/shared'`
- **Web imports**: `import type { Workout } from '@irondog/shared'`
- Changes to types immediately show errors in API and web

### Adding New Types

1. Add to `packages/shared/src/types/` (e.g., `workout.ts`, `user.ts`)
2. Export from `packages/shared/src/types/index.ts`
3. Export from `packages/shared/src/index.ts`
4. Import in API or web as needed

## Project Structure

```
packages/
  shared/                         # Shared TypeScript types
    src/
      types/
        workout.ts                # Workout, ExerciseData, SetData
        user.ts                   # User interface
        auth.ts                   # AuthTokens, AuthPayload
        index.ts                  # Re-exports all types
      index.ts                    # Main entry point

  api/                            # Express REST API (serverless)
    src/
      index.ts                    # Express app, routes, logger wiring, Lambda handler
      logger.ts                   # Structured JSON logger (CloudWatch-friendly)
      storage/
        types.ts                  # Storage interface
        index.ts                  # Storage selector (memory vs dynamodb)
        memory/                   # In-memory impl (local dev + tests)
          users.ts
          workouts.ts
          refresh-tokens.ts
        dynamodb/                 # DynamoDB impl (Lambda/prod)
          users.ts
          workouts.ts             # Also exports createWorkoutKey
          refresh-tokens.ts
          shared.ts               # DynamoDBDocumentClient
    test/                         # node:test suites (handler, users, workouts, refresh-tokens)
    DEPLOY.md                     # First-deploy notes and troubleshooting
    .env.example                  # Environment variables template
    package.json
    tsconfig.json

  web/                            # Expo web/mobile app
    app/                          # Expo Router file-based routes
      _layout.tsx                 # Root layout with providers
      index.tsx                   # Home screen — LFG button
      workout/
        select-exercise.tsx       # Muscle group → exercise picker
        exercise.tsx              # Exercise tracking screen
    context/
      WorkoutContext.tsx          # Workout state management
      AuthContext.tsx             # Authentication state
    lib/
      api/client.ts               # API client functions
      config.ts                   # Environment config
      secureStore.ts              # Token storage
      googleSignIn.ts             # Google Sign-In helpers
    data/
      exercises.ts                # Exercise catalog
    __tests__/                    # Jest tests
      helpers/
        TestWrapper.tsx           # Test utility wrapper
    __mocks__/                    # Jest module mocks
      @react-native-google-signin/google-signin.ts
      expo-secure-store.ts
    package.json
    tsconfig.json
    tamagui.config.ts

.github/
  workflows/
    ci.yml                        # Lint, test, build on PR/push
    deploy-api.yml                # Deploy API to AWS Lambda
    deploy-web.yml                # Validate web build (Amplify deploys via amplify.yml)

infra/
  api-stack.yml                   # CloudFormation: DynamoDB, Lambda, API Gateway, OIDC role

amplify.yml                       # AWS Amplify build spec (serves packages/web/dist)
```

## Conventions

- TypeScript strict mode enabled
- No comments in code unless asked
- Tamagui shorthands only (`bg` not `backgroundColor`, `p` not `padding`)
- All screen components default-exported
- API calls use native `fetch` (no axios)
- API storage: in-memory for local dev/tests, DynamoDB on Lambda (`AWS_LAMBDA_FUNCTION_NAME` or `STORAGE=dynamodb`)
- UUIDs via `crypto.randomUUID()`

## Deployment

### Architecture
- Monorepo with npm workspaces
- CI/CD via GitHub Actions
- Hosting: AWS us-west-2 region

### Production URLs (Coming Soon)
- **Web**: https://irondog.fit (AWS Amplify)
- **API**: https://api.irondog.fit (AWS Lambda + API Gateway)

### CI/CD Pipeline
- Push to `main` triggers deployments
- Path filters: only deploy changed packages (`packages/api/**`, `packages/shared/**`, `infra/api-stack.yml`)
- API workflow: build → esbuild bundle → `update-function-code` on AWS Lambda
- Web workflow: validate build in CI; AWS Amplify deploys using the committed `amplify.yml` build spec (repo root, serves `packages/web/dist`)
- API infra managed by CloudFormation stack `irondog-api` (`infra/api-stack.yml`): 3 DynamoDB
  tables (`irondog-users`, `irondog-workouts`, `irondog-refresh-tokens`), Lambda fn `irondog-api`
  (nodejs22.x, 512MB, 15s), Lambda Function URL + API Gateway HTTP API behind `api.irondog.fit`
- See `packages/api/DEPLOY.md` for first-deploy notes, troubleshooting, and JWT secret rotation

### Environment Variables
- **API (Lambda env)**: `JWT_SECRET`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- **Web**: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- **CI (GitHub secrets)**: `AWS_ROLE_ARN` (OIDC role for Lambda deploys)

See `.env.example` files in each package.
