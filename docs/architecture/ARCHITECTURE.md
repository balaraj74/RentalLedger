# Architecture — Rental Ledger V1

## Preferred shape

```text
Browser (Next.js App Router)
  ├─ Server Components: route shells, initial data reads
  ├─ Client Components: interactive tables/forms/date selectors/search controls
  └─ Route Handlers / server-only services
       ├─ Auth + authorization
       ├─ Zod validation and domain rules
       ├─ Booking/availability service (authoritative)
       ├─ Catalog/package service
       └─ PostgreSQL repository
             ├─ relational source of truth
             └─ pgvector package embedding/search
```

## Architectural principles
- Keep presentation code separate from data access and business rules.
- Define UI-facing DTOs in `src/lib/types.ts`; avoid passing raw DB rows around the component tree.
- Define an interface in `src/lib/data/` (or equivalent) so deterministic demo data and PostgreSQL-backed access can be switched without rewriting the UI.
- Use server-only DB code. Do not import a PostgreSQL client or privileged secret into a Client Component.
- Use Next.js App Router patterns and current stable APIs; check current official docs for version-specific conventions.
- For protected routes, perform server-side session/role checks. UI navigation checks are convenience only.
- Do not use mock values as if they came from a real service. Add a visible “Demo data” indicator while mock mode is active.

## Core data ownership
- PostgreSQL: all business data, access checks, stock allocations, bookings, price snapshots, payments, cancellation history, payout records, reviews, disputes and notifications.
- pgvector: embedding vector plus package/document identity and searchable metadata. The package row in PostgreSQL remains authoritative for content and eligibility.
- Embedding model: choose and document one model and dimensions. The initial SQL baseline expects 384 dimensions; change only with a model/schema migration and re-embedding plan.

## Availability and booking correctness
- Date interval convention must be explicit and consistent. Prefer half-open interval semantics `[start_date, end_date)` for rental occupancy unless the course/schema decisions explicitly choose inclusive end dates. If the current schema uses `event_end_date` as the final rental day, document the conversion at the API boundary.
- Expand package components to item demand before checking inventory.
- A booking is eligible only when each required item has sufficient capacity across every relevant interval and does not overlap blackout periods.
- Lock/serialize contested inventory in the backend; check and allocate inside a single transaction.
- Return a conflict (`409` or equivalent) if stock has changed. Never “force succeed” from stale client availability.
- Cancellation or return must transition allocations using server-side rules and idempotent operations.

## Mock mode
When `DATABASE_URL` or auth configuration is absent, use deterministic fixtures and an explicit mock provider. The UI must make it clear this is demo data. Keep interface methods compatible with future server routes.
