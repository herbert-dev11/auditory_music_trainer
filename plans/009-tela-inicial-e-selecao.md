# 009 — Tela inicial, navegação e seleção do jogo (fase 2)

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, fase 2 do Roteiro: RF01, RF02, RN07 e UC01. Também a navegação entre as telas que já existem (biblioteca) e as que vão existir (jogo, teoria).

## Problema

O app abre direto na biblioteca. Não há tela inicial, nem como escolher o que treinar antes de jogar. A biblioteca precisa virar uma das opções, ao lado do jogo e da teoria.

**Dentro:** tela inicial, navegação entre telas, tela de seleção do jogo (instrumento, notas ou acordes, raízes, tipos de acorde), regra do mínimo de 2 itens, última seleção guardada, telas provisórias de teoria e de partida.
**Fora:** o jogo em si (fase 3); conteúdo da teoria (RF19, plano próprio); contas de usuário (RF23, [plano 002](002-back-end.md)).

## Decisões

- **Tela inicial**: nome do sistema, frase curta e quatro opções: Iniciar jogo, Biblioteca de sons, Teoria musical e "Entrar / Sair — em breve" (desabilitado: o MVP não tem contas; decisão do autor).
- **Navegação por hash** (`#/`, `#/biblioteca`, `#/jogo`, `#/jogo/partida`, `#/teoria`): funciona no GitHub Pages sem configurar o servidor, e os botões voltar/avançar do navegador funcionam. Roteador com biblioteca externa (rejeitado: são 5 rotas).
- **Barra comum no topo** de todas as telas: "← Início" (fora da tela inicial) e o botão de tema. O botão de tema saiu da biblioteca.
- **Ao trocar de tela**: a tela anterior é desmontada (a biblioteca cancela a demonstração e a voz), o título da aba muda e o foco vai para o título da tela nova (leitor de tela e teclado).
- **Notas e acordes não se misturam na mesma partida** (decisão do autor): primeiro se escolhe Notas ou Acordes. Misturar deixaria "dó" ambíguo (nota ou dó maior, RN03).
- **Tipos de acorde = as 5 qualidades** (maiores, menores, com sétima, menores com sétima, com sétima maior), as mesmas da biblioteca. O rascunho do PROJECT.md tinha três tipos ("sétima" juntando 7, m7 e 7M), o que não deixava treinar só os menores com sétima, por exemplo.
- **Contrato `Selecao` em `src/contratos/selecao.ts`**: `{ instrumento, modo, raizes, qualidades }`. O [plano 002](002-back-end.md) usava `tipos: TipoDeAcorde[]`; foi emendado para `qualidades`.
- **Lógica pura em `exercicio/selecao.ts`**: `itensDaSelecao`, `podeComecar` (RN07, mínimo 2 itens) e `lerSelecao`, que valida o que vem do armazenamento (dado salvo pode estar corrompido ou ser de uma versão antiga).
- **A tela mostra quantos e quais itens entram** (UC01, passo 4), com "Selecione pelo menos 2 itens" e "Começar" desabilitado abaixo de 2 (UC01, A1).
- **Última seleção guardada** no `RepositorioDePreferencias` (`treinador:ultimaSelecao`), salva a cada mudança; a tela abre com ela.
- **"Começar" leva a uma tela provisória da partida**, que mostra a seleção e avisa que o jogo entra na fase 3. Ela some quando o jogo existir.
- **Teoria musical: tela "em breve"** com os temas previstos no RF19 (decisão do autor).
- **Tocador carrega uma vez só**: voltar à biblioteca não baixa os sons de novo (`carregar()` resolve na hora se já carregou).

## Dados

- Uma chave no `localStorage`: `treinador:ultimaSelecao` (JSON do tipo `Selecao`).
- Lê: as preferências existentes (tema, voz, simplificado).

## API

Telas novas: **Início** (`#/`), **Novo jogo** (`#/jogo`, seleção), **Partida** (`#/jogo/partida`, provisória), **Teoria musical** (`#/teoria`, provisória). Tela alterada: **Biblioteca** (`#/biblioteca`), que perde o botão de tema (foi para a barra comum).

## Riscos

- A tela provisória da partida pode parecer "quebrada" para quem testar; o texto deixa claro que o jogo vem na fase 3.
- `ui/` sem teste automático; a regra de seleção (RN07) e a validação do dado salvo estão testadas em `exercicio/`.

## Critério de pronto

- [x] `contratos/selecao.ts` e `exercicio/selecao.ts` com testes (naturais + menores = Cm…Bm; notas sustenidas = 5; mínimo de 2; dado salvo inválido)
- [x] Roteador por hash com barra comum, desmontagem, título e foco
- [x] Tela inicial com as quatro opções ("Entrar / Sair" desabilitado)
- [x] Tela de seleção com instrumento, modo, raízes, tipos, contagem, lista e "Começar"
- [x] Telas provisórias de partida e de teoria
- [x] Última seleção guardada; tocador sem recarregar
- [x] PROJECT.md, [architecture.md](../docs/architecture.md) e plano 002 atualizados
- [ ] Conferido à mão: navegação, voltar do navegador, teclado, celular

## Histórico

- 2026-11-12: pedido do autor (tela inicial com nome, iniciar jogo, biblioteca, teoria e sair; tela de jogo com instrumento e tipos de nota). Decisões do autor: "Sair" desabilitado, teoria "em breve", sem misturar notas e acordes.
