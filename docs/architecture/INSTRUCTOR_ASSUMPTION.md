# Course Requirement Assumption — Confirm with Instructor

## Chosen architecture
Rental Ledger V1 uses **PostgreSQL + pgvector**. PostgreSQL stores authoritative relational business records and transactions; pgvector provides vector embeddings and similarity search over decoration package descriptions/themes.

## Assumption
We are interpreting the course requirement “two (minimum) or more database paradigms” to accept a relational SQL database plus a vector-search paradigm implemented through PostgreSQL's `pgvector` extension.

## Why this is technically justified
- Booking, stock, allocations, payments and vendor settlements require relational integrity and transaction-safe consistency.
- Package descriptions/themes are text-heavy and can benefit from embedding-based semantic retrieval.
- Keeping embeddings alongside the source product metadata reduces cross-database synchronization while separating search relevance from transactional correctness.

## Risk
An instructor may interpret the requirement as two separate database products or require one SQL plus one NoSQL database. PostgreSQL with pgvector is not a separate NoSQL product. If the rubric requires a separate NoSQL system, the course requirement must take precedence and the architecture needs an additional justified data store.

## Confirmation question
“Does PostgreSQL with the pgvector extension satisfy the requirement for a minimum of two database paradigms (relational SQL and vector search), or do you require a separate NoSQL product such as MongoDB/Neo4j?”

Do not claim that this requirement is definitively satisfied until the instructor confirms the interpretation.
