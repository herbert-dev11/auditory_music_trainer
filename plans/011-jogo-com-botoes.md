# 011 — O jogo, respondido por voz (fases 3, 5 e 6)

> Escrito como "jogo com botões" (fase 3) e **emendado em 2026-11-12**: o autor decidiu que o jogo é respondido só por voz. O plano passou a juntar a fase 3 (o jogo), uma primeira versão da fase 5 (interpretar a fala) e a fase 6 (voz no jogo). O que mudou do rascunho está em "Decisões do rascunho que mudaram".

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3: RF03–RF14, RN01–RN08, RNF02–RNF04 e o UC02.

## Problema

A seleção do jogo existe ([plano 009](009-tela-inicial-e-selecao.md)) e a fala já foi testada isoladamente ([plano 012](012-teste-da-fala.md)), mas "Começar" leva a uma tela provisória. Falta o jogo: ouvir a nota ou o acorde, responder falando, acertar ou errar, e ver o resultado.

**Dentro:** explicação, contagem 3-2-1, sorteio, som, pergunta falada, microfone com cronômetro, interpretação da fala, "Entendi: ...", segunda chance, "Ouvir de novo", "Parar", acerto, erro, resultado.
**Fora:** ajuste fino da interpretação com os erros reais do CSV da fase 4 (próximo passo da fase 5); recorde e estatísticas (RF17, RF21).

## Decisões

- **Resposta só por voz** (decisão do autor). Na tela do jogo há só dois botões: **"Ouvir de novo"** e **"Parar"** (que volta ao resultado); a barra comum continua com "← Início". Em navegador sem reconhecimento de fala, a tela avisa e não começa (RNF01: Chrome e iPhone). O RF15 (botões como reserva) saiu do PROJECT.md.
- **Máquina de estados pura em `exercicio/partida.ts`**: `(estado, evento) → estado`, sem relógio, som, voz nem DOM. Fases: `explicacao → contagem → tocando → ouvindo → acerto | nao-entendi | erro → … → resultado`. O sorteio recebe o número aleatório no próprio evento, para os testes serem previsíveis.
- **A tela cuida do tempo, do som e da voz** (`ui/Partida.tsx`): agenda a contagem, toca pelo `Tocador`, faz a pergunta pelo `Narrador`, abre o microfone pelo `ReconhecedorDeFala`, interpreta e manda os eventos para a máquina.
- **Ordem de cada rodada (UC02, RNF02)**: toca o som → espera acabar → pergunta "Que nota é essa?" (ou "Que acorde é esse?") → espera a voz terminar → só então abre o microfone e começa o cronômetro (RF07). O `Narrador.falar` passou a avisar quando termina.
- **Cronômetro de 5 s para notas e 8 s para acordes (RN02)**, com barra que esvazia e o tempo em texto. O tempo é o limite da escuta: se ninguém falar, conta como silêncio.
- **Segunda chance (RN04)**: "não entendi" (nenhuma alternativa vira nota) ou silêncio avisam "Não entendi, fale de novo" e reabrem o microfone, sem tocar de novo. Na segunda vez, encerra como erro. "Não entendi" não é erro.
- **Resposta entendida e errada encerra na hora (RN05)**: "Errou! Era dó maior", a voz diz o nome certo, o som certo toca mais uma vez (E1) e vai para o resultado.
- **"Ouvir de novo" (RN06)**: fecha o microfone, toca o som e repete a pergunta; o cronômetro recomeça e a segunda chance não é gasta. Disponível enquanto o microfone está aberto e depois de um "não entendi".
- **Interpretação da fala, primeira versão (fase 5), em `dominio/interpretacao.ts`**, seguindo o [nomenclatura.md](../docs/nomenclatura.md): normaliza, troca sinônimos conhecidos ("dor" → "dó", "sim" → "si", "sustenida" → "sustenido"), procura a primeira palavra que é nota, lê o acidente e a qualidade (o termo mais longo primeiro). Testa todas as alternativas e fica com a primeira que fizer sentido. Os casos de teste do nomenclatura.md viram testes. A lista de sinônimos cresce com o CSV da fase 4.
- **Palavras antes da nota são ignoradas** ("é dó", "acho que é ré"): a pessoa fala naturalmente, e o reconhecimento às vezes acrescenta palavras.
- **No modo nota, qualidade falada é ignorada** ("dó maior" num exercício de nota vale como "dó"): a decisão que o nomenclatura.md deixava para a fase 5. Recusar puniria uma fala natural.
- **RN03**: no modo acorde, a nota sozinha vale como acorde maior ("dó" = C).
- **Comparação pela classe de altura (RN01)** e pela qualidade: "ré bemol" acerta um C#.
- **Mostra o que entendeu (RF09)**: "Entendi: dó sustenido menor" depois de cada resposta, também no erro.
- **Sorteio sem repetir o item da rodada anterior** (aprovado pelo autor). Com 2 itens, alterna.
- **O som do jogo é sempre o desenho normal** (aprovado pelo autor): o "Simplificado" é escolha do jogador na biblioteca. O acorde toca inteiro, sem a demonstração nota por nota.
- **Áudio e voz liberados no clique de "Começar"**: o navegador, principalmente o do iPhone, só libera som e voz sintética depois de um gesto. O clique toca um som vazio e diz "Vamos começar" antes da contagem.
- **Resultado (RF14)**: sequência de acertos, itens acertados, o item do erro e o que foi entendido; botões "Jogar de novo" (mesma seleção), "Mudar seleção" e "Início".
- **A partida não é guardada nesta fase**, mas a máquina registra cada resposta (esperado, entendido, resultado, tempo, tentativa, vezes que ouviu de novo), no formato do contrato `Resposta` do [plano 002](002-back-end.md), para o recorde e o histórico depois.
- **Acessibilidade**: contagem, "Acertou!", "Não entendi" e "Errou!" numa região `aria-live`; tudo funciona pelo teclado; a própria voz do jogo dá o retorno sonoro.

