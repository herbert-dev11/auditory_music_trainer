# IA.md — Guidance for AI agents (and humans)

> Todo repo da org nasce deste template. Se este arquivo mandar X e o repo fizer Y, o repo está errado — ajuste o repo, não este arquivo (mudança de regra se discute e versiona aqui).

Keep changes small, scoped, and consistent with what already exists.

## What this is

- Authoritative product spec: `docs/PROJECT.md` (in Portuguese). When this file, the docs and PROJECT.md disagree, PROJECT.md wins.
- `README.md` is the developer overview; `docs/` holds the deep dives. This file is the short operational guide — it points at them rather than repeating them.
- Every feature arrives with its own plan in `plans/`.

## Stack & layout

TypeScript (`strict`) + Vite, UI in React 19 with Mantine 9 (plan 010); static SPA published on GitHub Pages. Audio with Tone.js, music theory with Tonal, speech with the browser's Web Speech API and `speechSynthesis`. Tests with Vitest. See `docs/architecture.md`.

Layers under `src/`: `ui/` (React components) → `exercicio/` (game state machine) → `dominio/` (notes, chords, spoken names, speech interpretation). `audio/`, `fala/` and `dados/` are adapters injected into the game. `dominio/` and `exercicio/` stay pure: no Tone.js, no Web Speech, no DOM, no `localStorage`.

## Commands

- install deps: `npm install`
- run dev: `npm run dev` (http://localhost:5173)
- run tests: `npm test` (once) · `npm run test:watch` · `npm run coverage`
- typecheck: `npm run typecheck` · lint: `npm run lint` (pending, plan 001)
- build: `npm run build`

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

### Project conventions

- Code identifiers and comments in Portuguese (the music domain is pt-BR).
- Notes are compared by pitch class (0–11), never by text (RN01). See `docs/nomenclatura.md`.
- `docs/nomenclatura.md` (spoken pt-BR names, domain rules) and `docs/licencas.md` (license inventory for the thesis) are kept in Portuguese.
- Only audio samples with a free license; record the source in `CREDITS.md`. Nothing from sites without an explicit license.
- Every new dependency or sound goes into `docs/licencas.md` in the same PR, with the license checked at the source.
- One branch per task, Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), PR to `main`, merge only with green CI.
- No AI attribution in commits or PRs (no `Co-Authored-By` trailers, no "Generated with" lines).
- Working mode: the author writes the code; AI agents guide, review and help with tests. No full implementations without an explicit request.
