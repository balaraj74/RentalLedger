# Product Context and Non-Negotiable Invariants

- Product name: **Rental Ledger**.
- Formal title: **Wedding and Function Rental Inventory and Booking Management System**.
- Audience: customers booking event rental resources, vendors managing rental inventory/packages/bookings, and administrators operating the platform.
- Version 1 domain: pandal/mandap equipment, reusable event-rental stock, decoration packages, booking/allocations, simulated or recorded payment events, cancellations, returns, waitlists, reviews/disputes, vendor payouts, and reporting.
- Explicitly excluded: worker/labour scheduling, installation/dismantling task scheduling, separate venue booking, GPS fleet logistics, native mobile app.
- Roles: `CUSTOMER`, `VENDOR`, `ADMIN`.

## Domain truth
1. Items are stock pools in V1; individual serialized asset tracking is not required.
2. A package is composed of item quantities in `package_items`.
3. A package booking consumes the package's component item stock for the same booking interval.
4. A direct item booking and package booking compete for the same item stock.
5. Allocations are created, released, or returned through a controlled lifecycle; do not infer availability solely from `items.total_stock` or from a listing badge.
6. Blackout periods and active allocations affect availability over the entire inclusive/exclusive rental interval according to the documented date convention.
7. Vector search is discovery/ranking only. Relational rules determine bookability.
8. Preserve booking-time price and deposit snapshots.
9. Booking confirmation and all stock allocation writes must be atomic and concurrency-safe in the backend.
10. Mock mode must be clearly declared in the UI or development documentation; it cannot claim external persistence.
