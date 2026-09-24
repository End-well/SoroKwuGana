# SoroKwuGana

> Your #1 destination for African entertainment, lifestyle and culture.

## Monorepo structure

```
SoroKwuGana/
├── apps/
│   ├── backend/    Express + Prisma REST API  (port 4000)
│   ├── frontend/   React (Vite) user app      (port 5173)
│   └── admin/      React (Vite) admin panel   (port 5174)
├── packages/
│   ├── types/      Shared TypeScript types
│   ├── ui/         Shared UI components (future)
│   └── config/     Shared tooling config (future)
├── .github/
│   ├── workflows/  CI/CD pipelines
│   └── PULL_REQUEST_TEMPLATE.md
└── docs/
    └── CONTRIBUTING.md
```

## Quick start

```bash
# Install all dependencies
npm install

# Dev — frontend + backend
npm run dev

# Dev — individual apps
npm run dev:frontend
npm run dev:backend
npm run dev:admin
```

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Admin    | React 19, Vite, Tailwind CSS v4 |
| Backend  | Node.js, Express, Prisma, SQLite |
| Language | TypeScript throughout |

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for contribution guidelines.
