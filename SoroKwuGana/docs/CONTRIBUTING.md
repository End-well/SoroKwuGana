# Contributing to SoroKwuGana

## Project structure

```
SoroKwuGana/
├── apps/
│   ├── backend/    Express + Prisma API
│   ├── frontend/   React (Vite) user-facing app
│   └── admin/      React (Vite) admin dashboard
├── packages/
│   ├── types/      Shared TypeScript types
│   ├── ui/         Shared UI components
│   └── config/     Shared config (eslint, tsconfig base, etc.)
└── docs/
```

## Getting started

```bash
# Install all workspace dependencies from the root
npm install

# Run all apps in dev mode
npm run dev

# Run a specific app
npm run dev:frontend
npm run dev:backend
npm run dev:admin
```

## Branch conventions

- `main` — production-ready
- `feat/<name>` — new feature
- `fix/<name>` — bug fix
- `chore/<name>` — tooling / config changes

## Commit style

Follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
