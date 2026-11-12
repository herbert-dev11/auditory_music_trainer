# 008 — Acordes abertos, pestana no desenho e modo simplificado

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, RF05 (voicing do violão), RF26 (desenho) e RF28 (novo).

## Problema

O violão usava só formas com pestana: `C` saía x35553, e não o x32010 que todo estudante aprende primeiro. Vários acordes ficavam difíceis de tocar e soavam diferentes do que o estudante conhece. O desenho também não mostrava a pestana, só os pontos. O autor pediu acordes mais simples e um botão "Simplificado" com o desenho mais fácil.

**Dentro:** tabela de acordes abertos, barra da pestana no diagrama, versão simplificada (4 cordas) dos acordes com pestana, botão "Simplificado".
**Fora:** escolher entre vários desenhos do mesmo acorde; dedilhado (qual dedo em cada casa).

## Decisões

> **Emenda de 2026-11-12 (pedido do autor):** com o botão desligado, os acordes voltam a ser os de antes (formas com pestana do [plano 003](003-som-do-violao-e-biblioteca.md): C = x35553, G = 355433). Os acordes abertos passam a fazer parte do **modo simplificado**: ligado, mostra o aberto quando existe e, senão, a versão de 4 cordas. As decisões abaixo continuam valendo, com essa troca de lugar. Motivo: o autor quer o desenho de referência com pestana como padrão e o fácil só sob pedido.

- ~~**Acordes abertos primeiro, pestana só quando não existe forma aberta**~~ **(emendado: só no modo simplificado)** (a opção "rejeitada por ora" no [plano 003](003-som-do-violao-e-biblioteca.md), agora adotada). Tabela em `dominio/violao.ts`, conferida nota por nota:

  | Qualidade | Abertos na tabela | Saem da forma móvel na casa 0 |
  |---|---|---|
  | maior | C x32010, D xx0232, G 320003 | E 022100, A x02220 |
  | `m` | Dm xx0231 | Em 022000, Am x02210 |
  | `7` | C7 x32310, D7 xx0212, G7 320001, B7 x21202 | E7 020100, A7 x02020 |
  | `m7` | Dm7 xx0211 | Em7 020000, Am7 x02010 |
  | `7M` | C7M x32000, D7M xx0222, F7M xx3210, G7M 320002 | E7M 021100, A7M x02120 |

- **C7 sem a quinta** (x32310), como se toca. Os testes: no desenho completo, exatamente as notas do acorde e a raiz no baixo; no simplificado, só notas do acorde, com raiz, terça e sétima (a quinta pode faltar).
- **F maior fica com a pestana inteira** (133211) no desenho completo: é a forma de referência. O F "pequeno" (xx3211) é o simplificado. Um rascunho desta implementação pôs xx3211 na tabela de abertos (rejeitado quando entrou o botão Simplificado).
- **Resumo dos dois modos:**

  | | Desligado (padrão) | Simplificado |
  |---|---|---|
  | C, D, G, Dm, C7, D7, G7, B7, Dm7, C7M, D7M, F7M, G7M | Forma com pestana (C = x35553) | Aberto (C = x32010) |
  | E, A e variações | Aberto (forma na casa 0) | Igual |
  | Outros (F, F#, Bm, C#m...) | Forma com pestana | Versão de 4 cordas |
  | Notas isoladas | Uma corda | Igual |
- **Pestana como dado do desenho** (`pestana(item)`: casa, da corda, até a corda), não deduzida dos pontos: deduzir errava, por exemplo, o D (xx0232) parecia ter pestana na casa 2. O diagrama desenha uma barra arredondada por trás dos pontos, e a descrição em texto diz "pestana na Nª casa".
- **Modo simplificado = versão de 4 cordas do acorde com pestana**:
  - pestana desde a 6ª corda (forma de mi): ficam a 4ª à 1ª (F → xx3211, F# → xx4322, Fm → xx3111);
  - pestana desde a 5ª corda (forma de lá): ficam a 5ª à 2ª (Bm → x2443x, C#7 → x4646x).

  A primeira versão cortava sempre para a 4ª à 1ª; o teste mostrou que na forma de lá isso tirava a raiz dos acordes com sétima (a raiz está na 5ª corda). A pestana encolhe para as cordas presas na casa dela; com uma corda só, some (vira um dedo comum). Acordes abertos e notas isoladas não mudam.
- **O som segue o desenho também no simplificado** (o voicing sai sempre de `casas()`): o que se vê é o que se ouve.
- **Botão "Simplificado"** no painel do item, só no violão e só para acordes, com `aria-pressed`; a escolha fica guardada (`treinador:simplificado` no `RepositorioDePreferencias`). Desligado por padrão.

## Dados

Uma chave no `localStorage`: `treinador:simplificado` (`sim`/`nao`).

## API

Tela alterada: **Biblioteca**. O diagrama do violão ganha a barra da pestana; o painel ganha o botão "Simplificado".

## Riscos

- Na forma simplificada de mi, o baixo deixa de ser a raiz (F# xx4322 tem o baixo em F#, mas F7 simplificado tem o baixo em mib). Para o treino auditivo, o acorde continua o mesmo; aceito.
- A escolha do que é "mais simples" é uma regra única; alguns acordes podem ter versões simples melhores (por exemplo, Bm7 x20202). Ajustar caso a caso se o autor pedir.

## Critério de pronto

- [x] Tabela de abertos e regra "aberto primeiro" em `dominio/violao.ts`, com testes dos desenhos
- [x] `pestana(item, simplificado)` com testes (formas de mi e de lá, F, abertos sem pestana, barra só sobre cordas presas)
- [x] `simplificado` em `casas`, `pestana`, `voicingDoViolao` e `voicing`, com testes (4 cordas, abertos iguais, raiz/terça/sétima mantidas nos 60 acordes)
- [x] Barra da pestana no diagrama e na descrição em texto
- [x] Botão "Simplificado" na biblioteca, com a preferência guardada
- [x] PROJECT.md (RF28), [architecture.md](../docs/architecture.md) e planos 003 e 006 atualizados
- [ ] Conferido à mão: desenho e som dos abertos, pestana desenhada, botão Simplificado

## Histórico

- 2026-11-12: pedidos do autor ("alguns acordes são difíceis, não tem mais simples?", "a pestana é desenhada?" e "coloque um botão de simplificado"); plano escrito e implementado no mesmo dia.
- 2026-11-12: o autor pediu os acordes anteriores de volta com o botão desligado ("eles estão simplificados com o botão desligado"); os abertos passaram para o modo simplificado (emenda no topo das Decisões).
