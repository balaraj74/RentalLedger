# Repository instructions for coding agents

Read `AGENT.md` first; it is the complete task brief. Then read the project rules in `.agent/rules/` and product/architecture docs in `docs/` before modifying the app.

## Priority order
1. `AGENT.md` and `docs/product/PRODUCT_BRIEF.md` define scope and invariants.
2. `docs/product/FRONTEND_SPEC.md` defines routes, actions, and UX expectations.
3. `docs/architecture/ARCHITECTURE.md` and `docs/architecture/API_CONTRACT.md` define boundaries and integration contracts.
4. The existing implementation and `docs/implementation/DECISIONS.md` define accepted code decisions unless a decision is explicitly superseded.

Keep the project runnable. Work in milestones, implement vertical slices, verify with lint/typecheck/tests/build, update `docs/implementation/IMPLEMENTATION_STATUS.md`, and do not stop after planning. Use mock data when external services are unavailable but make the mock boundary explicit. Never fabricate successful API persistence.
