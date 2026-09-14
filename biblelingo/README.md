# 📖 BíbliaLearn

App para estudar inglês com contexto bíblico, no estilo Duolingo, otimizado para celular. 100% estático (HTML/CSS/JS puro), sem build e sem dependências: funciona direto no GitHub Pages ou em qualquer hospedagem.

## Funcionalidades

- **Trilha** com 8 capítulos (A Palavra de Deus, Noé, Moisés, Davi, Isaías, José, Daniel, Pedro e Jesus): 24 etapas de lição, 8 revisões e 48 cenas do dia a dia intercaladas (6 por personagem), com nós bloqueados/desbloqueados e retomada no ponto
- **Lições** com 8 a 10 palavras e 8 a 12 frases por etapa cobrindo o arco da passagem, versículo (KJV, domínio público) com lacuna, leitura, diálogo e quiz; 16 formatos de exercício gerados automaticamente (imagem, significado, pareamento, escuta, montar, digitar, lacuna, traduzir, falar, ler, conversar)
- **Cenas**: conversas reais da Bíblia vividas como situações de hoje (apresentar-se, comprar, pedir ajuda...), com transcript, resposta do herói, lacunas e produção
- **Histórias** interativas, **hub de prática** (Match Madness, revisão rápida, escuta rápida, praticar erros), missões diárias, coroas por capítulo, conquistas e perfil
- **Gamificação**: corações diários, XP com combo e bônus, ofensiva, estrelas e precisão; repetição espaçada por palavra
- **Áudio** gravado por personagem (ElevenLabs, via `tools/` e o workflow `gen-audio.yml`), palavras recortadas das próprias frases, sprites com cache offline; síntese do navegador como reserva
- **Progresso salvo** no aparelho (localStorage) e **PWA** com service worker offline

## Como rodar

Abra `index.html` no navegador, ou sirva a pasta:

```bash
npx serve biblelingo
```

Microfone, vibração e service worker exigem HTTPS ou localhost.

## Estrutura

```
biblelingo/
├── index.html        # telas (trilha, lição, resultado, hub, perfil...)
├── style.css         # estilos mobile-first
├── app.js            # lógica: trilha, montador de exercícios, checagem, corações, XP
├── features.js       # áudio, repetição espaçada, retomada, coroas, missões
├── hub.js / screens.js / scene-engine.js
├── data.js           # capítulos e lições (gerado de content/u*.json)
├── scenes.js / scenes2.js / stories.js / characters.js
├── audio/            # manifest, sprites e recortes de palavra
├── tools/            # gen-audio.mjs, align-words.py, build-sprites.mjs
└── manifest.webmanifest, sw.js
```

O conteúdo das lições vive em JSON por capítulo (um arquivo por unidade, no formato de `data.js`); os exercícios são gerados automaticamente a partir do vocabulário, das frases, do versículo, da leitura, do diálogo e do quiz de cada etapa.
