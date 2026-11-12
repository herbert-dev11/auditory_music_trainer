# 012 — Página de teste da fala (fase 4)

Escopo: [PROJECT.md](../docs/PROJECT.md) v0.3, fase 4 do Roteiro: RF09 (mostrar o que o sistema entendeu), RNF01 (navegadores com voz), RNF03 (não gravar a voz), RNF04 (aviso de privacidade). Base para a fase 5 (interpretar a fala) e para o RNF07/RNF08 (taxa de acerto e tempo).

## Problema

O jogo vai ser respondido só por voz (decisão do autor em 2026-11-12). Antes de construir o jogo, é preciso saber, em aparelhos reais, o que o reconhecimento entende quando a pessoa diz "dó", "si", "ré bemol", "lá menor": que erros aparecem ("si" virando "sim", "dó" virando "do"), quantas vezes acerta e quanto demora. Sem isso, a interpretação da fase 5 seria chute.

**Dentro:** adaptador de reconhecimento de fala, página de teste que mostra transcrições e alternativas e registra os resultados, publicação no GitHub Pages (HTTPS) para testar no celular.
**Fora:** interpretar a fala em nota ou acorde (fase 5); o jogo por voz (fase 6).

## Decisões

- **Alvo: Chrome (computador e Android) e iPhone** (decisão do autor). No iPhone, todo navegador usa o motor do Safari, e o reconhecimento é o da Apple. O RNF01 do PROJECT.md foi ajustado. Firefox e navegadores sem o serviço do Google ficam fora.
- **Web Speech API (`SpeechRecognition`, com o prefixo `webkit` quando preciso)**, em pt-BR, sem resultados parciais, com até 5 alternativas. Reconhecimento dentro do navegador com Vosk ou Whisper continua como plano B, se a taxa de acerto não chegar aos 90% (RNF07).
- **Adaptador atrás da interface `ReconhecedorDeFala`** (`fala/reconhecedor.ts`), como prevê o [architecture.md](../docs/architecture.md): o jogo da fase 6 usa a mesma interface, e os testes injetam um falso. Resultado: `fala` (alternativas com confiança e tempo de resposta), `silencio` ou `erro` (com o código do navegador, como `not-allowed`).
- **Tempo de resposta medido do fim da fala ao resultado** (evento `speechend` até `result`), que é o que o RNF08 pede (até 1,5 s).
- **`normalizar` em `dominio/normalizacao.ts`** (minúsculas, sem acentos, sem pontuação), com testes: a página compara a fala com a palavra esperada e a fase 5 reaproveita a mesma função.
- **Página `#/teste-da-fala`**, com link discreto na tela inicial (é ferramenta de teste, não parte do jogo):
  - escolhe a palavra esperada numa lista (notas naturais, sustenidos, bemóis, acordes dos casos do [nomenclatura.md](../docs/nomenclatura.md)) ou fala livre;
  - botão grande "Falar" (bom para o dedo no celular); o microfone só abre no toque e fecha sozinho. **Emendado pelo [plano 013](013-segurar-para-falar.md):** virou "segure para falar", nas mesmas condições do jogo;
  - mostra as alternativas, a confiança e o tempo; classifica a tentativa em "acertou na 1ª alternativa", "acertou em outra alternativa", "diferente", "silêncio" ou "erro";
  - resumo da sessão (tentativas, % de acerto, tempo médio) e histórico em tabela;
  - **exporta em CSV** (copiar ou baixar) com o navegador, a palavra esperada, o resultado, o tempo e as alternativas: é a matéria-prima da lista de sinônimos da fase 5 e da medição do RNF07.
- **Nada da voz é gravado** (RNF03): só o texto que o navegador devolve, e só na memória da página até o usuário exportar. Aviso de privacidade visível (RNF04): o áudio vai para o serviço do navegador (Google no Chrome, Apple no iPhone).
- **Publicação no GitHub Pages por GitHub Actions** (`.github/workflows/pages.yml`, a cada push no `main`): o microfone só funciona em HTTPS, e o servidor de desenvolvimento acessado pelo celular não é HTTPS. O Pages já era o destino do app no PROJECT.md. Certificado próprio no servidor local (rejeitado: o iPhone recusa sem configuração manual).
- **Endereços relativos no build** (`base: './'` no Vite): o app funciona em `https://<usuário>.github.io/auditory_music_trainer/` sem fixar o nome do repositório no código; a navegação por hash e as amostras (`BASE_URL`) já são relativas.

## Dados

Nenhum dado guardado. Os resultados ficam na memória da página até serem exportados em CSV pelo usuário. O CSV não tem dado pessoal: só palavras, tempos e o nome do navegador.

## API

Tela nova: **Teste da fala** (`#/teste-da-fala`). Link discreto na tela inicial.

## Riscos

- No iPhone, o reconhecimento pode depender da Siri ou do ditado estarem ativados; a página mostra o código de erro para diagnosticar.
- O Chrome precisa de internet para reconhecer (o áudio vai para o Google).
- Publicar no Pages deixa o app público na internet; o repositório já é público.
- `fala/` e `ui/` sem teste automático (navegador e microfone reais); o teste é à mão, com o CSV como registro.

## Critério de pronto

- [x] `normalizar` com testes
- [x] `ReconhecedorDeFala` e implementação Web Speech (fala, silêncio, erro, tempo máximo, parar)
- [x] Página de teste com lista de palavras, botão Falar, alternativas, classificação, resumo, histórico e exportação CSV, responsiva (classificação, resumo e CSV em `exercicio/testeDaFala.ts`, testados)
- [x] Aviso de privacidade e aviso de navegador sem fala
- [x] Build com endereços relativos e workflow do Pages
- [x] PROJECT.md (RNF01, Roteiro), [architecture.md](../docs/architecture.md), [testing.md](../docs/testing.md) e README atualizados
- [x] Pages ativado no repositório e primeira publicação (2026-11-12, com HTTPS obrigatório)
- [ ] Testado à mão no Chrome do computador e no iPhone, pelo endereço do Pages; CSV guardado para a fase 5

## Histórico

- 2026-11-12: plano escrito a pedido do autor, depois da decisão de responder só por voz e de mirar Chrome e iPhone.
