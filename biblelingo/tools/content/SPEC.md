# Especificação: conteúdo das lições (BíbliaLearn)

Objetivo: cada lição deixa de girar em torno de uma única frase ("God created...") e passa a explorar
o arco narrativo da passagem, com vocabulário e frases variados. Padrão de qualidade: muito bem feito,
fiel à Bíblia, inglês natural, português com acentos e sem travessão ("—").

Entregue UM arquivo JSON por unidade em content/uX.json
com o formato exato de u1.json (exemplar aprovado). Valide com: `node tools/content/validate.js content/uX.json` (deve imprimir "OK").
Não edite nenhum arquivo do projeto (data.js etc.); o merge é feito depois.

## Regras
1. Mantenha os ids (uXl1, uXl2, uXl3), o `verse.ref` só muda se você trocar o versículo por um mais representativo da lição.
   Título da lição (pt) pode mudar para refletir o tema.
2. `vocab`: 8 a 10 itens. Os 4 PRIMEIROS são as palavras-base da lição (ensinadas na 1ª vez): escolha as mais
   importantes da passagem. Cada item: `en` (forma de dicionário: verbos com "to "), `pt` (tradução curta; pode
   trazer alternativa entre parênteses), `icon` (1 emoji, único dentro da lição, de preferência Emoji ≤ 12.0:
   nada de 🫶 🪪 🫡 🫂 🪞 🛟 😮‍💨). Sem repetir `en` dentro da unidade; evite repetir `en` de outras unidades
   (o validador avisa com base no data.js atual; unidades 1 a 8 estão sendo refeitas em paralelo, então
   priorize palavras próprias da sua passagem). Reaproveite as palavras já existentes na lição quando forem boas.
3. `sentences`: 8 a 12 frases, no máximo 12 palavras, começando com maiúscula. Cada frase usa pelo menos uma
   palavra do vocabulário da lição. Varie as estruturas: no máximo 2 frases começam com as mesmas duas palavras.
   Cubra a narrativa inteira da passagem (personagens, ações, falas marcantes, desfecho), não só um fato.
   Citações da Escritura: inglês da KJV (pode simplificar arcaísmos: "you" em vez de "thee"; mantenha frases
   icônicas quando forem curtas e claras); português da Almeida Revista e Corrigida (tu/vós em citações
   literais; fala livre em "você"). Frases livres: inglês simples e moderno, presente ou passado simples.
   REAPROVEITE as frases atuais da lição que já forem boas (têm áudio gerado), copiando o `en` exatamente.
   `alt` (lista de variantes aceitas em inglês) é opcional.
4. `verse`: texto literal da KJV (pode ser um trecho, sem saltos internos; se cortar o início, comece com
   maiúscula), `pt` da Almeida, `blank` = uma palavra que aparece EXATAMENTE uma vez como palavra inteira,
   4 `options` (a lacuna + 3 distratores da mesma classe gramatical).
5. `reading` (texto de 2 a 4 frases curtas em inglês + pt + pergunta com 3 opções), `dialogue` (uma fala + 3
   respostas, a certa em `answer` com `answerPt`), `quiz` (pergunta + 3 opções + `explain` em pt com a
   referência). Os três cobrem FATOS DIFERENTES da passagem (nunca a mesma pergunta). Distratores plausíveis
   mas claramente errados. Precisão bíblica: nada de detalhes que não estão no texto (ex.: "menino com cinco
   pães" só em João 6; ismaelitas compraram José, não "o Egito").
6. Ícones: a mesma palavra em lições diferentes não precisa do mesmo ícone, mas dentro da lição não repita.
7. Nada de conteúdo doutrinário/sectário: só o que a passagem diz.

## Unidades e passagens (temas atuais em data.js; leia a unidade inteira antes de escrever)
- u2 Noé e a arca (Gênesis 6–9): l1 a arca e o dilúvio, l2 quarenta dias, l3 a pomba e a promessa (arco-íris).
- u3 Moisés (Êxodo 3–14): l1 sarça ardente, l2 "deixa ir o meu povo"/pragas, l3 o mar Vermelho.
- u4 Davi (1 Samuel 16 – 2 Samuel 22): l1 o pastor escolhido/harpa, l2 Golias, l3 o rei cantor (salmos).
- u5 Isaías (Isaías 6–9): l1 a visão do trono, l2 o menino que nasce (Emanuel), l3 o Príncipe da Paz.
- u6 José (Gênesis 37–50): l1 os sonhos e a túnica, l2 no Egito/Potifar/prisão, l3 os irmãos e o perdão.
- u7 Daniel (Daniel 1–6): l1 fiel na Babilônia (comida do rei), l2 a cova dos leões, l3 o Deus vivo (Dario).
- u8 Pedro/Jesus (Mateus 4, 6, 14): l1 pescadores de homens, l2 o Pai Nosso, l3 pães e peixes.
