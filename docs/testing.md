# Testing

The goal is the confidence to ship, not a coverage number.

## What deserves a test

- Pure logic with branches.
- Dangerous boundaries: auth decisions, validation, money arithmetic, idempotency, PII masking.
- Every bug you fix — red first, then green.

## What does not

- Framework glue or anything the typechecker already proves.
- Real paid/shared services. Fakes injected through deps; real-service checks run by hand, never in CI.

## How

TODO: runner, layout, fakes, CI file.
