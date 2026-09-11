# 📖 BibleLingo

Site para estudar inglês com contexto bíblico, no estilo Duolingo, otimizado para celular. 100% estático (HTML/CSS/JS puro), sem build e sem dependências — funciona direto no GitHub Pages ou em qualquer hospedagem.

## Funcionalidades

- **Trilha de lições** com 5 unidades temáticas (Criação, Família, Verbos da Fé, Salmos, Palavras da Fé), nós bloqueados/desbloqueados e revisão ao fim de cada unidade
- **6 tipos de exercício**: tradução EN→PT e PT→EN, escuta (áudio nativo via síntese de voz), montagem de frases com banco de palavras, pareamento de pares e complete o versículo
- **Gamificação**: corações (5 por dia, perde 1 por erro), XP com bônus de lição perfeita, ofensiva (streak) diária e precisão
- **Recuperação de corações** praticando lições já concluídas
- **Progresso salvo** no aparelho (localStorage)
- **PWA-ready**: manifest para adicionar à tela inicial do celular

Os versículos em inglês usam a KJV (domínio público).

## Como rodar

Abra `index.html` no navegador, ou sirva a pasta:

```bash
npx serve biblelingo
```

Para publicar no GitHub Pages, aponte o Pages para a branch e acesse `/biblelingo/`.

## Estrutura

```
biblelingo/
├── index.html   # telas (trilha, lição, resultado, modal)
├── style.css    # estilos mobile-first
├── app.js       # lógica: trilha, exercícios, corações, XP, streak
├── data.js      # unidades, lições, vocabulário e versículos
└── manifest.webmanifest
```

Para adicionar conteúdo, basta editar `data.js` — os exercícios são gerados automaticamente a partir do vocabulário, das frases e dos versículos de cada lição.
