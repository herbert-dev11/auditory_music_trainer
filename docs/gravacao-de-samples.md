# Gravação de samples próprios

Roteiro para gravar os sons do app caso as amostras atuais ([pesquisa-de-sons.md](pesquisa-de-sons.md)) não sirvam. Lista **quais notas gravar** em cada instrumento e com que nome salvar cada arquivo.

Gravações próprias têm duas vantagens: a licença é do autor do projeto, e no violão dá para gravar **cada corda separadamente**, o que resolve o problema de timbre dos acordes (a mesma nota soa diferente em cada corda).

> Trocar as amostras atuais pelas gravadas exige um plano em `plans/` antes do código (regra do `IA.md`). No piano, basta trocar a pasta. No violão, gravar por corda exige um `Sampler` por corda no tocador.

## Como gravar

**Equipamento:** instrumento afinado (use afinador), celular moderno ou microfone USB, cômodo silencioso e com pouco eco (cortinas e roupas ajudam), e o [Audacity](https://www.audacityteam.org/) (gratuito, código aberto) para tratar os arquivos.

**Para cada nota:**

1. Tocar com a mesma força e o mesmo jeito todas as vezes; gravar 2 ou 3 vezes e ficar com a melhor.
2. Deixar a nota soar até sumir (pelo menos 3 s).
3. No Audacity: cortar o silêncio do começo (a nota começa no ataque), fazer fade-out no fim (sem clique), normalizar o volume (todas iguais).
4. Exportar em `.mp3`, mono, 44,1 kHz, com o nome da tabela.

**Nome dos arquivos:** nota + oitava, com `s` no lugar de `#` (o mesmo padrão das amostras atuais). Exemplos: `C3.mp3`, `Cs3.mp3` (dó sustenido 3), `As2.mp3` (lá sustenido 2). O índice 3 de C3 é a oitava em que o dó central do piano é C4.

**Licença:** registrar no [licencas.md](licencas.md) e no `CREDITS.md` quem gravou, quando e com que licença (sugestão: CC BY 4.0, ou CC0 para domínio público).

---

# Notas do piano

O app usa o piano de **C3 a B4** (MIDI 48 a 71): notas isoladas de C4 a B4, e acordes com a raiz entre C3 e B3, subindo até A#4.

## Mínimo: 14 notas, a cada 3 semitons

O `Sampler` transpõe as notas que faltam a partir da gravada mais próxima, no máximo 1,5 semitom. É a mesma lista das amostras atuais, então os arquivos gravados podem substituir os atuais sem mexer no código, só trocando a pasta.

| # | Nota | Nome falado | MIDI | Arquivo |
|---|---|---|---|---|
| 1 | A2 | lá 2 | 45 | `A2.mp3` |
| 2 | C3 | dó 3 | 48 | `C3.mp3` |
| 3 | D#3 | ré sustenido 3 | 51 | `Ds3.mp3` |
| 4 | F#3 | fá sustenido 3 | 54 | `Fs3.mp3` |
| 5 | A3 | lá 3 | 57 | `A3.mp3` |
| 6 | C4 | dó 4 (dó central) | 60 | `C4.mp3` |
| 7 | D#4 | ré sustenido 4 | 63 | `Ds4.mp3` |
| 8 | F#4 | fá sustenido 4 | 66 | `Fs4.mp3` |
| 9 | A4 | lá 4 (440 Hz) | 69 | `A4.mp3` |
| 10 | C5 | dó 5 | 72 | `C5.mp3` |
| 11 | D#5 | ré sustenido 5 | 75 | `Ds5.mp3` |
| 12 | F#5 | fá sustenido 5 | 78 | `Fs5.mp3` |
| 13 | A5 | lá 5 | 81 | `A5.mp3` |
| 14 | C6 | dó 6 | 84 | `C6.mp3` |

## Ideal: todas as 24 notas de C3 a B4

Sem nenhuma transposição. Cada linha é uma oitava; em **negrito**, as que já estão no mínimo.

| Oitava | C | C# | D | D# | E | F | F# | G | G# | A | A# | B |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 3 | **C3** | Cs3 | D3 | **Ds3** | E3 | F3 | **Fs3** | G3 | Gs3 | **A3** | As3 | B3 |
| 4 | **C4** | Cs4 | D4 | **Ds4** | E4 | F4 | **Fs4** | G4 | Gs4 | **A4** | As4 | B4 |

---

# Notas do violão

Afinação padrão. As formas de acorde do app usam da **casa 0 à 8**, e as notas isoladas, da casa 0 à 4. Grave **cada corda separadamente**, mesmo quando a nota se repete em outra corda: é isso que dá o timbre certo.

| Corda | Nota solta | MIDI solta |
|---|---|---|
| 6ª (mais grossa) | E2 (mi) | 40 |
| 5ª | A2 (lá) | 45 |
| 4ª | D3 (ré) | 50 |
| 3ª | G3 (sol) | 55 |
| 2ª | B3 (si) | 59 |
| 1ª (mais fina) | E4 (mi) | 64 |

**Nome dos arquivos:** uma pasta por corda, com o nome da nota dentro. Exemplo: `corda-6/G2.mp3` (6ª corda, casa 3).

## Mínimo: 24 notas, casas 0, 3, 6 e 9 de cada corda

O `Sampler` de cada corda transpõe no máximo 1,5 semitom e cobre da casa 0 à 10.

| Corda | Casa 0 | Casa 3 | Casa 6 | Casa 9 |
|---|---|---|---|---|
| 6ª | `corda-6/E2.mp3` | `corda-6/G2.mp3` | `corda-6/As2.mp3` | `corda-6/Cs3.mp3` |
| 5ª | `corda-5/A2.mp3` | `corda-5/C3.mp3` | `corda-5/Ds3.mp3` | `corda-5/Fs3.mp3` |
| 4ª | `corda-4/D3.mp3` | `corda-4/F3.mp3` | `corda-4/Gs3.mp3` | `corda-4/B3.mp3` |
| 3ª | `corda-3/G3.mp3` | `corda-3/As3.mp3` | `corda-3/Cs4.mp3` | `corda-3/E4.mp3` |
| 2ª | `corda-2/B3.mp3` | `corda-2/D4.mp3` | `corda-2/F4.mp3` | `corda-2/Gs4.mp3` |
| 1ª | `corda-1/E4.mp3` | `corda-1/G4.mp3` | `corda-1/As4.mp3` | `corda-1/Cs5.mp3` |

## Ideal: 60 notas, casas 0 a 9 de cada corda

Sem nenhuma transposição. Em **negrito**, as que já estão no mínimo.

| Corda | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| 6ª | **E2** | F2 | Fs2 | **G2** | Gs2 | A2 | **As2** | B2 | C3 | **Cs3** |
| 5ª | **A2** | As2 | B2 | **C3** | Cs3 | D3 | **Ds3** | E3 | F3 | **Fs3** |
| 4ª | **D3** | Ds3 | E3 | **F3** | Fs3 | G3 | **Gs3** | A3 | As3 | **B3** |
| 3ª | **G3** | Gs3 | A3 | **As3** | B3 | C4 | **Cs4** | D4 | Ds4 | **E4** |
| 2ª | **B3** | C4 | Cs4 | **D4** | Ds4 | E4 | **F4** | Fs4 | G4 | **Gs4** |
| 1ª | **E4** | F4 | Fs4 | **G4** | Gs4 | A4 | **As4** | B4 | C5 | **Cs5** |

## Opcional: acordes inteiros

Gravar o acorde dedilhado de verdade é o som mais realista, mas são 60 acordes (12 raízes × 5 qualidades), com o mesmo desenho que o app mostra (ver `casas()` em `src/dominio/violao.ts`). Vale começar pelos mais usados no estudo (maiores e menores com raiz natural: C, D, E, F, G, A, B e Cm, Dm, Em, Fm, Gm, Am, Bm) e comparar com o som montado nota por nota antes de gravar o resto.

**Nome dos arquivos:** a cifra, com `s` no lugar de `#`. Exemplos: `acordes/C.mp3`, `acordes/Csm.mp3`, `acordes/F7M.mp3`.
