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
| `tone` | runtime | `Sampler` with the guitar (tonejs-instruments) and piano (Salamander) samples, both CC BY |
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
  dominio/     items (notes, chords), spoken names, instruments and their voicings (guitar, piano),
               speech interpretation, calcularEstatisticas (pure)
  exercicio/   drawing items from the filters + game state machine (pure)
  audio/       Tocador interface + TocadorDeAmostras (one Sampler per instrument; plays MIDI lists)
  fala/        Narrador (speech synthesis, pt-BR); ReconhecedorDeFala interface + WebSpeech implementation
  contratos/   types shared with the future API: Selecao (done), Partida, Resposta, Estatisticas
  dados/       repository interfaces (matches, preferences) + local implementation (localStorage)
  ui/          hash router + common top bar (rotas.ts); home, selection, library, game, theory screens
```

Rules:

1. `dominio/` and `exercicio/` import nothing from `audio/`, `fala/`, `ui/`, nor any browser API. This is what makes them fully testable (RNF10).
2. Speech recognition is behind the `ReconhecedorDeFala` interface, so Vosk can replace Web Speech later and tests can inject a fake.
3. Screens only know the repository interfaces in `dados/`, never `localStorage` directly. When the back-end arrives, `...Api` implementations replace `...Local` ones ([plan 002](../plans/002-back-end.md)).
4. Types in `contratos/` are defined once and reused; never hand-written per call site.

### Navigation

Hash routes (`#/`, `#/biblioteca`, `#/jogo`, `#/jogo/partida`, `#/teoria`), so GitHub Pages needs no server config and browser back/forward work ([plan 009](../plans/009-tela-inicial-e-selecao.md)). `ui/rotas.ts` draws a common top bar ("← Início" and the theme button), unmounts the previous screen (each `montar...` may return a cleanup function), updates the tab title and moves focus to the new screen's `<h1>`. Every screen receives the same `DependenciasDoApp` (players, narrator, preferences) from `main.ts`.

The selection rules (which items enter the game, RN07's minimum of 2, validating a stored selection) live in `exercicio/selecao.ts` and are unit-tested.

### Spoken names

Chords are **root + quality**, each with a tiny vocabulary; spoken names are generated, never stored as a full list. Details and test cases: [nomenclatura.md](nomenclatura.md).

### Guitar voicings

A chord is not played as stacked notes but as a guitar shape. `dominio/violao.ts` computes it as pure code ([plan 003](../plans/003-som-do-violao-e-biblioteca.md), [plan 008](../plans/008-acordes-abertos-pestana-e-simplificado.md)):

1. **Default (full) mode**: two **movable shapes** per quality, E-shape (root on the 6th string) and A-shape (root on the 5th), whichever has the lower fret (`C` = x35553). At fret 0 they become the open E and A chords.
2. **Simplified mode** (the "Simplificado" button): the open chord when one exists (a small table: C x32010, D xx0232, G 320003, Dm, C7, D7, G7, B7...); otherwise 4 strings of the barre shape (strings 4–1 for E-shape, 5–2 for A-shape), always keeping root, third and seventh.
3. The barre (`pestana(item, simplificado)`) is part of the shape data, not inferred from the dots, and the diagram draws it.

Single notes play in the C3–B3 octave, on the string with the lowest fret. The voicing is always derived from the drawing, so what you see is what you hear.

### Piano voicings

`dominio/piano.ts`: single notes play in C4–B4; chords in close root position (root in C3–B3, intervals stacked), all notes struck together ([plan 004](../plans/004-piano.md)). `dominio/instrumentos.ts` holds the `Instrumento` type and `voicing(instrumento, item)`, which picks the guitar or piano voicing. Items are the same on both instruments; only the sound changes.

### Playback

### Note-by-note demonstration

`dominio/demonstracao.ts` builds a pure script of steps `{ emMs, indices }` (each note alone, then the whole chord). Indices point into the voicing; `ui/diagramas.ts` draws the guitar fretboard / piano keyboard as SVG and returns one element per voicing index, so the library lights up the string or key that is sounding ([plan 006](../plans/006-demonstracao-nota-por-nota.md)). On guitar, the voicing is derived from `casas()`, so sound and drawing cannot diverge.

`audio/` only receives the MIDI list. `Tocador.tocar` resolves with the milliseconds until the sound ends, so screens can speak or move on afterwards. `TocadorDeAmostras` is configured per instrument (sample folder, sample list, default delay between notes: 30 ms strum on guitar, 0 ms on piano). Screens and the game depend on the `Tocador` interface, so tests can inject a fake.

## Data

| Data | Where | Who reads/writes |
|---|---|---|
| Finished matches (`Partida`) | `localStorage`, via `RepositorioDePartidas` | The game writes; result/statistics read |
| Last selection (`Selecao`) | `localStorage` key `treinador:ultimaSelecao` (JSON, validated by `lerSelecao` on read), via `RepositorioDePreferencias` | Selection screen, provisional match screen ([plan 009](../plans/009-tela-inicial-e-selecao.md)) |
| "Announce names" on/off (RF25) | `localStorage` key `treinador:anunciarNomes`, via `RepositorioDePreferencias` | Library screen ([plan 005](../plans/005-anuncio-por-voz.md)) |
| Simplified guitar chords (RF28) | `localStorage` key `treinador:simplificado`, via `RepositorioDePreferencias` | Library screen ([plan 008](../plans/008-acordes-abertos-pestana-e-simplificado.md)) |
| Theme (RF27) | `localStorage` key `treinador:tema` (`sistema`/`claro`/`escuro`), via `RepositorioDePreferencias`; applied as `data-tema` on `<html>` before the first render | `main.ts`, theme button ([plan 007](../plans/007-tema-claro-e-escuro.md)) |
| Voice audio | **Nowhere** (RNF03) | — |
| Audio samples | `public/samples/guitar-nylon/` (29 `.mp3`, B1–A#5, tonejs-instruments) and `public/samples/piano/` (14 `.mp3`, A2–C6, Salamander Grand Piano), copied unmodified; credits in `CREDITS.md`, source research in [pesquisa-de-sons.md](pesquisa-de-sons.md). Fallback: record our own, following [gravacao-de-samples.md](gravacao-de-samples.md) (which notes to record on piano and on guitar, per string) | Tone.js `Sampler` |

No secrets in the MVP, so no `.env` is needed yet. The back-end's variables are listed in [plan 002](../plans/002-back-end.md).
