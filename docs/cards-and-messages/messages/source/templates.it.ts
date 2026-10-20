import { buildTemplates, TemplateRow } from './types';

// Italian templates. Rules for writers:
//  - never change or reuse an id once released (append only)
//  - keep the sentence neutral about the SENDER's gender
//  - use {g:..|..} only when the RECIPIENT's gender is needed
//  - "formal" templates use "Lei" (or are neutral); all others use "tu"
const rows: TemplateRow[] = [
  // ---- warm  any
  ['warm-any-1', 'warm', 'any', 'Buon compleanno, {name}! Ti auguro un anno pieno di cose belle, di sorrisi e di persone che ti vogliono bene. '],
  ['warm-any-2', 'warm', 'any', 'Auguri {name}! Che questo nuovo anno ti porti serenità, salute e tutto ciò che desideri. Goditi la tua giornata!'],
  ['warm-any-3', 'warm', 'any', 'Tantissimi auguri, {name}! Spero che oggi ti riempiano di coccole e attenzioni: te le meriti davvero.'],
  ['warm-any-4', 'warm', 'any', 'Buon compleanno {name}! Un pensiero speciale per te in questo giorno speciale. Che sia un anno meraviglioso.'],
  ['warm-any-5', 'warm', 'any', '{age} anni e ogni anno sempre meglio! Buon compleanno, {name}, ti auguro il meglio.'],
  ['warm-any-6', 'warm', 'any', 'Auguri per i tuoi {age} anni, {name}! Che sia l’anno più bello di sempre.'],
  ['warm-any-7', 'warm', 'any', '{g:Caro|Cara} {name}, buon compleanno! Ti auguro una giornata bellissima e un anno ancora più bello.'],

  // ---- warm  amico
  ['warm-amico-1', 'warm', 'amico', 'Buon compleanno, {name}! Grazie di esserci sempre. Ti auguro un anno ricco di avventure e di risate.'],
  ['warm-amico-2', 'warm', 'amico', 'Auguri {name}! Appena riesci festeggiamo come si deve: ti devo almeno un brindisi. '],
  ['warm-amico-3', 'warm', 'amico', 'Buon compleanno, {name}! Sei {g:un amico|un’amica} speciale e sono felice di averti nella mia vita.'],

  // ---- warm  famiglia
  ['warm-famiglia-1', 'warm', 'famiglia', 'Buon compleanno {name}! Ti voglio un mondo di bene. Spero che oggi sia una giornata dolcissima, piena d’amore.'],
  ['warm-famiglia-2', 'warm', 'famiglia', 'Tantissimi auguri, {name}! La famiglia è più bella con te. Ti abbraccio forte!'],
  ['warm-famiglia-3', 'warm', 'famiglia', 'Auguri {name}! Grazie per tutto quello che fai e per come ci sei sempre. Ti voglio bene.'],
  ['warm-famiglia-4', 'warm', 'famiglia', '{g:Caro|Cara} {name}, buon compleanno! Un abbraccio grande e tanti baci.'],

  // ---- funny  any
  ['funny-any-1', 'funny', 'any', 'Auguri {name}! Un anno in più, ma tranquillo: il vino migliora con l’età. '],
  ['funny-any-2', 'funny', 'any', 'Non stai invecchiando, {name}, stai maturando come il buon formaggio. Buon compleanno! '],
  ['funny-any-3', 'funny', 'any', 'Buon compleanno {name}! Oggi si mangia torta senza sensi di colpa: lo dice la legge (l’ho appena scritta io). '],
  ['funny-any-4', 'funny', 'any', 'Auguri {name}! A {age} anni le candeline sono più pericolose di un incendio boschivo. Soffia con prudenza! '],
  ['funny-any-5', 'funny', 'any', 'Buon compleanno {name}! Ti auguro un anno con meno email e più pizza. '],
  ['funny-any-6', 'funny', 'any', 'Auguri {name}! Un anno in più di esperienza, zero in più di maturità. Non cambiare mai! '],

  // ---- funny  amico
  ['funny-amico-1', 'funny', 'amico', '{name}, auguri! Hai ufficialmente un anno di saggezza in più, ma stasera ci comportiamo come se non fosse vero. '],

  // ---- funny  collega
  ['funny-collega-1', 'funny', 'collega', 'Buon compleanno {name}! Oggi niente riunioni in calendario… almeno nei miei auguri. '],
  ['funny-collega-2', 'funny', 'collega', 'Auguri {name}! Che il tuo anno sia come un buon caffè in ufficio: caldo, forte e mai finito troppo presto. '],

  // ---- formal
  ['formal-any-1', 'formal', 'any', 'Buon compleanno, {name}. Le porgo i miei migliori auguri di serenità e successo per il nuovo anno.'],
  ['formal-any-2', 'formal', 'any', 'Gentile {name}, tanti auguri di buon compleanno. Le auguro un anno ricco di soddisfazioni personali e professionali.'],
  ['formal-any-3', 'formal', 'any', 'Gentile {name}, i migliori auguri di buon compleanno da parte mia. Con stima.'],
  ['formal-collega-1', 'formal', 'collega', 'Buon compleanno, {name}! Grazie per la collaborazione e per l’impegno di ogni giorno. Tanti auguri di cuore.'],
  ['formal-collega-2', 'formal', 'collega', 'Tanti auguri {name}! Ti auguro un anno di nuovi traguardi e grandi soddisfazioni, al lavoro e fuori.'],

  // ---- short
  ['short-any-1', 'short', 'any', 'Buon compleanno, {name}! '],
  ['short-any-2', 'short', 'any', 'Auguri {name}! '],
  ['short-any-3', 'short', 'any', 'Tanti auguri, {name}! Goditi la giornata.'],
  ['short-any-4', 'short', 'any', 'Buon compleanno {name}, un abbraccio!'],
  ['short-any-5', 'short', 'any', 'Auguri di cuore, {name}! '],
  ['short-any-6', 'short', 'any', '{age} anni! Auguri, {name}! '],

  // ---- additions (fill gaps: colleagues, family, more friends)
  ['warm-collega-1', 'warm', 'collega', 'Buon compleanno, {name}! Grazie per la collaborazione e per l’energia positiva che porti ogni giorno. Ti auguro un anno bellissimo!'],
  ['warm-collega-2', 'warm', 'collega', 'Auguri {name}! È un piacere lavorare con te. Che questo nuovo anno ti porti soddisfazioni e tanti momenti sereni.'],
  ['funny-famiglia-1', 'funny', 'famiglia', 'Auguri {name}! Un altro anno in famiglia e ci sopportiamo ancora: siamo bravissimi. Buon compleanno! '],
  ['funny-famiglia-2', 'funny', 'famiglia', 'Buon compleanno {name}! Oggi comandi tu: scegli il dolce e scegli la musica. Ma solo per oggi! '],
  ['funny-amico-2', 'funny', 'amico', 'Auguri {name}! Oggi si festeggia, domani si fa finta di niente. Ti aspetto per il brindisi! '],
  ['funny-amico-3', 'funny', 'amico', 'Ehi {name}, un altro giro intorno al sole e sei ancora la mia scusa preferita per fare festa. Auguri! '],
  ['funny-any-7', 'funny', 'any', '{age} anni e non sentirli! Anzi, sì, ma non diciamolo. Auguri {name}! '],
];

export const IT_TEMPLATES = buildTemplates('it', rows);
