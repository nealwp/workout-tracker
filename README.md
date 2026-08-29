<p align="center">
  <img src="packages/web/assets/images/irondog-logo.png" alt="IronDog" width="128" />
</p>

# IronDog - Workout Tracker

![CI Status](https://github.com/nealwp/workout-tracker/workflows/CI/badge.svg)

Hypertrophy and progressive overload tracking for serious lifters.

## Architecture

This is a monorepo containing:

- **`packages/shared`** - TypeScript types shared between API and web
- **`packages/api`** - Express.js REST API
- **`packages/web`** - Expo app (web + mobile)

## Development

### Prerequisites
- Node.js 20+
- npm 10+

### Quick Start

```bash
# Install all dependencies
npm install --legacy-peer-deps

# Run API and web dev servers together
npm run dev

# Or run separately
npm run dev:api   # API on localhost:3001
npm run dev:web   # Web on localhost:8081
```

### Working on Individual Packages

```bash
# Build specific package
npm run build --workspace=@irondog/api

# Run tests
npm test

# Run tests for specific package
npm run test --workspace=@irondog/web

# Lint all code
npm run lint
```

### Project Structure

```
workout-tracker/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   │   └── src/types/   # User, Workout, Exercise, etc.
│   ├── api/             # Express REST API
│   │   └── src/         # Routes, middleware, JWT auth
│   └── web/             # Expo web/mobile app
│       ├── app/         # Expo Router screens
│       ├── context/     # React Context providers
│       └── lib/         # API client, utilities
├── .github/workflows/   # CI/CD pipelines
└── package.json         # Root workspace config
```

## Testing

All packages include tests:

```bash
npm test                              # Run all tests
npm run test:watch --workspace=@irondog/web    # Watch mode
```

Currently: **62 tests passing** ✅

## Deployment

### Production URLs
- **Web**: https://irondog.fit (AWS Amplify) - _Coming soon_
- **API**: https://api.irondog.fit (AWS Lambda + API Gateway) - _Coming soon_

### Deployment Workflow
- Push to `main` triggers CI/CD
- API deploys to AWS Lambda (esbuild bundle → `update-function-code`), fronted by API Gateway HTTPS
- Web: CI validates the build; Amplify deploys via the committed `amplify.yml` build spec
- Path filters ensure only changed packages deploy

## Environment Variables

Each package requires environment variables. See:
- `packages/api/.env.example`
- Copy to `.env` in each package for local development

## Contributing

1. Create feature branch from `main`
2. Make changes
3. Run `npm test` and `npm run lint`
4. Push - CI will run automatically
5. Create PR

## License

Private - All Rights Reserved
