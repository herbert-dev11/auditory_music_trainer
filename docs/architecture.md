# Architecture

Product scope and requirement IDs (RF, RNF, RN) live in [PROJECT.md](PROJECT.md). This file describes how the app is built.

## Processes

The MVP is a **static single-page app** that runs entirely in the browser. There is no server: it is built by Vite and published on GitHub Pages (HTTPS, which the microphone requires).

Main flow of one game (UC02), as a state machine:

```
explanation → countdown → playing → asking → listening → evaluating → feedback → playing ...
                                                ↑           │
                                                └───────────┘  not understood / silence (second chance, RN04)
feedback (wrong answer) or "Stop" → result
"Listen again" while listening → playing (timer restarts, RN06)
```

- **playing**: Tone.js plays the drawn note or chord (chords strum string by string, ~30 ms apart).
- **asking**: `speechSynthesis` says "Que nota é essa?" in pt-BR.
- **listening**: the microphone opens only after sound and voice have finished (RNF02); the timer runs (5 s notes / 8 s chords, RN02).
- **evaluating**: the transcript (all alternatives) is interpreted into `{ pitchClass, quality }` and compared by pitch class (RN01).

Browser APIs used:

| API | Use | Caveat |
|---|---|---|
| Web Audio API (via Tone.js) | Play samples | Audio unlocks only after a user gesture (`Tone.start()` on a click) |
| Web Speech API (`SpeechRecognition`) | Recognize the spoken answer | Chrome/Edge only; audio is processed by the browser vendor's servers (RNF04); needs internet |
| `speechSynthesis` | Ask the question | A pt-BR voice may not be installed; check `getVoices()` early |
| `getUserMedia` | Microphone permission | HTTPS or `localhost` only; audio is never recorded (RNF03) |

## Packages

Licenses and versions are tracked in [licencas.md](licencas.md); every new dependency is added there in the same PR.

| Package | Kind | Purpose |
|---|---|---|
| `tone` | runtime | `Sampler` with the `guitar-nylon` samples (tonejs-instruments, CC BY) |
| `tonal` | runtime | Music theory: MIDI numbers, pitch classes, chord notes |
| `vite` | dev | Dev server and build |
| `typescript` | dev | Type checking (`strict`) |
| `vitest`, `@vitest/coverage-v8` | dev | Tests and coverage |
| `eslint`, `prettier` | dev | Lint and formatting |

No UI framework in the MVP (vanilla TypeScript + DOM). Revisit if screens grow.

## Module shapes

Code identifiers and folders are in Portuguese (the music domain is pt-BR).

```
src/
  dominio/     notes, chords, enharmonics, spoken names, speech interpretation, calcularEstatisticas (pure)
  exercicio/   drawing items from the filters + game state machine (pure)
  audio/       Sampler, guitar voicings (movable shapes), strum delay
  fala/        ReconhecedorDeFala interface + WebSpeech implementation; speech synthesis
  contratos/   types shared with the future API: Selecao, Partida, Resposta, Estatisticas
  dados/       repository interfaces (matches, preferences) + local implementation (localStorage)
  ui/          home, selection, library, game, result screens
```

Rules:

1. `dominio/` and `exercicio/` import nothing from `audio/`, `fala/`, `ui/`, nor any browser API. This is what makes them fully testable (RNF10).
2. Speech recognition is behind the `ReconhecedorDeFala` interface, so Vosk can replace Web Speech later and tests can inject a fake.
3. Screens only know the repository interfaces in `dados/`, never `localStorage` directly. When the back-end arrives, `...Api` implementations replace `...Local` ones ([plan 002](../plans/002-back-end.md)).
4. Types in `contratos/` are defined once and reused; never hand-written per call site.

### Spoken names

Chords are **root + quality**, each with a tiny vocabulary; spoken names are generated, never stored as a full list. Details and test cases: [nomenclatura.md](nomenclatura.md).

### Guitar voicings

A chord is not played as stacked notes: `C` is `x32010` (C3 E3 G3 C4 E4). Voicings come from a few **movable shapes** per quality (E-shape and A-shape barre chords), positioned by the root.

## Data

| Data | Where | Who reads/writes |
|---|---|---|
| Finished matches (`Partida`) | `localStorage`, via `RepositorioDePartidas` | The game writes; result/statistics read |
| Last selection (`Selecao`) | `localStorage`, via `RepositorioDePreferencias` | Selection screen |
| Voice audio | **Nowhere** (RNF03) | — |
| Audio samples | `public/samples/` or the tonejs-instruments URL during development | Tone.js |

No secrets in the MVP, so no `.env` is needed yet. The back-end's variables are listed in [plan 002](../plans/002-back-end.md).
