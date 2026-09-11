# Retratos ilustrados dos personagens

Para trocar a arte SVG por retratos ilustrados (estilo pintura/aquarela, como no
mockup de referência), salve as imagens nesta pasta (PNG ou WebP, quadradas,
~512x512, rosto centralizado) e aponte o campo `img` do personagem em
`characters.js`:

```js
moises: {
  name: "Moisés",
  img: "chars/moises.png",
  svg: ..., // vira fallback
},
```

Os retratos aparecem automaticamente nos círculos da trilha, nos balões de fala
dos exercícios e na tela de resultado.
