# Testing

The goal is the confidence to ship, not a coverage number.

## What deserves a test

- Pure logic with branches.
- Dangerous boundaries: auth decisions, validation, money arithmetic, idempotency, PII masking.
- Every bug you fix — red first, then green.

In this project that means, above all:

- **Speech interpretation** (`dominio/`): transcript → `{ pitchClass, quality }` or "not understood". The cases in [nomenclatura.md](nomenclatura.md) are written as tests **before** the code (phase 5).
- **Names and enharmonics** (`dominio/`): `C#` and `Db` share pitch class 1; chord symbol → spoken name.
- **Drawing items from filters** (`exercicio/`): "naturals + minor" yields exactly Cm…Bm; fewer than 2 items blocks the game (RN07).
- **Game state machine** (`exercicio/`): second chance (RN04), game over on a wrong answer (RN05), "listen again" restarts the timer (RN06).
- **`calcularEstatisticas`**: pure, shared later with the API.

## What does not

- Framework glue or anything the typechecker already proves.
- Real paid/shared services. Fakes injected through deps; real-service checks run by hand, never in CI.
- Tone.js playback and the real Web Speech API: checked by hand in the browser. Phase 4 has a dedicated speech test page (`#/teste-da-fala`, [plan 012](../plans/012-teste-da-fala.md)) that exports a CSV of what each browser understood; the classification, summary and CSV logic (`exercicio/testeDaFala.ts`) and the text normalization (`dominio/normalizacao.ts`) are unit-tested.

## How

- **Runner:** Vitest. `npm test` runs once; `npm run test:watch` watches.
- **Layout:** tests next to the code, `src/**/*.test.ts`.
- **Coverage:** `@vitest/coverage-v8`, measured only on `src/dominio/**` and `src/exercicio/**`, 80% threshold (RNF10).
- **Fakes:** the game receives a `ReconhecedorDeFala`, a player and a clock through its dependencies. Tests pass fakes that return scripted transcripts, finish "playing" instantly and advance time manually — no microphone, audio or real timers.
- **CI:** `.github/workflows/ci.yml` runs typecheck and tests on every push to `main` and on pull requests.
- **Manual checks:** recognition rate (RNF07) and latency (RNF08) are measured by hand with real voices in phase 8, never in CI.
