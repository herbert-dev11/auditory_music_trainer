# IA.md — Guidance for AI agents (and humans)

> Todo repo da org nasce deste template. Se este arquivo mandar X e o repo fizer Y, o repo está errado — ajuste o repo, não este arquivo (mudança de regra se discute e versiona aqui).

Keep changes small, scoped, and consistent with what already exists.

## What this is

- Authoritative product spec: `docs/PROJECT.md` (in Portuguese). When this file, the docs and PROJECT.md disagree, PROJECT.md wins.
- `README.md` is the developer overview; `docs/` holds the deep dives. This file is the short operational guide — it points at them rather than repeating them.
- Every feature arrives with its own plan in `plans/`.

## Stack & layout

Describe here on repo creation: language, framework, layers (example: routes → controllers → services → data). See `docs/architecture.md`.

## Commands

Describe here on repo creation. Minimum contract:

- install deps
- run dev
- run tests (`npm test` or equivalent)
- typecheck/lint

## Hard rules — do not break these

- Only commit or push with the user's explicit permission.
- No new table, endpoint, screen, or lane without a plan in `plans/` first.
- Never commit secrets: `.env` is gitignored; keep it that way.
- Tests never touch production or paid APIs. Fakes injected through deps; real-service checks run by hand, never in CI.
- No PII (CPF, phone, email) in logs, errors, plans, PRs, or task comments. Mask by default.
- A wrong plan is amended, not deleted — the wrong path is part of the record.
- Every change made must be reflected back into its plan in `plans/` — code and plan never drift apart.

## Adding a feature

1. Write `plans/NNN-nome-curto.md` (see README for the template).
2. Implement in small slices; each slice keeps the suite green.
3. Update the docs that describe the change.
4. The plan stays in the repo as the record of what was decided and why.

## Testing

See `docs/testing.md`. The goal is confidence to ship, not coverage numbers. Tests run in CI (`.github/workflows/ci.yml`).

## Conventions

- Plans and `PROJECT.md` in Portuguese; technical docs in `docs/` in English.
- Thin edges (routes/controllers), domain rules in services, data access isolated.
- Types/contracts defined once, never hand-written per call site; frontend reuses backend contracts, never rewrites shapes.
- Error shape: `{ error: "codigo_snake", details?: ... }`.
