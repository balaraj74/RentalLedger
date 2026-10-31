# Decision Log

## D-001 — PostgreSQL plus pgvector
**Decision:** PostgreSQL is the source of truth; `pgvector` is used for semantic package retrieval. 
**Reason:** transactional booking/allocation needs relational constraints; semantic retrieval is useful for text-heavy package themes.
**Caveat:** instructor acceptance of this as two paradigms must be confirmed.

## D-002 — Pool-based inventory
**Decision:** V1 models interchangeable quantities using `items.total_stock`, not individual serialised equipment units.
**Reason:** manageable scope for a two-member course project while preserving meaningful shared-stock constraints.

## D-003 — Shared allocation records
**Decision:** Introduce `booking_item_allocations` so direct rentals and package components consume the same item stock pool.
**Reason:** the key differentiator requires explicit component-level allocation across date intervals.

## D-005 — Unified In-Memory Mock Store with Local Storage Sync
**Decision:** Implement an in-memory data store with browser LocalStorage synchronization for mock mode.
**Reason:** Allows stateful end-to-end interactions (creating items, booking packages, cancelling, returns, payouts, reviews) without requiring an active external database, while maintaining identical transactional contracts to the PostgreSQL schema.

## D-006 — Multi-Role Context & Switcher for Academic Demo
**Decision:** Provide an active role switcher in the global header (Customer: Aarav, Vendor: Ravi Prakash, Admin: Pooja Hegde) that seamlessly re-scopes views, navigation, and mock authorization.
**Reason:** Enables full demonstration of customer discovery and booking, vendor inventory and fulfillment, and admin governance within a single browser session.

Add new decisions with date, context, options, accepted choice and implications.

