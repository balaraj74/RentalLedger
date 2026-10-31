# Rental Ledger — Version 1 Database and Implementation Blueprint

## 1. Final project identity

**Product name:** Rental Ledger  
**Academic title:** *Rental Ledger: A Wedding and Function Rental Inventory and Booking Management System*

**Scope:** A multi-vendor rental platform for pandal/mandap equipment, chairs, tables, staging, lighting, and decoration inventory, including bundled packages, date-aware bookings, payments, cancellations, returns, waitlists, vendor payouts, and semantic package discovery.

**Out of scope for Version 1:** Crew/labour scheduling, installation/dismantling workflows, standalone venue booking, live fleet tracking, and a native mobile app.

## 2. Problem statement

Small and medium-sized pandal rental businesses and wedding-decoration vendors manage reusable equipment that may be rented individually or included in multiple decoration packages. Overlapping bookings can compete for the same physical inventory, causing inaccurate availability and overselling when stock is checked separately for individual items and packages.

Rental Ledger centralizes catalog management, package composition, date-range availability, booking allocation, payments, cancellations, returns, and vendor settlements. Its core mechanism validates the actual underlying item requirements of direct rentals and package bookings before confirming a reservation. Semantic search helps customers discover relevant decoration packages; exact relational data remains authoritative for price, stock, dates, and booking confirmation.

**Core engineering question:** How can the system prevent inventory overselling when individual rentals and bundled packages compete for the same pool of stock across overlapping dates?

## 3. Database strategy

### PostgreSQL — authoritative relational system

Owns all transactional business data: users, vendors, customers, addresses, categories, items, package composition, bookings, allocations, payment records, cancellations, reviews, disputes, waitlists, and settlements. It is responsible for referential integrity, constraints, transaction boundaries, and inventory concurrency control.

### pgvector — semantic retrieval

Stores an embedding of each package's human-readable name, description, and theme tags. Similarity search supplies candidate package IDs for a natural-language request. PostgreSQL must subsequently enforce active status, price/location/date filters, blackout dates, package component availability, and vendor rules.

**Do not use vector similarity to decide inventory availability.** It retrieves candidates; relational queries and transaction-safe allocation make the final decision.

## 4. Instructor-requirement assumption — must be confirmed

The course brief asks for at least two database paradigms and lists SQL, NoSQL, and vector databases. This implementation treats PostgreSQL (relational SQL) and pgvector (vector similarity search) as the two paradigms. However, pgvector is a PostgreSQL extension, not a separate database product. The instructor may interpret the requirement as needing two distinct database products or may accept a relational database plus a vector-search paradigm.

**Action before implementation:** Ask the instructor to confirm in writing that PostgreSQL + pgvector counts as the required minimum of two paradigms. If they require a distinct NoSQL product, revise the architecture only then; do not add MongoDB merely as a technology showcase.

## 5. Schema inventory

The supplied DBML contains **21 original tables**. The prepared Version 1 SQL schema has **24 tables**: the existing 21 domains plus three additions:

1. `booking_item_allocations` — records the underlying stock commitment for a direct item rental or each item component of a package booking.
2. `package_embeddings` — stores package text, embedding vector, embedding model name, and embedding timestamp.
3. `booking_status_history` — records status changes for auditability.

### Retained domain tables

| Domain | Tables |
|---|---|
| Identity and access | `users`, `customers`, `vendors`, `customer_addresses` |
| Catalog and inventory | `categories`, `items`, `item_images`, `item_blackout_dates` |
| Packages | `packages`, `package_items` |
| Booking | `bookings`, `booking_items`, `booking_item_allocations`, `waitlist`, `booking_status_history` |
| Financial records | `payments`, `cancellations`, `cancellation_policies`, `vendor_payouts`, `coupons` |
| Trust and communication | `reviews`, `disputes`, `notifications` |
| Semantic retrieval | `package_embeddings` |

### Key schema decisions

- `package_items` uses `(package_id, item_id)` as a composite primary key and validates positive quantities.
- A `booking_items` row must refer to exactly one source: an `item_id` **or** a `package_id`.
- A package and its component items must belong to the same vendor.
- A booking line's vendor must own the selected item or package.
- `booking_item_allocations` stores the item-level reservation produced by a direct rental or an expanded package. It snapshots the rental interval and allocated quantity so later edits to a package do not silently rewrite historical commitments.
- Stock is pool-based: `items.total_stock` represents interchangeable units, not individually serialized chairs or decorations.
- The Version 1 return model releases a complete allocation; partial return events are not a required feature.
- Historical prices and deposits stay on `booking_items` so current catalog price changes do not rewrite previous booking terms.
- Foreign keys, `CHECK` constraints, uniqueness rules, indexes, and triggers enforce database-level integrity where appropriate. Address rows referenced as a customer default or by a booking are restricted from deletion until those references are changed.

## 6. Inventory availability and transaction-safe confirmation

For item `i` over requested interval `R`:

`available(i, R) = total_stock(i) - SUM(active allocation quantities overlapping R)`

A request is feasible only if every required item has enough stock throughout the interval and no relevant blackout period blocks it. Date intervals in this implementation use inclusive rental dates; therefore, bookings sharing a calendar day overlap.

### Confirmation contract

1. Begin a database transaction.
2. Resolve each booking line into required item quantities. For a direct rental, requirement = line quantity. For a package, requirement per component = package component quantity × booked package quantity.
3. Lock every required `items` row in ascending `item_id` order with `SELECT ... FOR UPDATE` to serialize competing allocations and reduce deadlocks.
4. Recalculate overlapping allocations and blackout dates while locks are held. The display-time availability function is not by itself a concurrency guarantee.
5. If any component is unavailable, roll back the complete reservation and return feasible alternatives.
6. If all components are available, insert allocation rows and transition the booking/lines to the appropriate state inside the same transaction.
7. Commit only when all component allocations succeed. Cancellation must release the affected allocations in the same transaction.
8. Expired holds must not consume stock. A confirmed allocation remains committed until released/returned or its relevant booking interval has ended.

