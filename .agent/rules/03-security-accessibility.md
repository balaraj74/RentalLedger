# Security, Authorization, Accessibility

- Every server-side data operation must verify the current user and role. Hiding a button in the UI is not authorization.
- Customers may access only their own bookings, payments, addresses, and reviews.
- Vendors may access only their own items, packages, booking fulfilment records, payouts, and business analytics.
- Admin actions require explicit admin authorization and should be auditable.
- Never store plaintext passwords or payment-card data.
- Never send database URLs, privileged keys, or private provider secrets to Client Components or `NEXT_PUBLIC_*` variables.
- Validate and normalize all input on the server. Use parameterized database operations; no string-concatenated SQL.
- Avoid trusting user-supplied vendor IDs, amounts, commissions, statuses, or availability results.
- Forms need labels, clear errors, logical tab order and keyboard support. Status must not be communicated by color alone.
- Use `aria-*` only when needed; prefer semantic HTML. Every icon-only button must have an accessible name.
- Respect reduced-motion settings; do not rely on animations for information.
