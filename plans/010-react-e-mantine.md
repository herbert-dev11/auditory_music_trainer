# 010 — Interface em React com Mantine

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, RNF09 (responsivo) e RNF11 (acessibilidade). Muda a camada `ui/`; nenhum requisito funcional novo.

## Problema

A interface feita à mão (DOM + CSS próprio) ficou feia na avaliação do autor, e cada tela nova exige montar elementos e estados à mão. O [plano 001](001-configuracao-do-projeto.md) deixou React "para se as telas crescerem": com tela inicial, seleção, biblioteca, teoria e o jogo chegando, cresceram.

**Dentro:** trocar `ui/` por componentes React estilizados com Mantine, mantendo todas as funções atuais (navegação, biblioteca, desenho, demonstração, voz, simplificado, tema, seleção).
**Fora:** mudar regras, domínio, áudio, voz ou preferências; o jogo (fase 3).

## Decisões

- **React 19 + Mantine 9** (decisão do autor). Mantine traz componentes prontos (abas, caixas, botões, cartões), tema claro/escuro e acessibilidade embutidos; o visual melhora sem depender de olho de designer. Tailwind (rejeitado: a beleza dependeria de escolhas visuais à mão) e CSS próprio redesenhado (rejeitado: mais trabalho para o mesmo acabamento).
- **Licenças conferidas no registro do npm em 2026-11-12**, todas MIT: `react` e `react-dom` 19.3.1, `@mantine/core` e `@mantine/hooks` 9.8.0, `@vitejs/plugin-react` 6.3.0, `@types/react` e `@types/react-dom` 19.3.0. Entram no [licencas.md](../docs/licencas.md) neste mesmo trabalho.
- **Sem `postcss-preset-mantine`**: ele só serve para escrever CSS com as funções do Mantine; aqui o estilo vem das propriedades dos componentes e de pouco CSS próprio. Entra se for preciso.
- **Sem biblioteca de rotas**: a navegação por hash do [plano 009](009-tela-inicial-e-selecao.md) continua, agora num hook (`useRota`). React Router (rejeitado: são 5 rotas).
- **Só `ui/` muda.** `dominio/`, `exercicio/`, `contratos/`, `audio/`, `fala/` e `dados/` ficam como estão; as telas recebem as mesmas dependências (`DependenciasDoApp`) por contexto do React.
- **Tema pelo Mantine, guardado nas nossas preferências**: um `colorSchemeManager` próprio lê e grava no `RepositorioDePreferencias` (`sistema` ↔ `auto`, `claro` ↔ `light`, `escuro` ↔ `dark`). A chave `treinador:tema` continua valendo.
- **Desenhos do violão e do piano viram componentes SVG**; a nota que soa é marcada pelo estado do React (índices acesos), não mais por manipulação de classes.
- **Arquivos `.tsx` em `ui/`**; o `estilo.css` encolhe para o que o Mantine não cobre (cores do desenho).
- **Paleta anterior mantida** (pedido do autor durante a migração): cor `madeira` de 10 tons no tema, com o marrom #8a4b14 no claro e o âmbar #e0a56b no escuro; fundo, texto, texto apagado e bordas da paleta anterior via `cssVariablesResolver`. O fundo da página é `--fundo` e o dos cartões é o `body` do Mantine (branco no claro, #22221f no escuro), como era antes. O primeiro rascunho usava o índigo do Mantine (rejeitado pelo autor).
- **Contraste no escuro**: o `autoContrast` do Mantine calcula a cor do texto pelo tom do claro, e o texto ficava branco sobre o âmbar. Botões preenchidos e marcas de caixa e rádio recebem texto escuro (#171715) no escuro, via CSS (com `!important`, porque o Mantine põe a cor em variáveis no próprio elemento).
- **Responsivo primeiro** (RNF09, lembrado pelo autor): grades viram uma coluna em tela estreita; o painel do item quebra o desenho para baixo do texto. Conferido em capturas a 500 px (o Edge sem janela não desenha abaixo de ~500 px, então capturas a 390 px saem cortadas sem ser defeito).

## Dados

Nenhum dado novo. Continuam as chaves do `localStorage` dos planos 005, 007, 008 e 009.

## API

Mesmas telas e rotas (`#/`, `#/biblioteca`, `#/jogo`, `#/jogo/partida`, `#/teoria`), com visual novo.

## Riscos

- Pacote final maior (React + Mantine): medido em 2026-11-12, 571 KB de JS e 249 KB de CSS (antes: 243 KB e 7 KB). Aceito por ora; dá para reduzir importando só o CSS dos componentes usados e dividindo o código por tela.
- Mantine 9 e React 19.3 são versões recentes; se algo não funcionar, fixar a versão anterior e registrar aqui.
- `ui/` continua sem teste automático (como no [testing.md](../docs/testing.md)); conferência à mão.

## Critério de pronto

- [x] Dependências instaladas e registradas no `licencas.md`; `vite.config.ts` com o plugin do React; `tsconfig` com JSX
- [x] `MantineProvider` com tema, paleta anterior e `colorSchemeManager` sobre as preferências
- [x] Telas em React: barra comum, início, seleção, biblioteca (abas, painel, desenho, demonstração, voz, simplificado), partida e teoria provisórias
- [x] Arquivos antigos de `ui/` removidos
- [x] `npm run typecheck`, `npm test` e `npm run build` passam
- [x] [architecture.md](../docs/architecture.md), plano 001 e README atualizados
- [x] Capturas de tela conferidas (início, seleção, biblioteca; claro e escuro; 500 px)
- [ ] Conferido à mão no Chrome e num celular de verdade (som, voz, toque)

## Histórico

- 2026-11-12: pedido do autor ("a estilização está horrível, vamos usar React"); escolha do Mantine pelo autor. Durante a migração, o autor pediu a paleta anterior e lembrou que o app deve ser bom no celular; ajustes registrados nas Decisões.
