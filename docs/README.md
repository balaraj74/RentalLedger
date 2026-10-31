# Rental Ledger Documentation Index

Start with the product brief and frontend spec, then architecture, API contract, database artifacts and implementation roadmap.

- [`product/PRODUCT_BRIEF.md`](product/PRODUCT_BRIEF.md): purpose, users, scope, key differentiator.
- [`product/FRONTEND_SPEC.md`](product/FRONTEND_SPEC.md): routes and acceptance criteria for UI journeys.
- [`product/DESIGN_SYSTEM.md`](product/DESIGN_SYSTEM.md): visual and interaction rules.
- [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md): boundaries and system architecture.
- [`architecture/API_CONTRACT.md`](architecture/API_CONTRACT.md): frontend service contract and API direction.
- [`architecture/INSTRUCTOR_ASSUMPTION.md`](architecture/INSTRUCTOR_ASSUMPTION.md): course interpretation to confirm.
- [`database/rental_ledger_schema.sql`](database/rental_ledger_schema.sql): SQL baseline supplied with this starter.
- [`database/Rental_Ledger_V1_blueprint.md`](database/Rental_Ledger_V1_blueprint.md): original implementation blueprint.
- [`implementation/ROADMAP.md`](implementation/ROADMAP.md): milestones and vertical slices.
- [`implementation/ACCEPTANCE_TESTS.md`](implementation/ACCEPTANCE_TESTS.md): behavior-level test scenarios.
- [`implementation/IMPLEMENTATION_STATUS.md`](implementation/IMPLEMENTATION_STATUS.md): maintained by the coding agent.

## Source-of-truth hierarchy
Product rules in `AGENT.md` and `PRODUCT_BRIEF.md` override demo fixture assumptions. SQL describes the intended data baseline but must be validated against a real PostgreSQL/pgvector instance before production use. If a conflict is found, document it in `implementation/DECISIONS.md` and keep the app in a safe, explicit mock mode until resolved.
