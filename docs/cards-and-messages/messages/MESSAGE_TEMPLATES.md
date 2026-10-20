# Greeting message library (fixed templates)

This file lists every message template shipped in the app, for copy review. The source of truth is the code: `src/messages/templates.it.ts` and `src/messages/templates.en.ts`. This list is generated from those files, so update it after changing them.

## How the templates work

| Placeholder | Meaning |
|-------------|---------|
| `{name}` | First name of the person (first word of the saved name, first letter uppercased) |
| `{age}` | Age they are turning. The template is skipped when the birth year is unknown |
| `{g:male\|female}` | Gender agreement, e.g. `{g:Caro\|Cara}`. The template is skipped when the gender is not set |

Rules for writers:

- **Never change or reuse an id** once released. Add new templates at the end of the file.
- Keep the Italian and English lists parallel: the same id exists in both languages (a test checks it). The English text is adapted, not a literal translation.
- Italian texts stay neutral about the **sender's** gender (avoid "contento/a", "sono stato/a"). Use `{g:..|..}` only for the **recipient**.
- "Formal" Italian templates use *Lei* or neutral phrasing; the others use *tu*.
- Every template must contain `{name}`.
- Keep jokes about age gentle: they are shown to people of every age.
- Do not include emoji in greeting templates.

## Italian (41 templates)

### Warm

| ID | For | Text |
|----|-----|------|
| `it.warm-any-1` | Any relationship | Buon compleanno, {name}! Ti auguro un anno pieno di cose belle, di sorrisi e di persone che ti vogliono bene.  |
| `it.warm-any-2` | Any relationship | Auguri {name}! Che questo nuovo anno ti porti serenità, salute e tutto ciò che desideri. Goditi la tua giornata! |
| `it.warm-any-3` | Any relationship | Tantissimi auguri, {name}! Spero che oggi ti riempiano di coccole e attenzioni: te le meriti davvero. |
| `it.warm-any-4` | Any relationship | Buon compleanno {name}! Un pensiero speciale per te in questo giorno speciale. Che sia un anno meraviglioso. |
| `it.warm-any-5` | Any relationship  needs age | {age} anni e ogni anno sempre meglio! Buon compleanno, {name}, ti auguro il meglio. |
| `it.warm-any-6` | Any relationship  needs age | Auguri per i tuoi {age} anni, {name}! Che sia l’anno più bello di sempre. |
| `it.warm-any-7` | Any relationship  needs gender | {g:Caro\|Cara} {name}, buon compleanno! Ti auguro una giornata bellissima e un anno ancora più bello. |
| `it.warm-amico-1` | Friend | Buon compleanno, {name}! Grazie di esserci sempre. Ti auguro un anno ricco di avventure e di risate. |
| `it.warm-amico-2` | Friend | Auguri {name}! Appena riesci festeggiamo come si deve: ti devo almeno un brindisi.  |
| `it.warm-amico-3` | Friend  needs gender | Buon compleanno, {name}! Sei {g:un amico\|un’amica} speciale e sono felice di averti nella mia vita. |
| `it.warm-famiglia-1` | Family | Buon compleanno {name}! Ti voglio un mondo di bene. Spero che oggi sia una giornata dolcissima, piena d’amore. |
| `it.warm-famiglia-2` | Family | Tantissimi auguri, {name}! La famiglia è più bella con te. Ti abbraccio forte! |
| `it.warm-famiglia-3` | Family | Auguri {name}! Grazie per tutto quello che fai e per come ci sei sempre. Ti voglio bene. |
| `it.warm-famiglia-4` | Family  needs gender | {g:Caro\|Cara} {name}, buon compleanno! Un abbraccio grande e tanti baci. |
| `it.warm-collega-1` | Colleague | Buon compleanno, {name}! Grazie per la collaborazione e per l’energia positiva che porti ogni giorno. Ti auguro un anno bellissimo! |
| `it.warm-collega-2` | Colleague | Auguri {name}! È un piacere lavorare con te. Che questo nuovo anno ti porti soddisfazioni e tanti momenti sereni. |

### Funny

