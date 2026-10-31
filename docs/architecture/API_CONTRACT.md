# Frontend Service/API Contract

This document defines the intended boundary. Exact routes may evolve, but DTO semantics and authorization rules must remain stable.

## Envelope and errors
Use JSON for success responses. For errors, return a stable machine-readable `code`, human-readable `message`, and optional field errors. Suggested HTTP status: `400` invalid input, `401` unauthenticated, `403` forbidden, `404` missing resource, `409` inventory conflict/state conflict, `422` domain validation, `500` unexpected server error. Do not expose SQL error details or secrets.

## Suggested endpoints

### Identity
- `GET /api/session` → session user + role, or unauthenticated state.
- `POST /api/auth/sign-in` and `POST /api/auth/sign-out` → use a vetted auth implementation or provider; do not hand-roll password storage.

### Catalog / package discovery
- `GET /api/catalog/items?query=&categoryId=&minPrice=&maxPrice=&startDate=&endDate=`
- `GET /api/catalog/items/:itemId`
- `GET /api/catalog/packages?query=&theme=&minPrice=&maxPrice=&startDate=&endDate=`
- `GET /api/catalog/packages/:packageId`
- `POST /api/catalog/packages/search` → accepts a natural-language brief and filters; returns semantic candidates plus exact availability status.

### Vendor inventory
- `GET /api/vendor/items`
- `POST /api/vendor/items`
- `GET /api/vendor/items/:itemId`
- `PATCH /api/vendor/items/:itemId`
- `DELETE /api/vendor/items/:itemId` → soft-deactivate when referenced; do not break historical bookings.
- `POST /api/vendor/items/:itemId/blackout-dates`
- `GET /api/vendor/packages`
- `POST /api/vendor/packages`
- `PATCH /api/vendor/packages/:packageId`

### Bookings / allocations
- `POST /api/bookings/availability` → advisory availability query, never a reservation.
- `POST /api/bookings` → validates request and atomically creates booking plus all item allocations; return conflict if stock changed.
- `GET /api/bookings?scope=mine|vendor&status=&startDate=&endDate=`
- `GET /api/bookings/:bookingId`
- `POST /api/bookings/:bookingId/accept`
- `POST /api/bookings/:bookingId/reject`
- `POST /api/bookings/:bookingId/cancel`
- `POST /api/bookings/:bookingId/return` → server validates allowed transition and release/return state.

### Payments / operations
- `GET /api/payments?scope=mine|vendor`
- `POST /api/payments/record` → simulated payment only unless a vetted provider is configured.
- `GET /api/waitlist`
- `POST /api/waitlist`
- `POST /api/waitlist/:id/notify`
- `GET /api/reviews` / `POST /api/reviews`
- `GET /api/disputes` / `POST /api/disputes` / `POST /api/disputes/:id/resolve`
- `GET /api/reports/summary`

## Authorization
- Customers: own profile, addresses, bookings, payments, reviews and waitlist.
- Vendors: own items/packages and their own booking fulfilment, payout and reviews/disputes relevant to their bookings.
- Admin: permitted platform operations with audit trail.
- Every endpoint checks identity and ownership server-side. Never rely on client-provided `customerId`, `vendorId`, amount, commission, status or total.

## Booking response shape (illustrative)

```ts
type BookingCreateResult = {
  bookingId: number;
  status: "pending" | "partially_confirmed" | "confirmed";
  totalAmount: string;
  depositAmount: string;
  currency: "INR";
  startDate: string;
  endDate: string;
  allocationSummary: Array<{
    itemId: number;
    itemName: string;
    requestedQuantity: number;
    allocatedQuantity: number;
  }>;
};
```

## Vector search requirements
- Input: natural-language event/theme description, optional budget/date/location/category filters.
- Embedding search returns package IDs and relevance scores only.
- Join candidate IDs back to authoritative package/vendor/item/availability tables and apply exact constraints.
- Exclude inactive packages, unverified vendor listings if policy requires, dates outside availability, and packages over budget.
- Explain no-result states and suggest broadening theme, dates, or budget; do not invent stock.
