# Testing and Quality Gate

Before declaring a feature complete:
- `npm run lint`
- `npm run typecheck`
- `npm test` (when tests exist)
- `npm run build`
- Manually smoke-test affected routes at desktop and mobile widths.

Test important behavior, not just rendering:
- invalid forms are rejected with useful messages;
- search, filtering, sorting, pagination, dialogs and navigation actually work;
- role-based access is enforced server-side;
- stock availability handles overlapping intervals and package component aggregation;
- cancellation releases the right allocations and does not release unrelated stock;
- two concurrent requests cannot reserve more than available stock;
- vector search results are subsequently filtered by exact business constraints;
- no secrets are committed or exposed;
- no console errors, hydration errors, inaccessible icon buttons, or inert primary CTAs.

If a real PostgreSQL service is unavailable, run all checks that can run locally and list database integration tests as blocked—not passed.