| ID | For | Text |
|----|-----|------|
| `it.funny-any-1` | Any relationship | Auguri {name}! Un anno in più, ma tranquillo: il vino migliora con l’età.  |
| `it.funny-any-2` | Any relationship | Non stai invecchiando, {name}, stai maturando come il buon formaggio. Buon compleanno!  |
| `it.funny-any-3` | Any relationship | Buon compleanno {name}! Oggi si mangia torta senza sensi di colpa: lo dice la legge (l’ho appena scritta io).  |
| `it.funny-any-4` | Any relationship  needs age | Auguri {name}! A {age} anni le candeline sono più pericolose di un incendio boschivo. Soffia con prudenza!  |
| `it.funny-any-5` | Any relationship | Buon compleanno {name}! Ti auguro un anno con meno email e più pizza.  |
| `it.funny-any-6` | Any relationship | Auguri {name}! Un anno in più di esperienza, zero in più di maturità. Non cambiare mai!  |
| `it.funny-any-7` | Any relationship  needs age | {age} anni e non sentirli! Anzi, sì, ma non diciamolo. Auguri {name}!  |
| `it.funny-amico-1` | Friend | {name}, auguri! Hai ufficialmente un anno di saggezza in più, ma stasera ci comportiamo come se non fosse vero.  |
| `it.funny-amico-2` | Friend | Auguri {name}! Oggi si festeggia, domani si fa finta di niente. Ti aspetto per il brindisi!  |
| `it.funny-amico-3` | Friend | Ehi {name}, un altro giro intorno al sole e sei ancora la mia scusa preferita per fare festa. Auguri!  |
| `it.funny-famiglia-1` | Family | Auguri {name}! Un altro anno in famiglia e ci sopportiamo ancora: siamo bravissimi. Buon compleanno!  |
| `it.funny-famiglia-2` | Family | Buon compleanno {name}! Oggi comandi tu: scegli il dolce e scegli la musica. Ma solo per oggi!  |
| `it.funny-collega-1` | Colleague | Buon compleanno {name}! Oggi niente riunioni in calendario… almeno nei miei auguri.  |
| `it.funny-collega-2` | Colleague | Auguri {name}! Che il tuo anno sia come un buon caffè in ufficio: caldo, forte e mai finito troppo presto.  |

### Formal

| ID | For | Text |
|----|-----|------|
| `it.formal-any-1` | Any relationship | Buon compleanno, {name}. Le porgo i miei migliori auguri di serenità e successo per il nuovo anno. |
| `it.formal-any-2` | Any relationship | Gentile {name}, tanti auguri di buon compleanno. Le auguro un anno ricco di soddisfazioni personali e professionali. |
| `it.formal-any-3` | Any relationship | Gentile {name}, i migliori auguri di buon compleanno da parte mia. Con stima. |
| `it.formal-collega-1` | Colleague | Buon compleanno, {name}! Grazie per la collaborazione e per l’impegno di ogni giorno. Tanti auguri di cuore. |
| `it.formal-collega-2` | Colleague | Tanti auguri {name}! Ti auguro un anno di nuovi traguardi e grandi soddisfazioni, al lavoro e fuori. |

### Short

| ID | For | Text |
|----|-----|------|
| `it.short-any-1` | Any relationship | Buon compleanno, {name}!  |
| `it.short-any-2` | Any relationship | Auguri {name}!  |
| `it.short-any-3` | Any relationship | Tanti auguri, {name}! Goditi la giornata. |
| `it.short-any-4` | Any relationship | Buon compleanno {name}, un abbraccio! |
| `it.short-any-5` | Any relationship | Auguri di cuore, {name}!  |
| `it.short-any-6` | Any relationship  needs age | {age} anni! Auguri, {name}!  |


## English (41 templates)

### Warm

