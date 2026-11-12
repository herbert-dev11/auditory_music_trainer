# 011 — Jogo com botões (fase 3)

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, fase 3 do Roteiro: RF03, RF04, RF05, RF08, RF10, RF12–RF15, RN02, RN05, RN06, e o UC02 respondendo por botões. A voz (pergunta falada, microfone, reconhecimento) é a fase 6.

## Problema

A seleção do jogo já existe ([plano 009](009-tela-inicial-e-selecao.md)), mas "Começar" leva a uma tela provisória. Falta o jogo: ouvir, responder, acertar ou errar, e ver o resultado. Fazer primeiro com botões valida toda a lógica e a interface sem depender do reconhecimento de fala, e os botões continuam como alternativa quando não há microfone (RF15).

**Dentro:** explicação, contagem 3-2-1, sorteio, som, cronômetro, resposta por botões, "Ouvir de novo", "Parar", acerto e erro, fim no primeiro erro, tela de resultado.
**Fora:** voz sintética, microfone e reconhecimento (fase 6); recorde guardado (RF17) e estatísticas (RF21), que dependem de guardar partidas.

## Decisões

- **Máquina de estados pura em `exercicio/partida.ts`**: `(estado, evento) → estado`, sem relógio, som nem DOM. Estados: `explicacao → contagem → tocando → respondendo → acerto | erro → … → resultado` (o desenho do [architecture.md](../docs/architecture.md), sem `perguntando` e `ouvindo`, que são da voz). Eventos: `comecar`, `tique` (contagem), `somAcabou`, `responder(item)`, `tempoEsgotou`, `ouvirDeNovo`, `parar`, `seguir`. Toda regra de negócio fica testável aqui.
- **A tela cuida do tempo e do som** (`ui/Partida.tsx`): agenda a contagem, toca pelo `Tocador` (que já diz quando o som acaba), roda o cronômetro e manda os eventos para a máquina. Relógio e sorteio são injetados, para os testes não dependerem de tempo real nem de acaso.
- **Sorteio sem repetir o item da rodada anterior**: repetir seguido parece defeito e treina menos. Com 2 itens, alterna. Sorteio puramente aleatório (rejeitado).
- **Cronômetro começa quando o som acaba** (RN02: 5 s para notas, 8 s para acordes), igual ao microfone na fase 6 (RF07). Os botões de resposta ficam desabilitados enquanto o som toca, pelo mesmo motivo. Barra de progresso visível que esvazia (RF08).
- **Tempo esgotado usa a segunda chance (RN04)**: a regra vale para o silêncio na voz, e no jogo com botões o tempo esgotado é o equivalente. A primeira vez avisa "Tempo esgotado, tente de novo" e toca de novo; a segunda vez encerra como erro. Assim a máquina já nasce com a segunda chance que a fase 6 usa para "não entendi".
- **Resposta errada encerra na hora (RN05)**: mostra "Errou! Era dó maior", toca o som certo mais uma vez (E1) e vai para o resultado.
- **Acerto**: "Acertou!" por cerca de 1 s, soma 1 à sequência e sorteia o próximo.
- **"Ouvir de novo" reinicia o cronômetro (RN06)** e não gasta a segunda chance. "Parar" encerra a qualquer momento a partir da contagem (A5) e vai para o resultado.
- **Botões de resposta pensados para o celular**:
  - notas: uma grade com só as notas da seleção, botões grandes;
  - acordes com um tipo só: grade de raízes;
  - acordes com mais de um tipo: dois passos, primeiro a raiz e depois o tipo (no máximo 12 + 5 botões, em vez de até 60 numa grade só).
- **Comparação pela classe de altura (RN01)** e pela qualidade, com uma função pura (`mesmoItem`). Nos botões não há ambiguidade de nome; a regra RN03 ("dó" = dó maior) é da fala e entra na fase 5.
- **O som do jogo segue a preferência "Simplificado" do violão**: soa igual ao que o usuário treinou na biblioteca. O acorde toca inteiro (dedilhado no violão, junto no piano), sem a demonstração nota por nota, que entregaria a resposta.
- **Resultado (RF14)**: sequência de acertos, lista dos itens acertados, o item do erro (se houve) e os botões "Jogar de novo" (mesma seleção), "Mudar seleção" e "Início".
- **A partida não é guardada nesta fase**: o contrato `Partida` do [plano 002](002-back-end.md) entra quando houver recorde (RF17) ou histórico. A máquina já registra, a cada resposta, o item esperado, o respondido, o resultado e o tempo, para não precisar mudar depois.
- **Explicação antes de começar (RF03)**: texto curto de como o jogo funciona e o botão "Começar", que também é o gesto que libera o áudio no navegador.
- **Acessibilidade**: a contagem, o "Acertou!/Errou!" e o aviso de tempo esgotado vão numa região `aria-live`; tudo funciona pelo teclado; a barra do cronômetro tem o tempo em texto para leitor de tela.

## Dados

Nenhum dado novo guardado. Lê a última seleção (`treinador:ultimaSelecao`) e a preferência `treinador:simplificado`.

## API

Tela substituída: **Partida** (`#/jogo/partida`), com as fases explicação, contagem, jogo e resultado. A tela provisória do plano 009 sai.

## Riscos

- Os tempos (contagem, intervalo depois do acerto) são `setTimeout`; em aba em segundo plano, o navegador pode atrasá-los. Aceito.
- O primeiro som pode atrasar se as amostras ainda não carregaram: carregar durante a explicação e só liberar "Começar" quando estiverem prontas.
- Dois passos para responder acordes custam um toque a mais; conferir com o autor se incomoda.

## Critério de pronto

- [ ] `exercicio/partida.ts` com testes: contagem, sorteio sem repetir, acerto soma, erro encerra (RN05), tempo esgotado com segunda chance (RN04), "Ouvir de novo" reinicia o tempo e não gasta a chance (RN06), "Parar" (A5), registro das respostas
- [ ] `mesmoItem` (RN01) testado
- [ ] Tela da partida: explicação, contagem, cronômetro, botões em um ou dois passos, "Ouvir de novo", "Parar", acerto, erro com o som certo, resultado
- [ ] Responsiva: conferida em largura de celular
- [ ] PROJECT.md (Roteiro), [architecture.md](../docs/architecture.md) e [testing.md](../docs/testing.md) atualizados
- [ ] Conferido à mão: uma partida inteira com notas e outra com acordes, nos dois instrumentos

## Histórico

- 2026-11-12: plano escrito a pedido do autor, depois dos PRs das fases 1 e 2 e do React.
