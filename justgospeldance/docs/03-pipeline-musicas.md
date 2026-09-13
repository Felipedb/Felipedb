# 03. Pipeline de músicas: Suno e domínio público

## Objetivo

Produzir, para cada música do catálogo, um áudio novo, animado e dançável, a partir
de um hino cuja letra, melodia e tradução estejam em domínio público no Brasil, com
os direitos do áudio gerado claros e registrados.

## Passo a passo por música

1. **Selecionar** um hino do catálogo (`musicas/catalogo-candidatas.md`).
2. **Verificar** letra, melodia e tradução com o checklist abaixo; anotar fontes.
3. **Preparar a letra**: usar a tradução em domínio público ou escrever uma letra
   nova sobre a melodia. Ajustar para 2:00 a 2:30 de música (2 estrofes e refrão
   costumam bastar).
4. **Gerar no Suno**: prompt com estilo, BPM e estrutura; gerar 4 a 6 variações;
   escolher a que tem batida mais clara e regular.
5. **Pós-produção**: exportar em WAV, normalizar volume (alvo -14 LUFS), cortar
   silêncio inicial, detectar o BPM e o offset do primeiro tempo, converter para
   MP3 320 kbps ou OGG.
6. **Registrar** em `song.json`: autores e anos de falecimento, fontes, plano do
   Suno, data, versão do modelo, prompt e identificador da geração.

## Domínio público no Brasil: o que checar

Base legal: Lei 9.610/1998. O art. 41 diz que os direitos patrimoniais duram 70 anos
contados de 1º de janeiro do ano seguinte ao da morte do autor. O art. 45 coloca em
domínio público as obras de autores falecidos sem sucessores e as de autor
desconhecido (folclore e canções tradicionais).

Regra prática para 2026: **todos** os autores envolvidos precisam ter morrido até
1955. Em 2027 a linha passa para 1956, e assim por diante.

Um hino tem até quatro camadas de direito, e cada uma é checada separadamente:

| Camada | Pergunta | Exemplo de armadilha |
| --- | --- | --- |
| Letra original | Quem escreveu e quando morreu? | "Rude Cruz": George Bennard morreu em 1958, só entra em 2029 |
| Melodia | Quem compôs e quando morreu? | "Tu és fiel, Senhor": William Runyan morreu em 1957 |
| Tradução ou versão em português | Quem traduziu e quando morreu? | Harpa Cristã: Paulo Leivas Macalão morreu em 1982, letras protegidas até 2053 |
| Arranjo e gravação de terceiros | Estamos copiando algum arranjo ou gravação específica? | "Oh Happy Day": o hino de Doddridge (1751) é livre, o arranjo de Edwin Hawkins (1967) não |

Fontes de letras em português já em domínio público:

- **Cantor Cristão** (Batista, 1891), traduções de Salomão Ginsburg (1867 a 1927).
- **Salmos e Hinos** (1861), de Robert Kalley (1809 a 1888) e Sarah Kalley (1825 a 1907).
- Edições antigas de hinários, sempre conferindo o tradutor de cada hino: um hinário
  antigo pode conter traduções revisadas décadas depois.

O que fazer quando a tradução conhecida é protegida: escrever letra própria sobre a
melodia livre (a letra nova é sua) ou usar a tradução antiga em domínio público.
Isso vale para "Maravilhosa Graça", "Grandioso és Tu" (a versão inglesa de Stuart
Hine, 1949, é protegida; o original sueco de Carl Boberg é livre) e para qualquer
hino que só se conheça pela Harpa Cristã.

Referência de longevidade dos autores em `musicas/catalogo-candidatas.md`. Antes de
publicar, conferir cada nome em duas fontes (Hymnary.org, Wikipedia, hinologia.org).

## Suno: o que está mapeado