This protocol is the primary differentiator and should be demonstrated using two concurrent requests that compete for the last available stock.

## 7. Vector-search design

### Data embedded

Concatenate a package's name, description, and theme tags into a text source. Generate one embedding per package and store:

- `package_id` (primary key and foreign key to `packages`)
- `source_text`
- `embedding` (vector with fixed dimension matching the selected embedding model)
- `embedding_model`
- `embedded_at`

The supplied starter SQL uses the 384-dimensional `sentence-transformers/all-MiniLM-L6-v2` model as an example. If a different model is selected, the vector column dimension must match that model's output dimension. Re-embed package text whenever the source text changes.

### Retrieval pipeline

1. Embed the user's text request.
2. Retrieve a reasonably sized candidate set using cosine distance.
3. Join candidates to `packages`, `vendors`, `package_items`, and `items`.
4. Filter inactive packages and apply exact budget/category/location/date constraints.
5. Validate the stock quantity for every underlying package component for the requested interval.
6. Rank and display the best feasible candidates. Provide alternatives if high-similarity packages are unavailable.

For the academic prototype, exact vector search can be sufficient for a small catalog. The starter schema includes HNSW indexing to demonstrate approximate nearest-neighbour indexing; measure relevance and query time rather than claiming a speed benefit without evidence.

## 8. Advanced DBMS features to demonstrate

1. **Transactions and concurrency:** competing bookings contend for finite stock; only a feasible allocation may commit.
2. **Stored function:** calculate item availability over an interval, including blackout dates and active allocations.
3. **Triggers:** validate package/vendor ownership, validate allocation lineage, maintain booking line totals, and record booking-status history.
4. **Views:** vendor inventory utilization, upcoming bookings, unresolved disputes, and payout summaries.
5. **Indexes:** foreign-key/query indexes, partial unread-notification and waitlist indexes, text-search GIN indexes, and vector HNSW index.
6. **Integrity constraints:** primary/foreign keys, unique constraints, `CHECK` constraints, and valid status/date/amount rules.
7. **Aggregation and joins:** stock-utilization reports, vendor earnings, booking counts, refund totals, and popular categories.

The included SQL defines the schema, indexes, several triggers, the availability function, and vector storage/index. Views and some business-specific functions should be added as a separate migration after the core schema is tested.

## 9. Application architecture

- **Frontend:** Next.js customer storefront, vendor dashboard, and admin dashboard.
- **API:** Next.js Route Handlers with server-side validation and role-based authorization.
- **Database access:** a server-only PostgreSQL client or ORM; never expose database credentials to the browser.
- **Secrets:** environment variables; commit only an `.env.example`, never real passwords or keys.
- **Authentication:** password hashing and protected server endpoints. Do not trust role claims supplied by the browser.
- **Search:** package embedding generation can run through a server-side Python utility or service during package creation/update; the API writes the embedding into `package_embeddings`.
- **Payments:** Version 1 records simulated/manual payment events; no live payment gateway is required.

## 10. Roles

- **Customer:** discover packages, view item availability, create booking requests, review own bookings and payments, cancel according to policy, and join item waitlists.
- **Vendor:** manage owned items/packages, blackout dates, booking requests, returns, payout records, and inventory reports.
- **Administrator:** verify vendors, manage policies/coupons, inspect disputes and platform-level reports.

Server-side authorization must scope database queries by the authenticated user's customer/vendor identity. Hiding UI controls is not sufficient.

## 11. Suggested project milestones

1. Confirm the instructor's database-paradigm interpretation.
2. Finalize the ER diagram and relational schema using the supplied SQL starter as the baseline.
3. Add seed data that includes overlapping item and package bookings.
4. Implement and test availability and allocation transactions before building the full UI.
5. Implement catalog/package/vendor/customer flows and financial lifecycle operations.
6. Add vector embeddings, semantic retrieval, and post-retrieval relational availability validation.
7. Add reporting views, indexes, test cases, screenshots, README and demo script.

## 12. Required test cases

- Available individual item booking succeeds.
- Package allocation expands into every component at the correct quantity.
- Direct item rental and package booking cannot oversell the same item pool.
- Two concurrent bookings for the final units cannot both succeed.
- Blackout dates cause the item/package to be unavailable.
- Cancelled/released allocation no longer consumes stock.
- Expired holds no longer consume stock.
- Invalid line with both `item_id` and `package_id`, or neither, is rejected.
- A vendor cannot book or package another vendor's item.
- Invalid prices, quantities, dates, ratings, refund percentages, and commission amounts are rejected.
- Semantic results are checked against live relational availability before being displayed as bookable.
- Customer/vendor/admin endpoints enforce their role and ownership boundaries.

## 13. DDL requirement

Demonstrate `CREATE`, `ALTER`, and `DROP` using migrations and a disposable test table/schema. Do not drop application tables as part of the normal runtime workflow. Keep schema changes in version-controlled SQL migration files.

## 14. Deliverables

- ER diagram (conceptual and relational views)
- PostgreSQL schema and migration scripts
- Package embedding / vector search implementation
- Next.js application and API integration
- Test dataset and concurrency test evidence
- Advanced SQL queries, views, triggers, indexes, and function documentation
- Architecture diagram, screenshots, testing results, and GitHub README
- Instructor confirmation of the PostgreSQL + pgvector assumption
