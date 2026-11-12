# Licenças e créditos

Inventário de tudo o que o projeto usa de terceiros: código, sons e recursos do navegador. Serve para três coisas:

1. cumprir as licenças no app e no repositório;
2. gerar o `CREDITS.md` e a página "Sobre/Créditos" do app;
3. escrever o capítulo de Tecnologias do relatório (se o projeto virar TCC).

> Este arquivo registra o que cada licença diz e como cumpri-la na prática. Não é parecer jurídico: dúvidas sobre uso comercial ou propriedade intelectual vão para o orientador ou o núcleo de inovação (NIT) da instituição.

## Como manter

- Toda dependência ou som novo entra aqui **no mesmo PR** em que é adicionado.
- Conferir a licença na fonte, não de memória: `npm view <pacote> license version` para pacotes, e o arquivo `LICENSE` ou a página do autor para sons.
- Mudar o **Status** de `planejado` para `em uso` quando o item entrar no código.
- Registrar a data da consulta, porque licenças e versões mudam.

## Código do próprio projeto

| Item | Situação |
|---|---|
| Licença do código | **A decidir.** Sugestão: MIT, compatível com todas as dependências abaixo |
| Arquivo `LICENSE` | Pendente (criar na fase 0, [plano 001](../plans/001-configuracao-do-projeto.md)); até lá o `package.json` diz `UNLICENSED` |

## Dependências (npm)

Consulta no registro do npm em 2026-11-11. Instalação em 2026-11-11: versões e licenças conferidas em `node_modules/<pacote>/package.json`.

| Pacote | Versão instalada | Licença | Uso no projeto | Vai no app publicado? | Status |
|---|---|---|---|---|---|
| `tone` | 15.1.22 | MIT | Tocar os samples (`Sampler`) | Sim | instalado |
| `tonal` | 6.5.1 | MIT | Teoria musical: MIDI, enarmonia, notas dos acordes | Sim | instalado |
| `vite` | 8.3.8 | MIT | Servidor de desenvolvimento e build | Não (ferramenta) | em uso |
| `typescript` | 7.0.2 | Apache-2.0 | Compilação | Não (ferramenta) | em uso |
| `vitest` | 5.1.0 | MIT | Testes | Não (ferramenta) | em uso |
| `@vitest/coverage-v8` | 5.1.0 | MIT | Cobertura de testes (RNF10) | Não (ferramenta) | em uso |
| `eslint` | 10.14.0 | MIT | Padrão de código | Não (ferramenta) | planejado |
| `prettier` | 3.10.0 | MIT | Formatação | Não (ferramenta) | planejado |
| `smplr` | 1.2.0 | MIT | Alternativa ao `Sampler` (só se for usado) | Sim | alternativa |

As versões são as mais recentes na data da consulta. As versões realmente usadas ficam no `package-lock.json`. Atualize esta tabela quando instalar.

## Amostras de áudio

| Som | Origem | Autor original | Licença | Status |
|---|---|---|---|---|
| Violão nylon (`samples/guitar-nylon`) | [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments), reempacotado a partir do Freesound | **quartertone**, pacote [ClassicalGuitar-multisampled](https://freesound.org/people/quartertone/packs/11573/) (Freesound 11573); reempacotamento de Nicholaus P. Brosowsky | **CC BY** (Atribuição). O repositório declara CC BY 3.0; a página de um som consultado no Freesound indica CC BY 4.0. As duas exigem o mesmo crédito | planejado |

Observações sobre o tonejs-instruments:

- O **código** do repositório é MIT, e os **samples** são CC BY 3.0 (conforme o `LICENSE.md` dele).
- Cada instrumento vem de uma fonte diferente (arquivo `sample-source-info.txt` do repositório). O violão **nylon** vem do Freesound (quartertone); o violão **aço** (`guitar-acoustic`) vem da University of Iowa. Se trocar de instrumento, registre a nova origem aqui.
- O que o projeto não usa: nada do Cifra Club nem de qualquer site sem licença explícita.

## Recursos do navegador

Não têm licença a cumprir, mas têm consequências de privacidade.

| Recurso | Uso | Cuidado |
|---|---|---|
| Web Audio API | Base do Tone.js | — |
| Web Speech API (`SpeechRecognition`) | Reconhecer a resposta falada | No Chrome e no Edge, o áudio é enviado ao servidor do provedor do navegador. Exige aviso ao usuário (RNF04) e menção no relatório (LGPD) |
| `speechSynthesis` | Voz sintética da pergunta | As vozes dependem do sistema operacional; não há dado do usuário envolvido |
| `getUserMedia` (microfone) | Permissão do microfone | Só funciona em HTTPS ou `localhost`; o áudio não é gravado (RNF03) |

## O que cada licença exige

| Licença | Pode usar, modificar e publicar? | Obrigação |
|---|---|---|
| **MIT** | Sim, inclusive comercialmente | Manter o aviso de copyright e o texto da licença nas cópias do código |
| **Apache-2.0** | Sim, inclusive comercialmente | Manter licença e avisos (`NOTICE`) se redistribuir o código. O TypeScript só é usado para compilar e não vai no app, então na prática não há o que fazer |
| **CC BY 3.0 / 4.0** | Sim, inclusive comercialmente | Dar **crédito**: autor, título, link da obra, licença e indicar se houve modificação (por exemplo, conversão de formato) |

## Texto de crédito (para o `CREDITS.md` e a página do app)

> **Sons de violão nylon:** "ClassicalGuitar-multisampled", de quartertone (Freesound), licença CC BY. Arquivos reempacotados por Nicholaus P. Brosowsky no projeto tonejs-instruments. Os arquivos foram usados como amostras no Tone.js[, e convertidos/cortados — ajustar se houver modificação].
>
> **Bibliotecas:** Tone.js (MIT), Tonal (MIT) e as ferramentas listadas em `docs/licencas.md`.

## Checklist de publicação

| Destino | O que conferir |
|---|---|
| Repositório público no GitHub | `LICENSE` do projeto, `CREDITS.md` atualizado; se os samples forem copiados para o repositório, o crédito precisa estar junto deles |
| App no GitHub Pages | Página "Sobre/Créditos" com o texto acima; aviso de privacidade do microfone (RNF04) |
| Relatório do TCC | Cada biblioteca e fonte de som citada como referência (ABNT), com versão e licença no capítulo de Tecnologias |
| Repositório institucional / artigo | Mesmo conteúdo do relatório; conferir as regras da instituição sobre depósito de software |

## Pendências

- [ ] Decidir a licença do código do projeto e criar o `LICENSE` (fase 0).
- [ ] Criar o `CREDITS.md` a partir da seção "Texto de crédito" (fase 1, quando o primeiro som entrar).
- [x] Atualizar as versões da tabela de dependências depois do `npm install`.
- [ ] Se houver teste com pessoas (questionário SUS, medição de reconhecimento): perguntar ao orientador sobre Comitê de Ética (CEP) e termo de consentimento (TCLE).