Termos de serviço do Suno, última revisão 26 de março de 2026, segundo fontes
públicas consultadas em setembro de 2026 (o site suno.com não era acessível do
ambiente desta sessão; confirmar em https://suno.com/terms-of-service):

- **Plano gratuito**: uso apenas pessoal e não comercial.
- **Pro e Premier**: o Suno cede ao assinante seus direitos sobre as músicas geradas
  enquanto assinante; a cessão continua valendo para o que foi gerado no período
  mesmo depois de cancelar.
- **Sem garantia de copyright**: o Suno declara que não garante que exista direito
  autoral sobre o resultado, por ser gerado por IA. Na prática, o áudio não
  necessariamente é protegido contra cópia por terceiros.
- **Upload de áudio (Cover e Extend)**: só com direitos sobre o áudio enviado.
  Gravação própria de um hino em domínio público serve; gravação de terceiros não.
- **Remix de música de outro usuário**: obra conjunta e não comercial. Não usar.

Consequências para o projeto:

- Gerar as músicas do catálogo com plano Pro ou Premier se houver qualquer uso
  além do pessoal (publicar o jogo já é distribuição).
- Registrar no `song.json` o plano ativo, a data, a versão do modelo e o ID da
  geração, para provar a origem se precisar.
- Não subir áudios de terceiros como base de Cover.

Estas são orientações para a sua decisão; licença, monetização e publicação
continuam sendo escolhas suas.

## Como pedir ao Suno uma versão dançável

Elementos que ajudam a pontuação e a coreografia:

- **BPM fixo entre 118 e 130** e batida quadrada (4/4), sem rubato. Gêneros que
  funcionam: pop dance, eletrônico leve, funk melody, axé, gospel contemporâneo
  com bateria eletrônica.
- **Estrutura previsível**: intro de 4 compassos (serve de contagem), estrofe,
  refrão, estrofe, refrão, ponte curta, refrão final. Duração de 2:00 a 2:30.
- **Refrão repetido com a mesma melodia**: permite reaproveitar o mesmo bloco de
  coreografia.
- **Letra em português no campo de letra** (modo custom), com marcações
  `[Intro]`, `[Verse]`, `[Chorus]` para o Suno respeitar a estrutura.
- Evitar fade-out longo; pedir final seco.

Exemplo de prompt de estilo:

```
Gospel pop dançante, 124 BPM, 4/4, bateria eletrônica marcada, sintetizador
brilhante, vocal feminino forte, coro no refrão, energia alta, final seco.
```

Se a melodia original precisar ser preservada (fidelidade ao hino), a rota mais
confiável é gravar a melodia cantada ou tocada de forma simples (piano ou voz) e
usar o recurso Cover do Suno sobre essa gravação própria.

## Pós-produção mínima

| Etapa | Ferramenta | Resultado |
| --- | --- | --- |
| Normalização de volume | ffmpeg `loudnorm` ou Audacity | -14 LUFS, pico -1 dBTP |
| Detecção de BPM e offset | `aubio`, `librosa` ou Sonic Visualiser | `bpm` e `offsetPrimeiroBeatMs` no `song.json` |
| Conversão | ffmpeg | MP3 320 kbps ou OGG q8 |
| Capa | imagem 1:1, 1024 px | `capa.jpg` |

Comando de referência para normalizar e converter:

```bash
ffmpeg -i entrada.wav -af loudnorm=I=-14:TP=-1:LRA=11 -codec:a libmp3lame -b:a 320k audio.mp3
```

## Checklist por música (copiar para o PR de cada música)

- [ ] Letra original: autor e ano de morte anotados; morreu até 1955 ou autor desconhecido.
- [ ] Melodia: compositor e ano de morte anotados; morreu até 1955 ou tradicional.
- [ ] Letra em português: tradução em domínio público identificada, ou letra própria.
- [ ] Não copia arranjo nem gravação específica de terceiros.
- [ ] Fontes das verificações listadas no `song.json`.
- [ ] Gerado no Suno com plano Pro ou Premier; plano, data, modelo, prompt e ID registrados.
- [ ] Áudio normalizado, BPM e offset medidos, duração entre 2:00 e 2:30.
- [ ] Coreografia gravada, `choreo.json` extraído e movimentos marcados.
