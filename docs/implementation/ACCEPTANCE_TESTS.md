# Acceptance and Test Scenarios

## UI and navigation
- Each route in `FRONTEND_SPEC.md` loads directly and navigation highlights the active route.
- Sidebar/menu works with keyboard and collapses at narrow widths.
- Every primary CTA has a complete action or is explicitly marked unavailable.
- All forms show field-level validation and prevent duplicate submission while pending.
- Search/filter/reset/sort/pagination affect visible results.
- Every data view has loading, normal, empty, filtered-empty and error states.

## Data integrity and availability
1. **Direct item booking:** total stock 200; no active reservations; request 120 → available.
2. **Package allocation:** package needs 120 of item X; stock 200; request package → creates allocation of 120 from X.
3. **Mixed reservation:** after package consumes 120, an overlapping direct rental of 100 of X → conflict; 80 → may succeed.
4. **Shared package stock:** two different packages both contain item X; allocations are aggregated against the same X pool.
5. **Partial interval:** reservation overlaps only some requested days; availability is evaluated for each relevant date segment, not just the start date.
6. **Blackout:** a required item is blacked out in any part of the requested period → package/item is not bookable for the whole period unless partial fulfillment is explicitly allowed.
7. **Cancellation:** released allocation no longer consumes stock after successful state transition; repeating cancellation is idempotent or returns a clear state conflict.
8. **Concurrent request:** two simultaneous requests cannot allocate beyond total stock; at most feasible reservations commit.
9. **Stale UI availability:** availability estimate says available but another booking commits first; confirm action returns conflict and UI refreshes availability.
10. **Price snapshot:** vendor changes current item price after confirmation; historical booking total stays unchanged.
11. **Role boundary:** customer cannot inspect another customer booking; vendor cannot edit another vendor inventory; non-admin cannot resolve admin-only disputes.
12. **Vector search:** relevant semantic results return; each candidate then undergoes exact date/budget/stock filters. A high similarity score never bypasses stock constraints.

## Quality and runtime
- `npm run lint` succeeds.
- `npm run typecheck` succeeds.
- `npm test` succeeds (if tests have been added; do not omit tests merely to make the command pass).
- `npm run build` succeeds.
- No secret appears in browser bundles or committed files.
- Test outcomes are documented with pass/fail/blocked, environment and command.
