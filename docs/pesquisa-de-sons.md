# Pesquisa de fontes de som

Registro da pesquisa feita para escolher os sons de violão e de piano do app: de onde vêm, que licença têm, o que foi comparado e por que cada escolha foi feita. Serve de base para o capítulo de Tecnologias (ou de Desenvolvimento) do relatório. O inventário de licenças em vigor fica em [licencas.md](licencas.md); este arquivo guarda o **raciocínio**.

Consultas feitas em 2026-11-11. Licenças conferidas na fonte, não de memória.

## O problema

O app precisa tocar notas e acordes com som de instrumento real, no navegador, sem servidor próprio. Isso exige **amostras gravadas** (samples): arquivos de áudio de notas isoladas, que o Tone.js (`Sampler`) toca e transpõe para as notas que faltam. Restrições:

- **Licença livre e explícita** (RNF05): nada de sites sem licença, como o Cifra Club.
- **Tamanho pequeno**: o app é baixado inteiro pelo navegador; centenas de MB são inviáveis.
- **Formato que todo navegador toca**: `.mp3`.

## Bibliotecas de código

| Biblioteca | Para quê | Licença | Onde pesquisar |
|---|---|---|---|
| Tone.js 15 | Tocar as amostras no navegador (Web Audio API) | MIT | https://tonejs.github.io · https://github.com/Tonejs/Tone.js |
| Tonal 6 | Teoria musical (notas, intervalos, acordes); instalado, ainda não usado | MIT | https://github.com/tonaljs/tonal |
| smplr | Alternativa ao `Sampler` do Tone.js; não adotada | MIT | https://github.com/danigb/smplr |

## Violão

| Opção | Autor | Licença | Situação |
|---|---|---|---|
| **Violão nylon** do tonejs-instruments | Gravação de **quartertone** (Freesound, pacote "ClassicalGuitar-multisampled"); reempacotado por Nicholaus P. Brosowsky | CC BY 3.0 | **Adotado** (plano 003) |
| Violão de aço (`guitar-acoustic`) do tonejs-instruments | University of Iowa | CC BY 3.0 (geral do repositório) | Não adotado: o nylon é o timbre mais comum no estudo |

Detalhes da opção adotada: 29 arquivos `.mp3` (B1 a A#5, 2,4 MB), copiados sem modificação.

### Limitação encontrada: o timbre do acorde

Ao ouvir os acordes, o som pareceu artificial. A causa é estrutural, não um defeito de código:

1. **Não existe gravação de acorde.** Cada amostra é uma nota isolada, gravada uma vez. O acorde é montado juntando 5 ou 6 dessas notas.
2. **No violão, a mesma nota soa diferente em cada corda.** Um sol3 na corda solta e o mesmo sol3 na casa 5 da corda ré têm timbres diferentes, mas a amostra é uma só.
3. **Transposição**: onde falta amostra, o `Sampler` estica a mais próxima (até 2 semitons), o que altera um pouco o timbre.
4. **Dedilhado mecânico**: todas as cordas com o mesmo volume e o mesmo intervalo (30 ms).

Caminhos possíveis: humanizar o dedilhado (variar volume e tempo), usar desenhos de acordes abertos ou gravar acordes reais. O último exige gravação própria ou uma fonte livre de acordes gravados, que não foi encontrada.

## Piano

| Opção | Autor | Licença | Formato e tamanho | Situação |
|---|---|---|---|---|
| **Salamander Grand Piano**, versão leve do Tone.js | **Alexander Holm** | **CC BY 3.0** (declarada no README da pasta) | 30 `.mp3`, de A0 a C8 a cada 3 semitons, 1 camada de dinâmica | **Adotado** (plano 004): usados 14 arquivos (A2 a C6, 936 KB) |
| Salamander Grand Piano, versão completa | Alexander Holm | CC BY 3.0 | SFZ/FLAC/WAV/SF2, 16 camadas de dinâmica, 296 MB a 1,18 GB | Pesado demais para a web |
| Upright Piano KW | Gonzalo e Roberto | **CC0** (domínio público) | SFZ/FLAC/WAV/SF2 | Boa alternativa; exigiria converter para `.mp3` |
| YDP Grand Piano | Amostras originais da Zenph Studios; adaptação de Roberto | CC BY 3.0 | SF2 (36 MB) | Formato SoundFont, exigiria conversão |
| Piano do tonejs-instruments | Não identificado | CC BY 3.0 (geral do repositório) | `.mp3` | Descartado: o arquivo que diz a origem de cada instrumento não foi encontrado (404), então o autor real não pôde ser confirmado |

### Por que o piano não tem o problema do violão

No piano, cada tecla produz uma única nota com um único timbre. Um acorde de piano **é** a soma das notas tocadas juntas, então juntar amostras isoladas é fiel ao instrumento real. Além disso, o acorde de piano não precisa de desenho: é a raiz com os intervalos empilhados, tocados ao mesmo tempo.

## Decisões

| Decisão | Motivo | Plano |
|---|---|---|
| Violão nylon do tonejs-instruments | Única fonte livre de violão nylon multiamostrado já em `.mp3` e pronta para o Tone.js | [003](../plans/003-som-do-violao-e-biblioteca.md) |
| Salamander (versão leve do Tone.js) | Licença clara com autor identificado, já em `.mp3`, mesmo formato de uso do violão, piano de cauda de boa qualidade | [004](../plans/004-piano.md) |
| Copiar as amostras para o repositório, sem modificação | Não depender de servidor de terceiros; facilita o modo offline (RNF12) | 003 e 004 |
| Só a faixa de notas usada (piano A2–C6) | Menos dados para baixar; a faixa pode crescer se um recurso futuro precisar | 004 |

## Referências

Formato aproximado da ABNT (NBR 6023); revisar no texto final do relatório.

- BROSOWSKY, Nicholaus P. **tonejs-instruments**: a small instrument sample library with quick-loader for tone.js. GitHub, [s.d.]. Disponível em: https://github.com/nbrosowsky/tonejs-instruments. Acesso em: 11 nov. 2026.
- HOLM, Alexander. **Salamander Grand Piano**. Versão V3. Licença CC BY 3.0. Disponível em: https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html. Acesso em: 11 nov. 2026.
- MANN, Yotam et al. **Tone.js**: a Web Audio framework for making interactive music in the browser. Versão 15.1.22. Disponível em: https://tonejs.github.io. Acesso em: 11 nov. 2026.
- QUARTERTONE. **ClassicalGuitar-multisampled**. Freesound, pacote 11573. Licença CC BY. Disponível em: https://freesound.org/people/quartertone/packs/11573/. Acesso em: 11 nov. 2026.
- TONE.JS. **audio/salamander**: amostras do Salamander Grand Piano em mp3. GitHub. Disponível em: https://github.com/Tonejs/audio/tree/master/salamander. Acesso em: 11 nov. 2026.
- ZENVOID. **FreePats**: acoustic grand piano. Disponível em: https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html. Acesso em: 11 nov. 2026.
