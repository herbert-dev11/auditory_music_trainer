# Treinador Musical Auditivo

Aplicação web de treino auditivo com **resposta por voz**: o app toca uma nota ou um acorde de violão, pergunta "Que nota é essa?" e você responde falando ("dó", "lá menor", "dó sustenido menor"). O jogo segue até o primeiro erro; a pontuação é a sequência de acertos.

- Produto, requisitos e roteiro: [docs/PROJECT.md](docs/PROJECT.md)
- Cifras e nomes falados: [docs/nomenclatura.md](docs/nomenclatura.md)
- Arquitetura: [docs/architecture.md](docs/architecture.md)
- Licenças e créditos: [docs/licencas.md](docs/licencas.md)
- Pesquisa das fontes de som (base para o relatório): [docs/pesquisa-de-sons.md](docs/pesquisa-de-sons.md)

## Como rodar

Requer Node.js 24. Para a voz: Chrome (computador ou Android) ou iPhone.

App publicado (HTTPS, necessário para o microfone): https://herbert-dev11.github.io/auditory_music_trainer/

```bash
npm install
npm run dev
```

Testes: `npm test`. Detalhes em [docs/getting-started.md](docs/getting-started.md).

## Licença

O **código** deste projeto terá licença própria, ainda a decidir (sugestão: MIT; pendência do [plano 001](plans/001-configuracao-do-projeto.md)). Até lá, o `package.json` diz `UNLICENSED`.

Os **sons** não são cobertos pela licença do código: continuam sob a licença de seus autores.

| Sons | Autor | Licença |
|---|---|---|
| Violão nylon (`public/samples/guitar-nylon/`) | quartertone (Freesound), reempacotado por Nicholaus P. Brosowsky (tonejs-instruments) | CC BY 3.0 |
| Piano (`public/samples/piano/`) | Alexander Holm (Salamander Grand Piano) | CC BY 3.0 |

Quem reutilizar os sons precisa dar crédito aos autores, conforme a CC BY. Créditos completos em [CREDITS.md](CREDITS.md); bibliotecas e versões em [docs/licencas.md](docs/licencas.md).

**Status:** fase 2 (tela inicial, navegação e seleção do jogo), [plano 009](plans/009-tela-inicial-e-selecao.md); interface em React + Mantine, [plano 010](plans/010-react-e-mantine.md). Fase 1 (som de violão e de piano; biblioteca com desenho, demonstração nota por nota, anúncio por voz, tema claro/escuro, acordes abertos e modo simplificado) nos planos [003](plans/003-som-do-violao-e-biblioteca.md) a [008](plans/008-acordes-abertos-pestana-e-simplificado.md). Próximo: o jogo (fase 3). Pendências da fase 0 no [plano 001](plans/001-configuracao-do-projeto.md).

---

Este repositório segue o template da organização: regras, estrutura e documentos que **todo repo deve seguir**.

## O que todo repo tem

- `IA.md` — guia operacional para agentes de IA (e humanos); regras duras
- `docs/PROJECT.md` — especificação de produto (português, fonte da verdade)
- `docs/architecture.md`, `docs/getting-started.md`, `docs/testing.md` — mergulhos técnicos (inglês)
- `plans/` — um arquivo por feature (`NNN-nome-curto.md`); plano antes do código
- `opencode.json` — aponta as instruções para o `IA.md`
- `.env.example`, `.gitignore`, `Dockerfile`, CI

## Como uma feature entra

Todo trabalho mora em `plans/`: um arquivo por feature, numerado na ordem em que foi escrito. O plano vem antes do código e fica no repositório depois como registro do que foi decidido e por quê.

### O que um plano contém

```
# NNN — <nome>

## Problema
O que a operação não consegue fazer hoje, em termos concretos.

## Decisões
As escolhas feitas e a opção rejeitada, uma linha cada. É esta a parte que o
você-do-futuro lê.

## Dados
Tabelas/coleções novas e quais dados existentes são lidos (e de onde).

## API
Endpoints/telas: entrada, saída, quem pode chamar.

## Riscos
O que pode dar errado, e o que aceitamos.

## Critério de pronto
O checklist que diz que terminou.
```

Manter curto. Um plano que leva uma hora para ler não vai ser lido.

### Regras

- Nada novo sem plano (regra dura no `IA.md`).
- Plano errado é emendado, não apagado.
- Escopo mora em `docs/PROJECT.md`; plano implementa uma fatia e aponta de volta.
