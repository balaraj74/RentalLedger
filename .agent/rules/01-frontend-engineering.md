# Frontend Engineering Rules

- Next.js App Router, TypeScript strict mode, React Server Components by default.
- Use Client Components only when interaction, browser APIs, local state, or event handlers require them.
- Keep domain models and API DTOs typed. Never let raw database rows leak directly through UI components.
- Keep data access behind repository/service interfaces; UI components should not know whether data is mocked or remote.
- Validate submitted data at the server/API boundary; client validation is for fast feedback, not trust.
- Use reusable layout, form, table, dialog, badge, empty-state, skeleton, and alert primitives. Prefer native semantics.
- Use clear route naming and avoid duplicate screens copied with minor text changes; make domain-specific components reusable.
- All important actions need pending/success/error feedback and keyboard-accessible controls.
- Provide empty/loading/error states for asynchronous data.
- All list/search/filter/pagination controls shown to users must function or be explicitly disabled with an explanation.
- Avoid deprecated or experimental Next.js APIs. Verify version-specific conventions against official docs.
- Keep dates and amounts formatted centrally. UI timezone is the event/local timezone; do not silently mix UTC date-only values with local timestamps.
- No fake live metrics: demo fixtures must be marked as sample/demo data wherever a user could mistake them for production data.
