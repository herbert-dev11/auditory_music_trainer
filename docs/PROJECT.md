# Treinador Musical Auditivo

Fonte da verdade do produto. Em português, para a operação ler. Versão 0.2 dos requisitos (2026-11-11).

## O que é

Aplicação web de treino auditivo com **resposta por voz**. O sistema toca uma nota ou um acorde de violão, pergunta "Que nota é essa?" com voz sintética e o usuário responde falando ("dó", "lá menor", "dó sustenido menor"). O sistema reconhece a fala, compara com a resposta certa e segue até o primeiro erro; a pontuação é a sequência de acertos.

O diferencial: os treinadores auditivos comuns usam botões; aqui a resposta é falada, como numa aula com professor.

O que ele **não** é: não é afinador, não detecta a nota cantada (é reconhecimento de **fala**, não de afinação), não ensina a tocar o instrumento e, no MVP, não tem contas nem servidor.

## Quem usa

| Perfil | O que faz |
|---|---|
| **Usuário** (estudante de música, músico amador) | Escolhe o que treinar, ouve a biblioteca de sons, joga e vê o resultado. Sem login no MVP |

Contas de usuário só entram com o back-end ([plano 002](../plans/002-back-end.md)), fora do MVP.

## Organização dos itens do jogo

Os itens são filtrados por **dois eixos independentes**, porque um acorde pode ser sustenido **e** menor ao mesmo tempo (`C#m`):

