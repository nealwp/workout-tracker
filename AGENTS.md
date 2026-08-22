# AGENTS.md — Workout Tracker

## Expo Version

Expo SDK 54. Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

- `expo@~54.0.35`, `react@19.1.0`, `react-native@0.81.5`, `typescript@~5.9.2`
- `typedRoutes: true` and `reactCompiler: true` are enabled in `app.json` experiments
- Expo generates route types in `.expo/types/router.d.ts` automatically — do not hand-edit

## Tech Stack

- **UI**: Tamagui v2.7.7 with `@tamagui/config/v5`. Always use shorthands: `bg`, `rounded`, `justify`, `items`, `p`, `px`, `py`, `mt`, `mb`, etc. (`onlyAllowShorthands: true` is default)
- **Navigation**: Expo Router v6 (file-based) with Stack navigator
- **State**: React Context (`context/WorkoutContext.tsx`)
- **API**: Express 5.2.1 mock server on port 3001 (`server/index.ts`)
- **Icons**: `@expo/vector-icons`

## Design

- Dark theme by default (`#0a0a0a` background)
- Gym-use-first UX: large touch targets, minimal taps, easy one-handed input
- No social features, no gamification — just tracking and progression
- See `FEATURES.md` for full feature specification

## Commands

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run lint` | Run ESLint via `expo lint` |
| `npm run server` | Start Express mock server on port 3001 |
| `npx tsc --noEmit` | Type-check without emitting |

Always run `npm run lint` and `npx tsc --noEmit` after making code changes.

## Testing

### Framework

Jest with `jest-expo` preset. Config lives in `package.json` under `"jest"`.

### Key Dependencies

- `@testing-library/react-native@^12.9.0` — **must be v12**, not v14. v14's `test-renderer@1.2.0` uses `react-reconciler@0.33.0` which requires `react@^19.2.0`, incompatible with Expo SDK 54's `react@19.1.0`. Install with `--legacy-peer-deps`.
- `react-test-renderer@19.1.0` (not `@testing-library/react-test-renderer`)
- `jest-environment-jsdom` is installed but **cannot be used** as the test environment — `react-native/jest/setup.js` conflicts with jsdom (`Cannot redefine property: window`). All tests run in the `node` environment.

### Writing Tests

- Place tests in `__tests__/` directory
- Use `.test.ts` for pure data/logic, `.test.tsx` for component tests
- Helper files go in `__tests__/helpers/` (excluded via `testPathIgnorePatterns`)
- Component tests must wrap with `TestWrapper` from `__tests__/helpers/TestWrapper.tsx` which provides `TamaguiProvider` with `defaultTheme="dark"`
- Mock `expo-router` with `jest.mock("expo-router", ...)` — provide `useRouter` and `useLocalSearchParams` as needed
- Mock `WorkoutContext` with `jest.mock("../context/WorkoutContext", ...)` and cast to `jest.MockedFunction`

### Transform Ignore

`transformIgnorePatterns` in `package.json` allows transforming: `react-native`, `expo`, `@expo/*`, `tamagui`, `@tamagui/*`, `react-navigation`, `@react-navigation/*`, `react-native-svg`, `native-base`, `@react-native/babel-preset`, `@sentry/react-native`, `@expo-google-fonts/*`.

## Path Aliases

`@/*` maps to `<rootDir>/*` (configured in `tsconfig.json`). Use for imports like `@/api/client`, `@/data/exercises`, `@/context/WorkoutContext`.

## Project Structure

```
app/                    # Expo Router file-based routes
  _layout.tsx           # Root layout: TamaguiProvider + ThemeProvider + WorkoutProvider + Stack
  index.tsx             # Home screen — "LFG" button to start workout
  workout/
    select-exercise.tsx # Two-step picker: muscle group → exercise
    exercise.tsx        # Exercise tracking: weight/reps inputs, set logging, failure toggle
context/
  WorkoutContext.tsx    # WorkoutProvider with startWorkout, finishExercise
data/
  exercises.ts         # Exercise catalog: MuscleGroup[], Exercise[]
api/
  client.ts            # createWorkout(), addExerciseToWorkout() — fetch to localhost:3001
server/
  index.ts             # Express mock server (port 3001, CORS enabled)
  types.ts             # Workout, ExerciseData, SetData interfaces
__tests__/
  helpers/
    TestWrapper.tsx     # TamaguiProvider wrapper for component tests
  exercises.test.ts     # Exercise catalog data tests
  WorkoutContext.test.tsx
  apiClient.test.ts
  Index.test.tsx
  SelectExercise.test.tsx
  ExerciseTracker.test.tsx
```

## Conventions

- TypeScript strict mode enabled
- No comments in code unless asked
- Tamagui shorthands only (`bg` not `backgroundColor`, `p` not `padding`)
- All screen components default-exported
- API calls use native `fetch` (no axios)
- Express server uses in-memory storage (no database)
- UUIDs via `crypto.randomUUID()`
