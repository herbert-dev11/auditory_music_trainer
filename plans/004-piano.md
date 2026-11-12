# 004 — Piano como segundo instrumento (fase 1b)

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, RF22 (piano no MVP), RF05 (som) e RF16 (escolha do instrumento na biblioteca). Pesquisa das fontes de som em [pesquisa-de-sons.md](../docs/pesquisa-de-sons.md).

## Problema

Com amostras de notas isoladas, os acordes de violão soam artificiais: a mesma nota soa diferente em cada corda, e a gravação não captura isso ([plano 003](003-som-do-violao-e-biblioteca.md)). No piano não há essa limitação: um acorde é a soma das teclas. O autor quer treinar nos dois instrumentos.

**Dentro:** amostras de piano, voicing do piano, escolha Violão / Piano na biblioteca, créditos.
**Fora:** escolha do instrumento na tela inicial (fase 2, junto com a navegação); melhorar o timbre do violão (fica para outro plano, se preciso).

## Decisões

- **Salamander Grand Piano, versão leve do repositório `Tonejs/audio`** (Alexander Holm, CC BY 3.0): já está em `.mp3`, tem autor e licença claros e usa o mesmo `Sampler` do violão. Upright Piano KW, CC0 (rejeitado por ora: exige converter de FLAC/SF2). Piano do tonejs-instruments (rejeitado: origem das amostras não confirmada). Comparação completa em [pesquisa-de-sons.md](../docs/pesquisa-de-sons.md).
- **Só a faixa usada: 14 arquivos, A2 a C6 (936 KB), copiados sem modificação** para `public/samples/piano/`. As amostras estão a cada 3 semitons, e o `Sampler` transpõe no máximo 1,5 semitom. Copiar as 30 (rejeitado: notas abaixo de A2 e acima de C6 não são usadas).
- **Os itens são os mesmos nos dois instrumentos**: muda só o som. O tipo `Instrumento = 'violao' | 'piano'` fica em `dominio/instrumentos.ts`, junto com `voicing(instrumento, item)`, que delega para `voicingDoViolao` ou `voicingDoPiano`.
- **Voicing do piano** (`dominio/piano.ts`): nota isolada de C4 a B4 (MIDI 60–71), o registro central do piano; acorde em posição fundamental fechada, raiz de C3 a B3 (MIDI 48–59) com os intervalos da tabela de qualidades empilhados. Inversões e dobras (rejeitado por ora: a posição fundamental é a mais fácil de reconhecer).
- **Acorde de piano tocado de uma vez** (intervalo 0 ms); o violão continua dedilhado (30 ms). O intervalo padrão é do tocador de cada instrumento, não da tela.
- **Um tocador genérico de amostras** (`audio/tocadorDeAmostras.ts`) configurado por instrumento (pasta, lista de amostras, release, intervalo padrão), no lugar do `TocadorDeViolao`. Duplicar a classe (rejeitado: as duas seriam iguais, exceto pela configuração).
- **Abas Violão / Piano na biblioteca** (pedido do autor), no padrão de abas do WAI-ARIA (`role="tablist"`, `aria-selected`, setas trocam de aba). O rascunho previa dois botões com `aria-pressed`, trocados por abas. Cada instrumento carrega na primeira vez que é escolhido, e o tocador carregado é reaproveitado. Violão é o padrão.
- **RN03 vale para os dois instrumentos** ("dó" = dó maior num exercício de acorde): a regra existia por causa do violão, mas manter uma regra só é mais simples para o usuário.
- **Contratos do [plano 002](002-back-end.md)**: `Instrumento` passa a ser `'violao' | 'piano'`; o plano 002 foi emendado.

## Dados

Nenhum dado salvo. Arquivos novos em `public/samples/piano/` (CC BY 3.0, crédito em `CREDITS.md`, na pasta e no rodapé da biblioteca).

## API

Tela alterada: **Biblioteca**. Ganha as abas Violão / Piano acima da lista. Ao trocar, os botões ficam desabilitados enquanto o instrumento carrega; o rodapé mostra os créditos dos dois instrumentos.

## Riscos

- Mais 936 KB para baixar quando o piano é escolhido (aceito: só carrega se for escolhido).
- A versão leve do Salamander tem uma só camada de dinâmica; o som não muda com a força. Aceito para o treino auditivo.
- O jogo da fase 3 precisa saber o instrumento da partida; a interface `Tocador` já serve, falta só passar o instrumento na `Selecao`.

## Critério de pronto

- [x] `dominio/piano.ts` com testes: nota isolada em C4–B4; `C` = C3 E3 G3; os 60 acordes tocam exatamente as classes do acorde, com a raiz no baixo e dentro de A2–C6
- [x] `dominio/instrumentos.ts`: tipo `Instrumento` e `voicing(instrumento, item)`, com teste
- [x] Amostras em `public/samples/piano/` (tamanhos conferidos com a origem); `CREDITS.md` e `licencas.md` atualizados
- [x] `audio/tocadorDeAmostras.ts` substitui o `TocadorDeViolao`, com configuração de violão e de piano
- [ ] Biblioteca com as abas Violão / Piano. Código pronto e build verde; **falta conferir de ouvido no navegador**
- [x] PROJECT.md v0.3, [architecture.md](../docs/architecture.md), plano 002 e [pesquisa-de-sons.md](../docs/pesquisa-de-sons.md) atualizados

## Histórico

- 2026-11-11: plano escrito e implementado a pedido do autor, no mesmo dia em que o piano entrou no MVP (PROJECT.md v0.3). Durante a implementação, o autor pediu abas no lugar dos botões de escolha e o anúncio do nome por voz; este último virou o [plano 005](005-anuncio-por-voz.md).