| ID | For | Text |
|----|-----|------|
| `en.warm-any-1` | Any relationship | Happy birthday, {name}! Wishing you a year full of good things, big smiles, and the people who love you.  |
| `en.warm-any-2` | Any relationship | Happy birthday {name}! May this year bring you peace, health, and everything you wish for. Enjoy your day! |
| `en.warm-any-3` | Any relationship | Many happy returns, {name}! I hope today treats you exactly the way you deserve. |
| `en.warm-any-4` | Any relationship | Happy birthday, {name}! A special thought for you on your special day. Have a wonderful year. |
| `en.warm-any-5` | Any relationship  needs age | {age} and getting better every year! Happy birthday, {name}, all the best. |
| `en.warm-any-6` | Any relationship  needs age | Turning {age}! Happy birthday {name}, may this be your best year yet. |
| `en.warm-any-7` | Any relationship | Happy birthday, dear {name}! Wishing you a beautiful day and an even better year. |
| `en.warm-amico-1` | Friend | Happy birthday, {name}! Thanks for always being there. Wishing you a year full of adventures and laughter. |
| `en.warm-amico-2` | Friend | Happy birthday {name}! As soon as you can, we’re celebrating properly. I owe you at least one drink.  |
| `en.warm-amico-3` | Friend | Happy birthday, {name}! You’re such a special friend and I’m so glad to have you in my life. |
| `en.warm-famiglia-1` | Family | Happy birthday {name}! I love you so much. I hope today is sweet and full of love. |
| `en.warm-famiglia-2` | Family | Happy birthday, {name}! Our family is better with you in it. Big hug! |
| `en.warm-famiglia-3` | Family | Happy birthday {name}! Thank you for everything you do and for always being there. Love you. |
| `en.warm-famiglia-4` | Family | Happy birthday, dear {name}! Sending you a huge hug and lots of love. |
| `en.warm-collega-1` | Colleague | Happy birthday, {name}! Thank you for your teamwork and the positive energy you bring every day. Wishing you a wonderful year! |
| `en.warm-collega-2` | Colleague | Happy birthday {name}! It’s a pleasure working with you. May this new year bring you great moments and plenty of calm ones. |

### Funny

| ID | For | Text |
|----|-----|------|
| `en.funny-any-1` | Any relationship | Happy birthday {name}! Another year older, but don’t worry: wine gets better with age.  |
| `en.funny-any-2` | Any relationship | You’re not getting older, {name}, you’re maturing like good cheese. Happy birthday!  |
| `en.funny-any-3` | Any relationship | Happy birthday {name}! Today you can eat cake without guilt. It’s the law (I just wrote it).  |
| `en.funny-any-4` | Any relationship  needs age | Happy birthday {name}! At {age}, the candles cost more than the cake. Blow carefully!  |
| `en.funny-any-5` | Any relationship | Happy birthday {name}! Wishing you a year with fewer emails and more pizza.  |
| `en.funny-any-6` | Any relationship | Happy birthday {name}! One more year of experience, zero more of maturity. Never change!  |
| `en.funny-any-7` | Any relationship  needs age | {age} and still going strong! Well, mostly. Happy birthday, {name}!  |
| `en.funny-amico-1` | Friend | Happy birthday {name}! You’re officially a year wiser, but tonight we’ll act like it isn’t true.  |
| `en.funny-amico-2` | Friend | Happy birthday {name}! We celebrate today and pretend nothing happened tomorrow. See you for the toast!  |
| `en.funny-amico-3` | Friend | Hey {name}, another trip around the sun and you’re still my favorite excuse to party. Happy birthday!  |
| `en.funny-famiglia-1` | Family | Happy birthday {name}! Another year as a family and we still put up with each other: we’re doing great.  |
| `en.funny-famiglia-2` | Family | Happy birthday {name}! Today you’re in charge: you pick the cake and you pick the music. For today only!  |
| `en.funny-collega-1` | Colleague | Happy birthday {name}! No meetings on your calendar today… at least in my wishes.  |
| `en.funny-collega-2` | Colleague | Happy birthday {name}! May your year be like a good office coffee: hot, strong, and never gone too soon.  |

### Formal

| ID | For | Text |
|----|-----|------|
| `en.formal-any-1` | Any relationship | Happy birthday, {name}. Please accept my best wishes for health, happiness, and success in the year ahead. |
| `en.formal-any-2` | Any relationship | Dear {name}, warmest birthday wishes. May the coming year bring you many personal and professional rewards. |
| `en.formal-any-3` | Any relationship | Dear {name}, my best wishes on your birthday. With kind regards. |
| `en.formal-collega-1` | Colleague | Happy birthday, {name}! Thank you for your collaboration and hard work every day. Best wishes. |
| `en.formal-collega-2` | Colleague | Happy birthday {name}! Wishing you a year of new milestones and great achievements, at work and beyond. |

### Short

| ID | For | Text |
|----|-----|------|
| `en.short-any-1` | Any relationship | Happy birthday, {name}!  |
| `en.short-any-2` | Any relationship | Happy birthday {name}!  |
| `en.short-any-3` | Any relationship | Happy birthday, {name}! Enjoy your day. |
| `en.short-any-4` | Any relationship | Happy birthday {name}, big hug! |
| `en.short-any-5` | Any relationship | Best wishes, {name}!  |
| `en.short-any-6` | Any relationship  needs age | {age} today! Happy birthday, {name}!  |

