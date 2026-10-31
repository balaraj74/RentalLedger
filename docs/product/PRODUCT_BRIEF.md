# Product Brief — Rental Ledger V1

## Formal title
**Rental Ledger: Wedding and Function Rental Inventory and Booking Management System**

## Problem
Small and medium-sized rental vendors offer reusable equipment individually and as packages. Since packages consume the same physical stock as direct item rentals, overlapping reservations can oversell inventory unless availability is calculated from component-level allocations over the full rental period and confirmation is concurrency-safe.

## Goal
Build a multi-vendor web platform that supports item and package discovery, inventory management, availability checks, booking, payment records, cancellations, returns, waitlists, reviews/disputes and vendor settlements.

## Differentiator
**Availability-aware package booking over shared inventory.** The system expands package requirements into physical item quantities, aggregates direct and package allocations across overlapping date intervals, and reserves stock atomically in PostgreSQL. pgvector helps discover semantically relevant packages but never decides availability.

## Actors
- `CUSTOMER`: browse, search, compare, create bookings, view own booking/payment status, cancel according to policy, join waitlist, submit eligible reviews/disputes.
- `VENDOR`: manage only their own inventory, package compositions, blackout dates, booking fulfilment/returns, view payouts and analytics.
- `ADMIN`: manage user/vendor state, inspect platform bookings, moderate disputes/reviews, manage policies/coupons, and view system reports.

## In scope
- Vendor item catalog: name, description, category, stock pool, price/day, deposit, condition, images, active state and blackout periods.
- Package composition with quantities.
- Search by category/price/dates plus semantic theme/description search.
- Date-range availability, direct rentals, package rentals and stock allocation.
- Booking statuses, vendor acceptance/rejection, return/complete flow, cancellation, refunds as recorded/simulated data.
- Coupon validation, commissions/payout records, reviews, disputes, notifications, waitlists and dashboards.
- Role-aware web interface, responsive layout, validation, error/loading/empty states.

## Out of scope
Labour/crew scheduling; installation/dismantling jobs; standalone venue reservations; GPS/fleet routing; native mobile app; real card processing in V1.

## Key product invariants
1. PostgreSQL is authoritative for transactions, access-controlled data, and availability.
2. `pgvector` supplies candidate semantic matches only; exact relational filters and inventory validation follow.
3. Item and package rentals must share inventory availability.
4. Booking confirmation plus allocations are atomic and concurrency-safe on the server.
5. Cancelled/released allocations stop consuming inventory only after a valid lifecycle transition.
6. Preserve booking-time unit price and deposit values.
7. Mock mode is visibly labelled. It must never imply a persistent payment, reservation or remote database write.

## Success criteria
- Main routes are usable from customer/vendor/admin perspectives.
- No UI path can confirm an allocation that exceeds available stock in the authoritative backend.
- Package search surfaces relevant themes and filters by exact budget/date/stock criteria.
- Core lists support search/filter/sort and appropriate empty/error/loading states.
- Security boundaries are enforced server-side when live auth/API is connected.
- Lint, typecheck, automated tests and production build pass, or remaining external blockers are accurately documented.
