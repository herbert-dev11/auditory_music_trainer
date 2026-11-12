# 003 — Som do violão e biblioteca de sons (fase 1)

Escopo: [PROJECT.md](../docs/PROJECT.md), fase 1 do Roteiro: RF05 (a parte do som) e RF16 (biblioteca, UC03).

## Problema

O app não toca nada. Sem som não há jogo, e o usuário não tem como ouvir as notas e os acordes antes de jogar. Esta fase entrega: dado um item (nota ou acorde), tocar o som de violão certo; e uma tela que lista todos os itens com botão de play.

**Dentro:** catálogo de itens (12 notas, 12 × 5 acordes), cifra → nome falado, voicing de violão, tocador com Tone.js, tela da biblioteca, créditos dos sons.
**Fora:** tela inicial e filtros (fase 2), sorteio e jogo (fase 3), fala → resposta (fase 5).

## Decisões

- **Samples copiados para `public/samples/guitar-nylon/`, só `.mp3`** (29 arquivos, B1 a A#5, 2,4 MB): o app não depende de um servidor de terceiros e já fica pronto para o offline (RNF12). Carregar direto do GitHub do tonejs-instruments (rejeitado: frágil e sujeito a limite de acesso). `.wav` (rejeitado: pesado) e `.ogg` (rejeitado: o Safari não toca).
- **Buracos entre as amostras ficam por conta do `Sampler`**, que transpõe da amostra mais próxima (no máximo 2 semitons). Gravar ou baixar mais amostras (rejeitado: não há fonte livre equivalente).
- **Item = raiz (classe 0–11) + qualidade**, com qualidade `"" | "m" | "7" | "m7" | "7M"` (tabela do [nomenclatura.md](../docs/nomenclatura.md)). Nota isolada é um item sem qualidade. A cifra é sempre escrita com sustenido (`C#`, nunca `Db`), como no [plano 002](002-back-end.md).
- **Cifra → nome falado já nesta fase** (`C#m` → "dó sustenido menor"): a biblioteca mostra o nome (UC03, passo 4). O sentido contrário (fala → item) fica na fase 5.
- **Voicing calculado em `dominio/violao.ts`, não em `audio/`**: é conta pura (raiz + forma → casas → MIDI), então é testável e entra na cobertura (RNF10). `audio/` só recebe a lista de notas MIDI. Muda o [architecture.md](../docs/architecture.md), que punha o voicing em `audio/`.
- **Só duas formas móveis por qualidade**: forma de **mi** (raiz na 6ª corda) e forma de **lá** (raiz na 5ª corda); escolhe-se a de casa mais baixa. Na casa 0 elas viram os acordes abertos de E, Em, A, Am etc.

  | Qualidade | Forma de mi (6ª→1ª) | Forma de lá (6ª→1ª) |
  |---|---|---|
  | maior | 0 2 2 1 0 0 | x 0 2 2 2 0 |
  | `m` | 0 2 2 0 0 0 | x 0 2 2 1 0 |
  | `7` | 0 2 0 1 0 0 | x 0 2 0 2 0 |
  | `m7` | 0 2 0 0 0 0 | x 0 2 0 1 0 |
  | `7M` | 0 2 1 1 0 0 | x 0 2 1 2 0 |

  Os números somam à casa da raiz. Afinação padrão: E2 A2 D3 G3 B3 E4 (MIDI 40 45 50 55 59 64). Exemplos: `G` = 355433, `F#` = 244322, `C` = x35553.
- **Tabela de acordes abertos (C = x32010, D = xx0232...) (rejeitado por ora)**: soa mais natural, mas é uma tabela à mão para cada acorde. Entra depois se o som com pestana incomodar. **Adotada em 2026-11-12 pelo [plano 008](008-acordes-abertos-pestana-e-simplificado.md)**, porque o autor achou vários acordes difíceis, **só no modo "Simplificado"**: o padrão continua sendo as formas com pestana desta decisão.
- **Nota isolada numa oitava fixa: C3 a B3 (MIDI 48–59)**, região média do violão. Oitava sorteada (rejeitado por ora: muda a dificuldade; decidir junto com o jogo).
- **Acorde tocado corda a corda, grave → agudo, 30 ms entre cordas**, cada nota soando ~2 s.
- **Tocador atrás de uma interface** (`Tocador` em `audio/`: `carregar()` e `tocar(midis, opcoes)`), para o jogo da fase 3 receber um falso nos testes.
- **`Tone.start()` no primeiro clique de play**: o navegador só libera o áudio depois de um gesto do usuário.
- **Tonal não é usado nesta fase**: as tabelas de classe de altura e de formas são poucas linhas. A decisão de manter ou tirar a dependência fica na fase 5, como diz o [nomenclatura.md](../docs/nomenclatura.md).
- **Sem tela inicial ainda**: `main.ts` abre direto a biblioteca. A navegação entra na fase 2.

## Dados

Nenhum dado salvo. Arquivos novos de som em `public/samples/guitar-nylon/` (licença CC BY, crédito em `CREDITS.md`).

Tipos novos em `src/dominio/` (definidos uma vez e reusados pela UI e pelo jogo):

```ts
export type Classe = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type Qualidade = "" | "m" | "7" | "m7" | "7M";
export type Item =
  | { tipo: "nota"; raiz: Classe }
  | { tipo: "acorde"; raiz: Classe; qualidade: Qualidade };
```

Funções puras previstas: `cifra(item)`, `nomeFalado(item)`, `todosOsItens()`, `voicing(item)` → MIDIs.

## API

Tela nova: **Biblioteca** (UC03).

- Entrada: nenhuma. Lista as 12 notas e os 60 acordes, agrupados em Notas e um grupo por qualidade (maiores, menores, com sétima, menores com sétima, com sétima maior). Na implementação os grupos ficaram por qualidade, e não pelos três tipos do filtro, porque assim cada grupo tem 12 itens e lê melhor.
- Cada item mostra a cifra, o nome falado e um botão de play (acessível por teclado, RNF11).
- Enquanto os sons carregam: "Carregando sons..." e botões desabilitados. Se falhar: mensagem de erro e botão de tentar de novo.
- Rodapé com o crédito dos sons (RNF05).

## Riscos

- A transposição do `Sampler` pode soar artificial em algumas notas; conferir de ouvido todas as 72 entradas da biblioteca.
- Acordes com pestana soam diferentes dos abertos que o estudante conhece (C, D); aceito nesta fase.
- O primeiro play pode atrasar enquanto os mp3 carregam; medir o tamanho total da pasta e mostrar o estado de carregamento.
- Ainda sem lint (pendência do [plano 001](001-configuracao-do-projeto.md)).

## Critério de pronto

Cada fatia mantém `npm test` e `npm run typecheck` verdes.

- [x] **Fatia 1 — catálogo e nomes** (`dominio/itens.ts`): tipos, `cifra`, `nomeFalado`, `todosOsItens` (72 itens); testes cobrem `C#m` → "dó sustenido menor", `7M` → "com sétima maior" e a contagem de itens
- [x] **Fatia 2 — voicing** (`dominio/violao.ts`): testes conferem `G` = 355433, `Am` = x02210, `C` = x35553; para os 60 acordes, as classes tocadas são exatamente as do acorde, a nota mais grave é a raiz e tudo cabe entre E2 e A#5
- [x] **Fatia 3 — samples e créditos**: mp3 em `public/samples/guitar-nylon/` (tamanhos conferidos com a origem), `CREDITS.md` na raiz e na pasta dos samples, `licencas.md` com o som "em uso, sem modificação"
- [ ] **Fatia 4 — tocador** (`audio/tocador.ts` + `audio/tocadorDeViolao.ts`): interface `Tocador` + implementação com `Sampler`. Código pronto e build verde; **falta conferir de ouvido no navegador**
- [ ] **Fatia 5 — tela da biblioteca** (`ui/biblioteca.ts`, `ui/dom.ts`, `estilo.css`): carregamento, erro com "Tentar de novo", play por item, crédito no rodapé, sem `innerHTML`. Código pronto; **falta conferir à mão no Chrome e no celular (RNF09)**
- [x] Cobertura ≥ 80% em `dominio/` (100% em 2026-11-11)
- [x] [architecture.md](../docs/architecture.md) atualizado (voicing em `dominio/`, formas de mi e lá, samples locais) e Roteiro do PROJECT.md apontando para este plano

## Histórico

- 2026-11-11: implementação das fatias 1 a 5 a pedido do autor (exceção ao modo de trabalho do `IA.md`, em que o autor escreve o código). Correções em relação ao rascunho: as amostras vão de B1 (não E2) a A#5; a biblioteca agrupa por qualidade.
- 2026-11-11: o autor achou o timbre dos acordes de violão artificial (limitação de montar acordes com amostras de notas isoladas, ver [pesquisa-de-sons.md](../docs/pesquisa-de-sons.md)). O piano entrou pelo [plano 004](004-piano.md), que trocou o `TocadorDeViolao` por um `TocadorDeAmostras` configurado por instrumento e renomeou `voicing` para `voicingDoViolao`.
