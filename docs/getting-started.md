# Getting started

> The project skeleton is created by [plan 001](../plans/001-configuracao-do-projeto.md). Until it is done, the commands below describe the target setup.

## Prerequisites

- Node.js 24 LTS (includes npm)
- Chrome or Edge (desktop) — the only browsers with speech recognition (RNF01)
- Microphone and headphones (headphones keep the mic from hearing the app's own sound)
- Internet connection for speech recognition (Web Speech sends audio to the browser vendor)

## Setup

1. `npm install`
2. No `.env` is needed in the MVP (no secrets). `.env.example` stays as the placeholder for the future back-end.

## Run

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at `http://localhost:5173` |
| `npm test` | Run tests once |
| `npm run test:watch` | Re-run tests on file changes (exit with `q`) |
| `npm run coverage` | Tests + coverage (80% threshold on `dominio/` and `exercicio/`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build in `dist/` |

## Notes

- `.env` is gitignored — never commit it.
- The microphone only works on `localhost` or HTTPS. Opening the dev server through a LAN IP (e.g. on a phone) will block the mic.
- Audio starts only after a click (browser autoplay policy).
- If speech synthesis is silent, check that a pt-BR voice is installed in the operating system.