## Decisões do rascunho que mudaram

- ~~Botões de resposta pensados para o celular (grade de notas; acordes em dois passos, raiz e depois tipo).~~ Sem botões de resposta: só voz.
- ~~Tempo esgotado usa a segunda chance; a fase 6 acrescenta o "não entendi".~~ A segunda chance já nasce com os dois casos (silêncio e "não entendi"), como no PROJECT.md.
- ~~Comparação por botão, sem ambiguidade de nome; a RN03 entra na fase 5.~~ A interpretação da fala (com a RN03) entra já neste plano.
- ~~O som do jogo segue a preferência "Simplificado".~~ Sempre o desenho normal.

## Dados

Nenhum dado novo guardado. Lê a última seleção (`treinador:ultimaSelecao`). Nenhum áudio é gravado (RNF03): só o texto reconhecido, em memória, durante a partida.

## API

Tela substituída: **Partida** (`#/jogo/partida`), com as fases explicação, contagem, jogo e resultado. A tela provisória do plano 009 sai.

## Riscos

- No iPhone, o reconhecimento pode exigir que cada escuta comece num toque; se for assim, o microfone não abre sozinho depois da pergunta. O teste da fase 4 no iPhone mostra; a saída seria um botão "Responder" só no iPhone.
- A interpretação ainda não conhece os erros reais do reconhecimento; até o ajuste com o CSV, algumas falas certas vão dar "não entendi" (que não é erro, por causa da segunda chance).
- Os tempos são `setTimeout`; em aba em segundo plano, o navegador pode atrasá-los. Aceito.
- `ui/`, `fala/` e `audio/` sem teste automático; a máquina e a interpretação estão testadas.

## Critério de pronto

- [x] `dominio/interpretacao.ts` com os casos do nomenclatura.md como testes (modo nota e modo acorde, RN01, RN03, sinônimos, palavras antes da nota, "não entendi")
- [x] `exercicio/partida.ts` com testes: contagem, sorteio sem repetir, acerto, erro (RN05), segunda chance por silêncio e por "não entendi" (RN04), "Ouvir de novo" (RN06), "Parar" (A5), jogar de novo, registro das respostas (100% de cobertura)
- [x] `Narrador.falar` avisa quando termina
- [x] Tela da partida: explicação com aviso de privacidade, contagem, som, pergunta falada, microfone com cronômetro, "Entendi", acerto, não entendi, erro com som certo, resultado; aviso em navegador sem fala
- [x] Responsiva; explicação conferida em captura a 500 px
- [x] PROJECT.md (RF15, Roteiro), [nomenclatura.md](../docs/nomenclatura.md), [architecture.md](../docs/architecture.md) e [testing.md](../docs/testing.md) atualizados
- [ ] Conferido à mão no Chrome e no iPhone, pelo endereço do Pages: partida com notas e com acordes

## Histórico

- 2026-11-12: rascunho como "jogo com botões".
- 2026-11-12: emendado depois da revisão do autor: só voz, botão de ouvir de novo e de voltar, aviso no tempo esgotado, sem repetir, som normal. Passa a cobrir as fases 3, 5 (primeira versão) e 6.
