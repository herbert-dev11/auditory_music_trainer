# 006 — Desenho do item e demonstração nota por nota

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, RF26 (novo) e UC03.

## Problema

Na biblioteca, o acorde soa de uma vez, e o estudante não sabe quais notas o formam nem onde ficam no instrumento. O autor pediu um comportamento como o dos dicionários de acordes (por exemplo, o do Cifra Club): ver o desenho e ouvir corda por corda, ou tecla por tecla, antes do acorde inteiro.

**Dentro:** desenho do item (braço do violão, teclado do piano), demonstração nota por nota com a nota que soa acesa no desenho, botões para repetir.
**Fora:** desenho e demonstração dentro do jogo (lá o desenho entregaria a resposta); desenhos alternativos do mesmo acorde.

## Decisões

- **Desenhos e sons próprios**: o comportamento é inspirado nos dicionários de acordes, mas nada do Cifra Club entra no app (RNF05). Os diagramas são SVG gerados pelo código a partir do voicing.
- **Clique num item = abre o painel e toca nota por nota**; o painel tem "Nota por nota" e "Acorde" para repetir (nota isolada: só "Tocar de novo"). Manter o clique tocando só o acorde (rejeitado: o autor pediu a demonstração).
- **Roteiro puro em `dominio/demonstracao.ts`**: lista de passos `{ emMs, indices }`, com 450 ms entre notas e 650 ms de pausa antes do acorde. É testável sem áudio. Os índices são posições no voicing, e a tela acende o elemento do desenho com o mesmo índice.
- **No violão, a ordem é da 6ª para a 1ª corda**, só as cordas tocadas; no acorde inteiro continua o dedilhado de 30 ms. **No piano, do grave para o agudo**; no acorde inteiro, as teclas juntas.
- **Nota isolada também ganha desenho**: no violão, a corda que deixa a casa mais baixa (corda solta quando dá), em `casas()`; o voicing do violão passou a sair sempre do desenho, então som e desenho não podem divergir.
- **Diagrama do violão**: vertical, 6ª corda à esquerda, 5 casas visíveis, × para corda abafada e ○ para solta; quando o desenho passa da 5ª casa, mostra o número da primeira casa. A pestana aparece como pontos, sem a barra (rejeitado por ora: só estética). **Emendado em 2026-11-12:** a barra passou a ser desenhada ([plano 008](008-acordes-abertos-pestana-e-simplificado.md)).
- **Teclado do piano**: duas oitavas, C3 a B4, que cobrem todos os itens.
- **Painel fixo no topo da tela** (`position: sticky`), para o desenho ficar visível enquanto o usuário rola a lista.
- **Acessibilidade**: o SVG fica oculto para leitor de tela (`aria-hidden`) e o painel mostra uma descrição em texto ("Violão, da 6ª para a 1ª corda: x 3 5 5 5 3"; "Piano, teclas: dó, mi, sol"). Com `prefers-reduced-motion`, sem transição.
- **Cada clique novo cancela a demonstração anterior** (passos agendados, voz e destaque).
- **A voz (RF25) fala depois que o som do último passo acaba**: `Tocador.tocar` passou a devolver quantos ms faltam para o som acabar.

## Dados

Nenhum.

## API

Tela alterada: **Biblioteca**. Ganha o painel do item selecionado (cifra, nome, descrição, desenho e botões), entre os controles e a lista.

## Riscos

- Os passos usam `setTimeout`; em aba em segundo plano, o navegador pode atrasá-los. Aceito para a biblioteca.
- O painel fixo ocupa altura na tela do celular; conferir em tela pequena (RNF09).
- `ui/` sem teste automático; o roteiro e o desenho do violão (`casas`) estão testados em `dominio/`.

## Critério de pronto

- [x] `dominio/demonstracao.ts` com testes (ordem, tempos, nota isolada, roteiro vazio)
- [x] `casas()` desenha a nota isolada numa corda; `voicingDoViolao` sai do desenho; testes atualizados
- [x] `ui/diagramas.ts`: braço do violão e teclado do piano, com os elementos na ordem do voicing
- [x] Painel na biblioteca, com demonstração, botões, cancelamento e descrição em texto
- [ ] Conferido à mão no Chrome e no celular: cada corda/tecla acende enquanto soa, depois o acorde; o painel não atrapalha a rolagem

## Histórico

- 2026-11-12: pedido do autor ("igual o Cifra Club: teclas/cordas por vez, aí executa o acorde"); plano escrito e implementado no mesmo dia.
