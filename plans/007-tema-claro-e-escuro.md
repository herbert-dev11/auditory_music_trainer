# 007 — Tema claro e escuro

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, RF27 (novo).

## Problema

O app já seguia o tema do sistema operacional, mas o usuário não podia escolher. O autor pediu tema claro e escuro.

**Dentro:** botão de tema, escolha guardada no navegador.
**Fora:** outros temas (alto contraste, cores personalizadas).

## Decisões

- **Três estados: do sistema → claro → escuro**, num botão só, no topo da tela. Só claro/escuro (rejeitado: quem gosta de seguir o sistema perderia isso).
- **CSS por variáveis**: o tema claro é o padrão; o escuro vale quando o sistema pede e não há `data-tema="claro"` no `<html>`, ou quando há `data-tema="escuro"`. As duas listas de cores escuras são iguais (duplicadas de propósito: CSS não tem como reaproveitar a mesma lista nos dois seletores sem pré-processador).
- **Escolha guardada no `RepositorioDePreferencias`** (chave `treinador:tema`), aplicada em `main.ts` **antes** de desenhar a tela, para não piscar no tema errado.
- **Teclas do piano com cores próprias por tema** (`--tecla-branca`, `--tecla-preta`): no escuro, a tecla branca fica cinza-claro para não ofuscar.

## Dados

Uma chave no `localStorage`: `treinador:tema` (`sistema`/`claro`/`escuro`).

## API

Tela alterada: **Biblioteca**. Ganha o botão de tema ao lado do título. Quando houver tela inicial (fase 2), o botão vai para um cabeçalho comum.

## Riscos

- Contraste das cores novas (`--marca`, teclas) não foi medido com ferramenta; conferir à mão (RNF11).

## Critério de pronto

- [x] Variáveis de cor para claro e escuro em `estilo.css`, com `color-scheme` certo em cada tema
- [x] `ui/tema.ts`: `aplicarTema` e botão que alterna e guarda
- [x] Preferência `tema` em `dados/preferencias.ts`, tolerante a falha do armazenamento
- [ ] Conferido à mão: os três estados, a escolha sobrevive a recarregar a página, sem piscar

## Histórico

- 2026-11-12: pedido do autor; plano escrito e implementado no mesmo dia.
