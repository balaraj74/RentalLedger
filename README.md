# Rental Ledger Web — Agent-Ready Starter

Rental Ledger is a wedding and function rental inventory and booking management system for pandal/mandap equipment, event-rental items and decoration packages.

This repository contains the product specification, agent rules/workflows, database baseline and a small runnable Next.js dashboard scaffold. It is intentionally not represented as the completed application; the coding agent should complete the route/workflow acceptance criteria in `docs/product/FRONTEND_SPEC.md`.

## Start locally

Requirements: Node.js 20.9+ and npm. This starter targets the current stable Next.js 16 line and Tailwind CSS 4. Follow official installation and upgrade documentation if package versions have moved: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure), [Tailwind + Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Before running production build or integrating a live service:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The current scaffold does not claim those checks have already passed. Run the commands in your environment and address any version or environment issues honestly.

## Instructions for your coding agent

1. Start with `AGENT.md` and `AGENTS.md`.
2. Read `.agent/rules/` and the docs index at `docs/README.md`.
3. Follow the milestone plan in `docs/implementation/ROADMAP.md`.
4. Keep `docs/implementation/IMPLEMENTATION_STATUS.md` updated after each milestone.
5. Work beyond planning: implement, test, and fix the actual application.

## Data and security

The starter is configured for explicit mock mode. No live database or authentication provider is connected. Do not send secrets to the browser, and do not mark a booking as truly persisted when mock mode is active.

The SQL baseline is under `docs/database/rental_ledger_schema.sql`. It must be tested on a real PostgreSQL/pgvector instance before claiming database integration. Read `docs/architecture/INSTRUCTOR_ASSUMPTION.md` before presenting PostgreSQL + pgvector as satisfying the course requirement for two database paradigms.
