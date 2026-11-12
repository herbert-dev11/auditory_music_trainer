# Nomenclatura: cifras e nomes falados

O problema central do sistema: ligar **o que soa** (notas MIDI), **a cifra** (`C#m`) e **o que a pessoa fala** ("dó sustenido menor").

## Princípio: gerar, não cadastrar

Não existe uma tabela com todos os acordes. Um acorde é **raiz + qualidade**, e cada parte tem seu próprio vocabulário pequeno. O nome falado é a junção dos dois:

```
C#m  =  C#            +  m
        "dó sustenido"   "menor"   →  "dó sustenido menor"
```

Com 7 letras, 2 acidentes e ~8 qualidades, o sistema cobre centenas de acordes sem nenhuma lista gigante.

## As peças

### 1. Classe de altura (pitch class)

Número de 0 a 11, ignorando a oitava. É o que realmente se compara.

| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C | C# / Db | D | D# / Eb | E | F | F# / Gb | G | G# / Ab | A | A# / Bb | B |

`C#` e `Db` têm a mesma classe (1). Por isso a enarmonia (RN01) sai de graça: compara-se o número, não o texto.

### 2. Letra → nome da nota

| C | D | E | F | G | A | B |
|---|---|---|---|---|---|---|
| dó | ré | mi | fá | sol | lá | si |

### 3. Acidente

| Símbolo | Falado | Efeito na classe |
|---|---|---|
| `#` | sustenido | +1 |
| `b` | bemol | −1 |

### 4. Qualidade do acorde

| Sufixo | Falado | Intervalos (semitons) | Versão |
|---|---|---|---|
| (vazio) | maior | 0, 4, 7 | MVP |
| `m` | menor | 0, 3, 7 | MVP |
| `7` | com sétima | 0, 4, 7, 10 | MVP |
| `m7` | menor com sétima | 0, 3, 7, 10 | MVP |
| `7M` / `maj7` | com sétima maior | 0, 4, 7, 11 | MVP |
| `dim` / `°` | diminuto | 0, 3, 6 | depois |
| `aug` / `+` | aumentado | 0, 4, 8 | depois |
| `sus4` | suspenso / com quarta | 0, 5, 7 | depois |

Os intervalos servem para **tocar** o acorde, e o nome falado serve para **reconhecer** a resposta. Os dois vêm da mesma tabela.

## Os dois sentidos

### Cifra → nome falado (para mostrar o feedback)

Fácil e determinístico: separar a cifra em letra, acidente e sufixo e montar o texto.

### Fala → resposta (o difícil)

A transcrição vem suja: "do sustenido menor", "dor menor", "si" virando "sim". Os passos:

1. **Normalizar**: minúsculas, tirar acentos, tirar pontuação.
2. **Trocar sinônimos** por termos canônicos (`dor` → `do`, `sustenida` → `sustenido`, `sim` → `si`...). A lista real sai da fase 4 (o teste isolado da fala), não de chute.
3. **Ler da esquerda para a direita**: uma nota (obrigatória), depois um acidente (opcional), depois uma qualidade (opcional). Palavras antes da nota são ignoradas ("é dó", "acho que é ré"), e palavras depois da qualidade também ("lá menor né").
4. **Qualidade: casar o termo mais longo primeiro**, porque "menor com sétima" começa com "menor".
5. Resultado: `{ classe: 1, qualidade: "m" }` ou "não entendi".
6. Testar **todas as alternativas** que o reconhecedor devolver (`maxAlternatives`) e ficar com a primeira que fizer sentido.

Regras que afetam a interpretação:

- **RN03**: no violão, num exercício de acorde, a nota sozinha vale como acorde maior: "dó" = `C`. Menor e sétima precisam ser ditos ("dó menor", "dó com sétima").
- Num exercício de **nota isolada**, qualquer qualidade falada é **ignorada**: "dó maior" vale como "dó" (decidido no [plano 011](../plans/011-jogo-com-botoes.md); recusar puniria uma fala natural).
- Implementação: `src/dominio/interpretacao.ts`. Sinônimos da primeira versão: `dor` → `do`, `sim` → `si`, `sustenida` → `sustenido`, `7` → `sétima` ("ré com 7"); `#` vale como sustenido. A lista cresce com o CSV da página de teste da fala ([plano 012](../plans/012-teste-da-fala.md)).
- **RN04**: "não entendi" não é erro: usa a segunda chance do exercício. Só uma resposta entendida e errada encerra o jogo (RN05).

## Casos de teste (escritos antes do código; estão em `src/dominio/interpretacao.test.ts`)

Exercício de **nota isolada**:

| Fala transcrita | Esperado |
|---|---|
| `dó` | classe 0 |
| `do` | classe 0 |
| `dor` | classe 0 |
| `Ré bemol` | classe 1 |
| `dó sustenido` | classe 1 (mesma do anterior) |
| `si` | classe 11 |
| `sim` | classe 11 |
| `fá bemol` | classe 4 (é o mesmo que mi) |
| `si sustenido` | classe 0 (é o mesmo que dó) |
| `banana` | não entendi |

Exercício de **acorde** (violão):

| Fala transcrita | Esperado |
|---|---|
| `dó` | classe 0, maior (RN03) |
| `sol maior` | classe 7, maior |
| `dó sustenido menor` | classe 1, `m` |
| `lá menor` | classe 9, `m` |
| `ré com sétima` | classe 2, `7` |
| `mi bemol menor com sétima` | classe 3, `m7` |
| `fá com sétima maior` | classe 5, `7M` |
| `menor` | não entendi (falta a nota) |
| `banana` | não entendi |

## E o som do acorde no violão?

É um problema separado. `C#m` no violão é uma pestana (`x46654`), não as notas C#-E-G# juntas. Em vez de cadastrar desenho por desenho, dá para usar **formas móveis**: o desenho de `Am` (`x02210`) com pestana vira qualquer acorde menor com raiz na 5ª corda, e o de `Em` (`022000`), com raiz na 6ª. A raiz decide a casa, e a qualidade decide a forma. Como os acordes fazem parte do MVP, isso entra já na fase 1.

## Bibliotecas

- **Tonal.js** pode cuidar da teoria (`Chord.get("C#m")` devolve as notas, e `Note.chroma("Db")` devolve 1). Ele **não** tem nomes em português, então o módulo de nomes falados é nosso.
- Avaliar na fase 5 se o Tonal vale a dependência ou se as tabelas acima bastam (são poucas linhas).
