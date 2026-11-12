# 001 — Configuração do projeto (fase 0)

Escopo: [PROJECT.md](../docs/PROJECT.md), fase 0 do Roteiro.

## Problema

Não há projeto executável: ninguém consegue rodar o app, os testes nem o CI. Toda fase seguinte depende de um esqueleto com build, testes e checagem de tipos.

## Decisões

- **Vite + TypeScript sem framework**: o MVP tem poucas telas; o foco é áudio e lógica. React fica para se as telas crescerem.
- **Framework de UI já no começo (rejeitado)**: custo de aprendizado sem ganho no MVP. **Revisto em 2026-11-12:** com as telas crescendo, a interface passou para React + Mantine ([plano 010](010-react-e-mantine.md)).
- **TypeScript 7 com `strict`**: tipos fortes no domínio musical (`"maior" | "menor"`).
- **Tone.js + Tonal**: Tone toca os samples (`Sampler`); Tonal faz as contas de teoria (MIDI, classe de altura, notas do acorde). Ambos MIT.
- **smplr (rejeitado por enquanto)**: alternativa ao `Sampler`; só entra se o `Sampler` não servir.
- **Vitest com cobertura só em `dominio/` e `exercicio/`, mínimo 80%** (RNF10): a meta vale para a lógica pura, não para a cola com o navegador.
- **Testes ao lado do código** (`src/**/*.test.ts`).
- **`npm test` roda uma vez** (`vitest run`); o modo observação fica em `test:watch`, para o terminal não ficar "preso".
- **Dockerfile com nginx**: o app é estático; o modelo do template (servidor Node em `dist/server.js`) não se aplica.
- **CI em Node 24**: mesma versão do ambiente local.
- **Esqueleto gerado numa pasta temporária e copiado**: o `npm create vite .` numa pasta com arquivos arrisca sobrescrever `docs/` e o `.gitignore`.
- **`CLAUDE.md` e `.claude/` no `.gitignore`**: instruções de ferramentas de IA ficam só na máquina do autor; as regras do repositório estão no `IA.md`.

## Dados

Nenhum.

## API

Nenhuma tela nova: `src/main.ts` só escreve o título na página.

## Riscos

- TypeScript 7 e Vitest 5 são versões recentes; se alguma ferramenta (ESLint, typescript-eslint) ainda não suportar, fixar a versão anterior e registrar aqui.
- A licença do código ainda não foi decidida; enquanto isso o `package.json` diz `UNLICENSED`.

## Critério de pronto

- [x] Projeto Vite + TypeScript (`strict`), página em pt-BR
- [x] `tone` e `tonal` instalados; `vitest` e `@vitest/coverage-v8` instalados
- [x] Scripts `dev`, `build`, `typecheck`, `test`, `test:watch`, `coverage`
- [x] Versões e licenças registradas em [licencas.md](../docs/licencas.md)
- [x] `npm run typecheck`, `npm test` e `npm run build` passam
- [ ] ESLint + Prettier configurados, com script `lint` e passo no CI (entram em `licencas.md` no mesmo PR)
- [ ] CI verde no GitHub
- [ ] Licença do código decidida e arquivo `LICENSE` criado (sugestão: MIT)
- [x] `CREDITS.md` criado quando o primeiro som entrar (fase 1, [plano 003](003-som-do-violao-e-biblioteca.md))

## Histórico

A configuração foi feita primeiro no repositório anterior (`Treinador_Musical_Auditivo`, PR #1) e trazida para cá em 2026-11-11, quando o projeto passou a seguir este template.