- **Raiz**: naturais (C D E F G A B) ou sustenidos/bemóis (C# D# F# G# A#).
- **Tipo** (só para acordes): maior, menor, com sétima (7, m7, 7M).

Exemplo: "Naturais + Maior + Menor" gera C, Cm, D, Dm, ..., B, Bm. Para notas isoladas, só o filtro de raiz se aplica.

Navegação da tela inicial: **Violão → Notas / Acordes → categorias**.

Como cifra, nome falado e som se ligam está em [nomenclatura.md](nomenclatura.md).

## Funcionalidades (contrato)

Legenda MoSCoW: **M** = obrigatório, **S** = importante, **C** = desejável, **W** = fora desta versão. A coluna **MVP** marca o que entra no primeiro teste jogável.

| ID | Requisito | Prior. | MVP |
|---|---|---|---|
| RF01 | Tela inicial com os caminhos Violão → Notas / Acordes e as categorias disponíveis | M | ✔ |
| RF02 | Selecionar o que entra no jogo por filtros de raiz (naturais, sustenidos) e de tipo (maior, menor, sétima) | M | ✔ |
| RF03 | Mostrar uma explicação de como o jogo funciona antes de começar | M | ✔ |
| RF04 | Contagem regressiva de 3 segundos antes do primeiro exercício | M | ✔ |
| RF05 | Sortear e tocar uma nota ou acorde entre os itens selecionados (acorde com voicing de violão e cordas em sequência) | M | ✔ |
| RF06 | Perguntar "Que nota é essa?" com voz sintética | M | ✔ |
| RF07 | Ativar o microfone só depois que o som e a pergunta terminarem | M | ✔ |
| RF08 | Cronômetro visível com o tempo de resposta (RN02) | M | ✔ |
| RF09 | Reconhecer a fala e mostrar o que o sistema entendeu ("Entendi: dó") | M | ✔ |
| RF10 | Comparar a resposta com o item sorteado e mostrar acerto ou erro, com a resposta certa | M | ✔ |
| RF11 | Dar uma segunda chance quando a fala não for entendida ou o tempo acabar em silêncio (RN04) | M | ✔ |
| RF12 | Botão "Ouvir de novo", que repete o som e reinicia o cronômetro (RN06) | M | ✔ |
| RF13 | Encerrar o jogo no primeiro erro ou quando o usuário clicar em "Parar" (RN05) | M | ✔ |
| RF14 | Mostrar o resultado: sequência de acertos e os itens acertados | M | ✔ |
| RF15 | Responder por botões quando o microfone for recusado ou não estiver disponível | M | ✔ |
| RF16 | Biblioteca de sons: aba com todas as notas e acordes, com botão de play, para ouvir antes de jogar | S | ✔ |
| RF17 | Guardar o recorde (maior sequência de acertos) no navegador | S | |
| RF18 | Marcar ou desmarcar itens individuais dentro da seleção | S | |
| RF19 | Manual de teoria musical: o que é uma nota, como um acorde é formado, sustenido e bemol, progressões | C | |
| RF20 | Modo com nota de referência (toca dó antes da nota misteriosa) | C | |
| RF21 | Estatísticas: quais notas o usuário mais confunde | C | |
| RF22 | Outros instrumentos (piano, teclado) | C | |
| RF23 | Contas de usuário e histórico sincronizado em servidor ([plano 002](../plans/002-back-end.md)) | W | |

### Requisitos não funcionais

| ID | Requisito | Prior. |
|---|---|---|
| RNF01 | Voz no Chrome e no Edge (desktop) recentes; nos outros navegadores, só com botões | M |
| RNF02 | O microfone nunca fica aberto enquanto o som ou a voz sintética tocam | M |
| RNF03 | Não gravar nem armazenar o áudio da voz do usuário | M |
| RNF04 | Avisar que, na Web Speech API, o áudio da fala é processado pelo provedor do navegador (transparência, LGPD) | M |
| RNF05 | Usar somente amostras com licença livre, com créditos visíveis no app ([licencas.md](licencas.md)) | M |
| RNF06 | Interface e voz sintética em português do Brasil | M |
| RNF07 | Reconhecimento correto de pelo menos 90% para as 7 notas naturais (meta a medir) | S |
| RNF08 | No máximo 1,5 s entre o fim da fala e o resultado (meta a medir) | S |
| RNF09 | Layout responsivo (desktop e celular) | S |
| RNF10 | Cobertura de testes de pelo menos 80% em `dominio/` e `exercicio/` | S |
| RNF11 | Acessibilidade básica: uso por teclado e contraste adequado | S |
| RNF12 | Funcionar offline depois do primeiro acesso (PWA) | C |

## Regras de negócio

- **RN01**: notas enarmônicas são equivalentes (dó sustenido = ré bemol). A comparação é sempre pela classe de altura (0–11), nunca pelo texto.
- **RN02**: o tempo de resposta é de 5 s para notas e 8 s para acordes.
- **RN03**: no violão, a nota sozinha vale como acorde maior ("dó" = dó maior). Menor e sétima precisam ser ditos ("dó menor", "dó com sétima").
- **RN04**: cada exercício tem no máximo uma segunda chance, usada quando a fala não é entendida ou o tempo acaba em silêncio. "Não entendi" não é erro.
- **RN05**: uma resposta entendida mas errada encerra o jogo na hora, sem segunda chance.
- **RN06**: "Ouvir de novo" reinicia o cronômetro do exercício.
- **RN07**: o jogo só começa com pelo menos 2 itens selecionados.
- **RN08**: no MVP, só são aceitos os nomes dó-ré-mi; a cifra falada ("cê", "dê") fica para depois.

## Casos de uso

| ID | Caso de uso | Requisitos |
|---|---|---|
| UC01 | Selecionar itens do treino | RF01, RF02, RF18, RN07 |
| UC02 | Jogar o treino auditivo | RF03–RF15, RN01–RN08 |
| UC03 | Ouvir a biblioteca de sons | RF16 |
| UC04 | Consultar o manual de teoria | RF19 |

### UC01: Selecionar itens do treino

**Ator:** Usuário. **Pré-condição:** nenhuma. **Pós-condição:** seleção pronta para o UC02.

1. Na tela inicial, o usuário escolhe Violão → Notas ou Acordes.
2. O sistema mostra os filtros disponíveis (raiz e, para acordes, tipo).
3. O usuário marca os filtros desejados.
4. O sistema mostra quantos e quais itens entram no jogo.
5. O usuário clica em "Começar" e segue para o UC02.

- **A1. Menos de 2 itens selecionados (passo 5):** o botão "Começar" fica desabilitado, com a mensagem "Selecione pelo menos 2 itens" (RN07).

### UC02: Jogar o treino auditivo

**Ator:** Usuário. **Pré-condições:** pelo menos 2 itens selecionados (RN07); amostras de som carregadas. **Pós-condição:** resultado da partida exibido (e recorde atualizado, se houver RF17).

1. O usuário clica em "Começar".
2. O sistema mostra a explicação do jogo e pede permissão do microfone.
3. O usuário confirma.
4. O sistema faz a contagem regressiva: 3, 2, 1.
5. O sistema sorteia um item da seleção e toca o som.
6. O sistema pergunta "Que nota é essa?" com voz sintética.
7. O sistema ativa o microfone e inicia o cronômetro (RN02).
8. O usuário fala a resposta.
9. O sistema mostra o que entendeu ("Entendi: dó").
10. O sistema compara com o item sorteado (RN01, RN03) e mostra **acerto**.
11. O sistema soma 1 à sequência e volta ao passo 5.

**Fluxos alternativos**

- **A1. Fala não entendida (passo 9):** o sistema avisa "Não entendi, tente de novo" e volta ao passo 7, usando a segunda chance (RN04). Se a segunda chance já foi usada, segue para E1.
- **A2. Tempo esgotado em silêncio (passo 7):** mesmo tratamento do A1.
- **A3. "Ouvir de novo" (passos 7–8):** o sistema fecha o microfone, toca o som de novo, repete a pergunta e reinicia o cronômetro (RN06).
- **A4. Microfone recusado ou indisponível (passo 3):** o sistema mostra botões de resposta no lugar do microfone, e o resto do fluxo continua igual.
- **A5. Usuário clica em "Parar" (a partir do passo 4):** o sistema encerra e vai para a tela de resultado.

**Fluxo de exceção**

- **E1. Resposta errada (passo 10) ou segunda chance esgotada:** o sistema mostra "Errou! Era dó maior", toca o som certo mais uma vez e mostra o resultado: sequência de acertos e os itens acertados (RF14, RN05).

### UC03: Ouvir a biblioteca de sons

1. O usuário abre a aba "Biblioteca".
2. O sistema lista as notas e os acordes, agrupados pelos mesmos filtros do UC01.
3. O usuário clica no play de um item.
4. O sistema toca o som e mostra o nome do item (cifra e nome falado).

### UC04: Consultar o manual de teoria

Fora do MVP (RF19). Conteúdo previsto: o que é uma nota, como um acorde é formado, sustenido e bemol, progressões de acordes.

## Roteiro

As fases 0 a 6 formam o **MVP jogável**. Cada fase vira um ou mais planos em `plans/`, escritos quando a fase começar.

| Fase | Entrega | Requisitos | Plano |
|---|---|---|---|
| 0 | Configuração do projeto: Vite, TypeScript, Vitest, lint, CI, licença, créditos | — | [001](../plans/001-configuracao-do-projeto.md) |
| 1 | Tocar notas e acordes com voicing de violão; biblioteca de sons | RF05 (som), RF16 | — |
| 2 | Tela inicial e seleção por filtros de raiz e tipo | RF01, RF02, RN07 | — |
| 3 | Jogo completo **com botões**: explicação, contagem, sorteio, cronômetro, "Ouvir de novo", fim no erro, resultado | RF03, RF04, RF05, RF08, RF10, RF12–RF15, RN02, RN05, RN06 | — |
| 4 | Página isolada de teste da fala: mostrar transcrições e alternativas, registrar os resultados | RF09, RNF01 | — |
| 5 | Interpretação da fala, com TDD a partir de [nomenclatura.md](nomenclatura.md) | RF10 (voz), RN01, RN03, RN08 | — |
| 6 | Jogo por voz: voz sintética, microfone, segunda chance | RF06, RF07, RF09, RF11, RN04, RNF02–RNF04 | — |
| B0–B6 | Back-end (pós-MVP): contas, histórico, estatísticas, sincronização, LGPD | RF23 | [002](../plans/002-back-end.md) (rascunho) |
| 7 | Pós-MVP: recorde, seleção individual, manual, nota de referência, estatísticas, outros instrumentos, PWA | RF17–RF22, RNF12 | — |
| 8 | Avaliação: taxa de reconhecimento (RNF07/08) e questionário SUS | — | — |

O jogo com botões (fase 3) vem antes da voz de propósito: valida toda a lógica e a interface sem depender do reconhecimento de fala, e continua útil como alternativa (RF15).

## Fora de escopo

| Item | Onde fica |
|---|---|
| Contas, histórico em servidor, sincronização (RF23) | Pós-MVP, [plano 002](../plans/002-back-end.md) |
| Login social, ranking público, painel administrativo, app nativo, pagamentos | Sem previsão |
| Reconhecimento de fala no servidor (Vosk/Whisper) | Só se a Web Speech API não atingir o RNF07 |
| Detecção da nota cantada (afinação) | Outro produto |
| Sons de sites sem licença explícita (por exemplo, Cifra Club) | Proibido (RNF05) |

## Histórico

| Assunto | v0.1 | v0.2 (atual) |
|---|---|---|
| Escopo do MVP | Só notas isoladas; acordes depois | Teste jogável com notas **e** acordes, selecionados pelos filtros |
| Tela inicial e seleção | Configuração genérica e níveis progressivos | Tela inicial Violão → Notas / Acordes (RF01) e filtros de raiz e tipo (RF02); níveis saíram |
| Início do jogo | — | Explicação (RF03) e contagem regressiva de 3 s (RF04) |
| Pergunta | Só na tela | Voz sintética (RF06) |
| Tempo (RN02) | 5 s; tempo esgotado não conta como erro | 5 s para notas e 8 s para acordes; silêncio usa a segunda chance |
| Tentativas (RN04) | 2 tentativas por exercício | Segunda chance só para fala não entendida ou silêncio |
| Fim do jogo | Placar da sessão | Jogo acaba no primeiro erro ou em "Parar" (RN05); pontuação = sequência de acertos |
| "Dó" sozinho (RN03) | Recusado em exercícios de acorde | Vale como dó maior no violão |
| Repetir o som | Repetir | "Ouvir de novo" reinicia o cronômetro (RN06) |
| Biblioteca de sons | — | Nova (RF16), no MVP |
| Manual de teoria | — | Novo (RF19), fora do MVP |

A v0.1 foi escrita no repositório anterior (`Treinador_Musical_Auditivo`), substituído por este em 2026-11-11. Esta tabela é o registro do que mudou.
