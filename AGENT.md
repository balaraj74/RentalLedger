# Rental Ledger — Autonomous Development Brief

You are the primary engineering agent responsible for delivering Rental Ledger Version 1 end-to-end. Build a polished, accessible, responsive Next.js web application, not a static mockup. Treat this repository and `docs/` as the product source of truth.

## Mission

Build **Rental Ledger**, an availability-aware wedding and function rental resource management platform for pandal/mandap equipment, chairs, tables, stages, lights, décor items, and decoration packages. The key engineering idea is accurate, transaction-safe inventory availability when the same stock pool is used by both individual item rentals and package component reservations.

## First actions — mandatory

1. Read `AGENTS.md`, every relevant `.agent/rules/*.md`, `docs/README.md`, `docs/product/PRODUCT_BRIEF.md`, `docs/product/FRONTEND_SPEC.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/API_CONTRACT.md`, `docs/implementation/ROADMAP.md`, and the database artifacts under `docs/database/`.
2. Inspect the current codebase and preserve useful existing work. Do not blindly overwrite files.
3. Create/maintain `docs/implementation/IMPLEMENTATION_STATUS.md` with checkboxes, current milestone, decisions, blockers, test results, and the next concrete task.
4. Work in small milestones. After each milestone, run available lint/typecheck/tests/build, fix failures, and update the status document.
5. If no backend credentials or service are provided, build against a typed, deterministic mock repository behind an explicit data-provider interface. Keep the UI working and make future PostgreSQL API integration straightforward. Never pretend mock writes are persisted remotely.

## Product rules that must not change

- Version 1 focuses on rental inventory, package composition, bookings, stock availability, payment records, cancellations, returns, waitlists, vendor settlements, reviews/disputes, and reporting.
- Labour/crew scheduling, installation/dismantling task management, standalone venue booking, GPS fleet tracking, and native mobile apps are out of scope.
- Roles: `CUSTOMER`, `VENDOR`, `ADMIN`.
- PostgreSQL is the source of truth for business records. `pgvector` is only for semantic package discovery. Vector similarity must never determine booking availability or authorize a reservation.
- Package availability must be derived from underlying component quantities and each component's shared item stock, across overlapping reservation intervals.
- A UI-level availability check is advisory. The authoritative check and reservation must happen server-side atomically in PostgreSQL. Do not implement an unsafe “check then insert” booking flow.
- Never store actual card data or raw passwords. Use payment-provider references or clearly labeled simulated payment records for the academic prototype.
- An item booking line must refer to exactly one of an individual `item_id` or a `package_id`.
- Preserve booking-time prices and deposits; changes to current vendor pricing must not alter existing bookings.

## Frontend completion criteria

The application is complete only when all in-scope routes listed in `docs/product/FRONTEND_SPEC.md` have intentional, usable screens; navigation works; tables and filters behave; forms validate; empty/loading/error/success states exist; role-aware navigation works; responsive layouts work at mobile/tablet/desktop widths; accessibility basics are met; and the UI connects through a typed service layer that can switch between mock data and real API routes.

Do not leave important primary buttons as inert decoration. If a feature is not implemented, label it as a stub and record it in the implementation status rather than implying it works.

## Engineering rules

- Use Next.js App Router, TypeScript strict mode, React Server Components by default, and Client Components only for interaction/state that needs them.
- Follow current official Next.js documentation and safe version updates. Do not use experimental/canary APIs without explicit justification.
- Use semantic HTML, accessible labels, keyboard focus states, descriptive errors, and responsive layouts.
- Keep reusable UI in `src/components/`, domain types in `src/lib/types.ts`, mock fixtures in `src/lib/mock-data.ts`, and data-access abstractions under `src/lib/data/` or a similarly clear structure.
- Validate user input on the server as well as in the browser. Use Zod for schemas if added.
- Keep secrets server-side and out of version control. Only variables intentionally exposed to the browser may use `NEXT_PUBLIC_`.
- Do not put database credentials, service-role keys, private API keys, or secrets in Client Components.
- Avoid giant components, duplicate domain types, broad `any`, unexplained casts, and hidden hardcoded business assumptions.
- Avoid introducing extra database products or large libraries without a documented use case.

## Execution protocol

For each milestone:
1. State the goal and inspect affected files.
2. Implement the smallest complete vertical slice.
3. Add tests or clear manual test steps.
4. Run `npm run lint`, `npm run typecheck`, relevant tests, and `npm run build` where practical.
5. Fix all errors caused by the change.
6. Update `docs/implementation/IMPLEMENTATION_STATUS.md` and `docs/implementation/DECISIONS.md`.
7. Continue to the next milestone unless blocked by a real external dependency. Do not stop after producing a plan.

## Final acceptance

Follow `.agent/workflows/quality-gate.md`. Report honestly what is complete, what is mocked, what requires credentials/migrations, and test command results. Never claim a build/test passed unless you ran it and observed success.
