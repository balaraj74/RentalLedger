# Frontend Specification — Rental Ledger V1

## Global shell
- Professional, warm-neutral interface with deep navy/ink, restrained terracotta/amber, sage status accents, high contrast, generous whitespace and compact information design.
- Top-level sidebar and global page header; collapse navigation on small screens.
- Show current role, account affordance, notification count, global search where useful, and environment/demo status.
- Reuse page title/actions, filter toolbar, data table/card list, status badges, confirmation dialogs, toast/alert patterns, skeletons, empty states and error states.

## Required routes

### Public/customer discovery
- `/` or `/catalog`: discover items and decoration packages with search, category/theme filters, budget, date interval and relevant images.
- `/catalog/[packageId]`: package details, included items/quantities, vendor information, price, date selection, availability explanation, request-booking CTA.
- `/items/[itemId]`: item details, rental price, deposit, total stock label that does not disclose another vendor's private allocation data, date/quantity selection.
- `/auth/sign-in`, `/auth/sign-up`: accessible forms, schema validation, errors and demo login directions if auth is mocked.
- `/customer/bookings`: customer-owned bookings, booking detail, payment status, cancellation eligibility and waitlist state.
- `/customer/payments`: own payment/advance/refund records.
- `/customer/profile`: own profile and address management.

### Vendor workspace
- `/dashboard`: operational summary: upcoming events, pending requests, inventory utilisation/alerts, outstanding payouts and recent activity.
- `/inventory`: searchable/filterable item table, create/edit item, categories, quantities, price/deposit, condition, images and active status.
- `/inventory/[itemId]`: item detail, current stock pool, blackout dates, bookings/allocations timeline and image gallery.
- `/packages`: package table and package builder; component quantities must be positive and the UI must preview underlying item requirements.
- `/bookings`: filter by status/date/customer; accept/reject requests; inspect item/package breakdown and recorded payment state; handle return/complete and cancellation with confirmation.
- `/bookings/[bookingId]`: booking timeline, items/allocations, dates, price snapshots, payments, dispute/cancellation history and allowed next actions.
- `/customers`: customer records visible to the signed-in vendor only when linked to their bookings; avoid broad unnecessary personal data.
- `/payments`: payment records and vendor payout statements.
- `/waitlist`: pending waitlist requests for vendor items, with notify/expire actions where allowed.
- `/reviews`: reviews/responses and disputes attached to this vendor's bookings.
- `/reports`: stock utilization, item/package demand, upcoming reservations, cancellation rates and settlement summaries.
- `/settings`: business profile, contact details, notification preferences and role/session information.

### Admin workspace
Admin views may reuse pages but must provide admin-specific scope and permissions. Include `/admin/vendors`, `/admin/users`, `/admin/disputes`, `/admin/policies`, `/admin/coupons`, and `/admin/reports`.

## Required interaction patterns
- Search and filters update displayed data; include clear/reset filter behavior.
- Create/edit forms validate required fields and field-specific errors.
- Destructive or money-related actions require confirmation and explain the consequence.
- Use pending state to prevent duplicate submissions. Disable a submit only while its operation is pending or prerequisites are invalid.
- Use success/error feedback after mutations. Do not use blocking `alert()` as the primary UX.
- Tables: loading, empty, filtered-empty, error, sort, pagination or a clearly justified “load more” pattern.
- Use date-only fields consistently for rental dates. Do not treat `end_date` inclusivity inconsistently across UI components.
- Display booking and allocation status as text plus color/icon where helpful.
- All pages work at 360px, 768px, 1024px and wide desktop. Tables may use horizontal scrolling or switch to cards on mobile.

## Booking journey acceptance
1. Customer searches package by free-text theme, dates, budget and category.
2. Search results show semantic relevance separately from live availability.
3. Customer opens details and selects interval/quantity.
4. Server checks all package component quantities and current reservations.
5. On confirmed reservation, UI shows booking ID, dates, price snapshot, payment/deposit details and current status.
6. If availability changes due to concurrency, UI shows a conflict message and fresh alternative options. It must not assume a stale availability response guarantees success.

## Design constraints
- No neon/cyberpunk styling, fake AI glitter, or decorative charts without purpose.
- Keep data density suitable for vendor operations.
- Do not invent ratings, payment states, live availability or verified-vendor status as production facts. Fixtures are demo data.
- Empty pages must explain how to create/populate the relevant data and include a valid next action.
