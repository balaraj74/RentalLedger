# Workflow: Integrate a Backend

1. Read `docs/architecture/API_CONTRACT.md` and `docs/database/rental_ledger_schema.sql` before writing queries.
2. Use server-only modules for PostgreSQL connections and privileged operations.
3. Implement or confirm authenticated user identity and role checks before accessing data.
4. Keep a provider interface so mock and PostgreSQL implementations share the same UI DTOs.
5. Never expose DB credentials in browser bundles. Use `.env.local` and server-only environment variables.
6. For booking confirmation, call a server endpoint/function that validates stock and persists allocations atomically. Do not have the browser execute a multi-step “check stock then write booking” sequence.
7. Handle conflicts as a normal domain outcome (`409` or equivalent) with a clear user-facing alternative path.
8. Test missing rows, authorization failures, invalid values, transaction rollback and concurrent bookings.
