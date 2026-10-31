# Implementation Roadmap — Complete A to Z

## Milestone 0 — Understand and verify
- Read all source docs and SQL baseline.
- Confirm project assumptions and inspect package/runtime.
- Create implementation status/decision log.
- Run initial lint/typecheck/test/build; note actual results.

## Milestone 1 — Design system and application shell
- Responsive shell/sidebar/topbar/breadcrumbs/role switcher in demo mode.
- Standard buttons, fields, badges, cards, tables, dialogs, toasts, skeletons and empty/error states.
- Dashboard with explicit demo-data label.

## Milestone 2 — Customer discovery
- Catalog item/package cards, filters, URL-state search, package detail, item detail, date and quantity inputs.
- Search interface with semantic-search UI, relevance explanation, exact availability result and no-result fallback.

## Milestone 3 — Vendor inventory
- Item list/create/edit/details, stock, price/deposit, condition, images, categories and blackout dates.
- Validate positive quantities, money fields and date intervals.

## Milestone 4 — Package builder
- Create/edit package, choose component items, quantity per component, preview component stock requirements, compute package price and semantic metadata.
- Protect against inactive or cross-vendor components where the policy requires same-vendor inventory.

## Milestone 5 — Booking and allocation journey
- Availability estimate, request/confirm flow, booking detail and lifecycle actions.
- Typed service API; mock mode simulates conflicts deterministically.
- Backend implementation (if service available) checks all components and writes allocations atomically.
- Test overlapping booking, package/direct stock contention, cancellation and concurrent confirmation.

## Milestone 6 — Payments, cancellations, returns and waitlist
- Recorded/simulated payment form, balance/deposit/refund display, policy calculation, return lifecycle, vendor payout records and waitlist actions.

## Milestone 7 — Customer/vendor/admin experiences
- Customer bookings/profile/payments; vendor customers/bookings/reviews/disputes/payouts; admin vendor/user moderation/policies/coupons/reports.
- Role-aware navigation plus server-side authorization where backend exists.

## Milestone 8 — Reporting and search quality
- Utilization, upcoming bookings, popular items/packages, cancellations and settlement reports.
- pgvector retrieval adapter, exact relational re-ranking/filtering, query metadata and no-result handling.

## Milestone 9 — Security, accessibility and test hardening
- Server validation/auth/ownership tests, keyboard checks, reduced motion, responsive checks, error boundaries, structured logging without sensitive data.
- Lint/typecheck/tests/build; inspect all routes and main CTA paths.

## Milestone 10 — Documentation and demo readiness
- Setup README, database migration steps, environment variables, demo credentials or role switcher limited to mock mode, screenshots, ER/schema, queries, test evidence and known limitations.
- Update final implementation status honestly.

A milestone is not complete merely because files exist; its acceptance criteria and test results must be recorded.
