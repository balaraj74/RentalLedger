# Agent Working Style

- Continue until the agreed scope is implemented or a genuine external blocker prevents progress.
- Do not ask the user to approve every ordinary implementation choice; make conservative choices consistent with the docs and record them.
- Ask a question only when a decision materially changes schema, authorization, data ownership, or external cost. Otherwise proceed with a documented assumption.
- Do not silently delete or replace user-authored files.
- Before broad refactors, inspect imports, call sites, and current behavior.
- Avoid TODO-only implementations for the main user journeys. If an external dependency is unavailable, build a coherent mock provider and a typed integration seam.
- Keep status notes concise and factual. Record tests with command and result.
- Prefer a complete vertical slice over many empty route files.
