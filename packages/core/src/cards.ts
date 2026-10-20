export type GreetingLocale = 'it' | 'en';
export type GreetingTone = 'warm' | 'funny' | 'formal' | 'short';
export type GreetingRelationship = 'any' | 'amico' | 'famiglia' | 'collega';

export interface GreetingTemplate {
  id: string;
  tone: GreetingTone;
  relationship: GreetingRelationship;
  needsAge?: boolean;
  text: string;
}

const it: GreetingTemplate[] = [
  { id: 'warm-any-1', tone: 'warm', relationship: 'any', text: 'Buon compleanno, {name}! Ti auguro un anno pieno di cose belle, di sorrisi e di persone che ti vogliono bene. ' },
  { id: 'warm-any-2', tone: 'warm', relationship: 'any', text: 'Auguri {name}! Che questo nuovo anno ti porti serenità, salute e tutto ciò che desideri. Goditi la tua giornata!' },
  { id: 'warm-any-3', tone: 'warm', relationship: 'any', text: 'Tantissimi auguri, {name}! Spero che oggi ti riempiano di coccole e attenzioni: te le meriti davvero.' },
  { id: 'warm-any-4', tone: 'warm', relationship: 'any', text: 'Buon compleanno {name}! Un pensiero speciale per te in questo giorno speciale. Che sia un anno meraviglioso.' },
  { id: 'warm-any-5', tone: 'warm', relationship: 'any', needsAge: true, text: '{age} anni e ogni anno sempre meglio! Buon compleanno, {name}, ti auguro il meglio.' },
  { id: 'warm-any-6', tone: 'warm', relationship: 'any', needsAge: true, text: 'Auguri per i tuoi {age} anni, {name}! Che sia l’anno più bello di sempre.' },
  { id: 'warm-amico-1', tone: 'warm', relationship: 'amico', text: 'Buon compleanno, {name}! Grazie di esserci sempre. Ti auguro un anno ricco di avventure e di risate.' },
  { id: 'warm-amico-2', tone: 'warm', relationship: 'amico', text: 'Auguri {name}! Appena riesci festeggiamo come si deve: ti devo almeno un brindisi. ' },
  { id: 'warm-famiglia-1', tone: 'warm', relationship: 'famiglia', text: 'Buon compleanno {name}! Ti voglio un mondo di bene. Spero che oggi sia una giornata dolcissima, piena d’amore.' },
  { id: 'warm-famiglia-2', tone: 'warm', relationship: 'famiglia', text: 'Tantissimi auguri, {name}! La famiglia è più bella con te. Ti abbraccio forte!' },
  { id: 'warm-famiglia-3', tone: 'warm', relationship: 'famiglia', text: 'Auguri {name}! Grazie per tutto quello che fai e per come ci sei sempre. Ti voglio bene.' },
  { id: 'funny-any-1', tone: 'funny', relationship: 'any', text: 'Auguri {name}! Un anno in più, ma tranquillo: il vino migliora con l’età. ' },
  { id: 'funny-any-2', tone: 'funny', relationship: 'any', text: 'Non stai invecchiando, {name}, stai maturando come il buon formaggio. Buon compleanno! ' },
  { id: 'funny-any-3', tone: 'funny', relationship: 'any', text: 'Buon compleanno {name}! Oggi si mangia torta senza sensi di colpa: lo dice la legge (l’ho appena scritta io). ' },
  { id: 'funny-any-4', tone: 'funny', relationship: 'any', needsAge: true, text: 'Auguri {name}! A {age} anni le candeline sono più pericolose di un incendio boschivo. Soffia con prudenza! ' },
  { id: 'funny-any-5', tone: 'funny', relationship: 'any', text: 'Buon compleanno {name}! Ti auguro un anno con meno email e più pizza. ' },
  { id: 'funny-any-6', tone: 'funny', relationship: 'any', text: 'Auguri {name}! Un anno in più di esperienza, zero in più di maturità. Non cambiare mai! ' },
  { id: 'funny-any-7', tone: 'funny', relationship: 'any', needsAge: true, text: '{age} anni e non sentirli! Anzi, sì, ma non diciamolo. Auguri {name}! ' },
  { id: 'funny-amico-1', tone: 'funny', relationship: 'amico', text: '{name}, auguri! Hai ufficialmente un anno di saggezza in più, ma stasera ci comportiamo come se non fosse vero. ' },
  { id: 'funny-amico-2', tone: 'funny', relationship: 'amico', text: 'Auguri {name}! Oggi si festeggia, domani si fa finta di niente. Ti aspetto per il brindisi! ' },
  { id: 'funny-amico-3', tone: 'funny', relationship: 'amico', text: 'Ehi {name}, un altro giro intorno al sole e sei ancora la mia scusa preferita per fare festa. Auguri! ' },
  { id: 'funny-famiglia-1', tone: 'funny', relationship: 'famiglia', text: 'Auguri {name}! Un altro anno in famiglia e ci sopportiamo ancora: siamo bravissimi. Buon compleanno! ' },
  { id: 'funny-famiglia-2', tone: 'funny', relationship: 'famiglia', text: 'Buon compleanno {name}! Oggi comandi tu: scegli il dolce e scegli la musica. Ma solo per oggi! ' },
  { id: 'funny-collega-1', tone: 'funny', relationship: 'collega', text: 'Buon compleanno {name}! Oggi niente riunioni in calendario… almeno nei miei auguri. ' },
  { id: 'funny-collega-2', tone: 'funny', relationship: 'collega', text: 'Auguri {name}! Che il tuo anno sia come un buon caffè in ufficio: caldo, forte e mai finito troppo presto. ' },
  { id: 'formal-any-1', tone: 'formal', relationship: 'any', text: 'Buon compleanno, {name}. Le porgo i miei migliori auguri di serenità e successo per il nuovo anno.' },
  { id: 'formal-any-2', tone: 'formal', relationship: 'any', text: 'Gentile {name}, tanti auguri di buon compleanno. Le auguro un anno ricco di soddisfazioni personali e professionali.' },
  { id: 'formal-any-3', tone: 'formal', relationship: 'any', text: 'Gentile {name}, i migliori auguri di buon compleanno da parte mia. Con stima.' },
  { id: 'formal-collega-1', tone: 'formal', relationship: 'collega', text: 'Buon compleanno, {name}! Grazie per la collaborazione e per l’impegno di ogni giorno. Tanti auguri di cuore.' },
  { id: 'formal-collega-2', tone: 'formal', relationship: 'collega', text: 'Tanti auguri {name}! Ti auguro un anno di nuovi traguardi e grandi soddisfazioni, al lavoro e fuori.' },
  { id: 'short-any-1', tone: 'short', relationship: 'any', text: 'Buon compleanno, {name}! ' },
  { id: 'short-any-2', tone: 'short', relationship: 'any', text: 'Auguri {name}! ' },
  { id: 'short-any-3', tone: 'short', relationship: 'any', text: 'Tanti auguri, {name}! Goditi la giornata.' },
  { id: 'short-any-4', tone: 'short', relationship: 'any', text: 'Buon compleanno {name}, un abbraccio!' },
  { id: 'short-any-5', tone: 'short', relationship: 'any', text: 'Auguri di cuore, {name}! ' },
  { id: 'short-any-6', tone: 'short', relationship: 'any', needsAge: true, text: '{age} anni! Auguri, {name}! ' },
  { id: 'warm-collega-1', tone: 'warm', relationship: 'collega', text: 'Buon compleanno, {name}! Grazie per la collaborazione e per l’energia positiva che porti ogni giorno. Ti auguro un anno bellissimo!' },
  { id: 'warm-collega-2', tone: 'warm', relationship: 'collega', text: 'Auguri {name}! È un piacere lavorare con te. Che questo nuovo anno ti porti soddisfazioni e tanti momenti sereni.' },
];

const en: GreetingTemplate[] = [
  { id: 'warm-any-1', tone: 'warm', relationship: 'any', text: 'Happy birthday, {name}! Wishing you a year full of good things, big smiles, and the people who love you. ' },
  { id: 'warm-any-2', tone: 'warm', relationship: 'any', text: 'Happy birthday {name}! May this year bring you peace, health, and everything you wish for. Enjoy your day!' },
  { id: 'warm-any-3', tone: 'warm', relationship: 'any', text: 'Many happy returns, {name}! I hope today treats you exactly the way you deserve.' },
  { id: 'warm-any-4', tone: 'warm', relationship: 'any', text: 'Happy birthday, {name}! A special thought for you on your special day. Have a wonderful year.' },
  { id: 'warm-any-5', tone: 'warm', relationship: 'any', needsAge: true, text: '{age} and getting better every year! Happy birthday, {name}, all the best.' },
  { id: 'warm-any-6', tone: 'warm', relationship: 'any', needsAge: true, text: 'Turning {age}! Happy birthday {name}, may this be your best year yet.' },
  { id: 'warm-amico-1', tone: 'warm', relationship: 'amico', text: 'Happy birthday, {name}! Thanks for always being there. Wishing you a year full of adventures and laughter.' },
  { id: 'warm-amico-2', tone: 'warm', relationship: 'amico', text: 'Happy birthday {name}! As soon as you can, we’re celebrating properly. I owe you at least one drink. ' },
  { id: 'warm-famiglia-1', tone: 'warm', relationship: 'famiglia', text: 'Happy birthday {name}! I love you so much. I hope today is sweet and full of love.' },
  { id: 'warm-famiglia-2', tone: 'warm', relationship: 'famiglia', text: 'Happy birthday, {name}! Our family is better with you in it. Big hug!' },
  { id: 'warm-famiglia-3', tone: 'warm', relationship: 'famiglia', text: 'Happy birthday {name}! Thank you for everything you do and for always being there. Love you.' },
  { id: 'funny-any-1', tone: 'funny', relationship: 'any', text: 'Happy birthday {name}! Another year older, but don’t worry: wine gets better with age. ' },
  { id: 'funny-any-2', tone: 'funny', relationship: 'any', text: 'You’re not getting older, {name}, you’re maturing like good cheese. Happy birthday! ' },
  { id: 'funny-any-3', tone: 'funny', relationship: 'any', text: 'Happy birthday {name}! Today you can eat cake without guilt. It’s the law (I just wrote it). ' },
  { id: 'funny-any-4', tone: 'funny', relationship: 'any', needsAge: true, text: 'Happy birthday {name}! At {age}, the candles cost more than the cake. Blow carefully! ' },
  { id: 'funny-any-5', tone: 'funny', relationship: 'any', text: 'Happy birthday {name}! Wishing you a year with fewer emails and more pizza. ' },
  { id: 'funny-any-6', tone: 'funny', relationship: 'any', text: 'Happy birthday {name}! One more year of experience, zero more of maturity. Never change! ' },
  { id: 'funny-any-7', tone: 'funny', relationship: 'any', needsAge: true, text: '{age} and still going strong! Well, mostly. Happy birthday, {name}! ' },
  { id: 'funny-amico-1', tone: 'funny', relationship: 'amico', text: 'Happy birthday {name}! You’re officially a year wiser, but tonight we’ll act like it isn’t true. ' },
  { id: 'funny-amico-2', tone: 'funny', relationship: 'amico', text: 'Happy birthday {name}! We celebrate today and pretend nothing happened tomorrow. See you for the toast! ' },
  { id: 'funny-amico-3', tone: 'funny', relationship: 'amico', text: 'Hey {name}, another trip around the sun and you’re still my favorite excuse to party. Happy birthday! ' },
  { id: 'funny-famiglia-1', tone: 'funny', relationship: 'famiglia', text: 'Happy birthday {name}! Another year as a family and we still put up with each other: we’re doing great. ' },
  { id: 'funny-famiglia-2', tone: 'funny', relationship: 'famiglia', text: 'Happy birthday {name}! Today you’re in charge: you pick the cake and you pick the music. For today only! ' },
  { id: 'funny-collega-1', tone: 'funny', relationship: 'collega', text: 'Happy birthday {name}! No meetings on your calendar today… at least in my wishes. ' },
  { id: 'funny-collega-2', tone: 'funny', relationship: 'collega', text: 'Happy birthday {name}! May your year be like a good office coffee: hot, strong, and never gone too soon. ' },
  { id: 'formal-any-1', tone: 'formal', relationship: 'any', text: 'Happy birthday, {name}. Please accept my best wishes for health, happiness, and success in the year ahead.' },
  { id: 'formal-any-2', tone: 'formal', relationship: 'any', text: 'Dear {name}, warmest birthday wishes. May the coming year bring you many personal and professional rewards.' },
  { id: 'formal-any-3', tone: 'formal', relationship: 'any', text: 'Dear {name}, my best wishes on your birthday. With kind regards.' },
  { id: 'formal-collega-1', tone: 'formal', relationship: 'collega', text: 'Happy birthday, {name}! Thank you for your collaboration and hard work every day. Best wishes.' },
  { id: 'formal-collega-2', tone: 'formal', relationship: 'collega', text: 'Happy birthday {name}! Wishing you a year of new milestones and great achievements, at work and beyond.' },
  { id: 'short-any-1', tone: 'short', relationship: 'any', text: 'Happy birthday, {name}! ' },
  { id: 'short-any-2', tone: 'short', relationship: 'any', text: 'Happy birthday {name}! ' },
  { id: 'short-any-3', tone: 'short', relationship: 'any', text: 'Happy birthday, {name}! Enjoy your day.' },
  { id: 'short-any-4', tone: 'short', relationship: 'any', text: 'Happy birthday {name}, big hug!' },
  { id: 'short-any-5', tone: 'short', relationship: 'any', text: 'Best wishes, {name}! ' },
  { id: 'short-any-6', tone: 'short', relationship: 'any', needsAge: true, text: '{age} today! Happy birthday, {name}! ' },
  { id: 'warm-collega-1', tone: 'warm', relationship: 'collega', text: 'Happy birthday, {name}! Thank you for your teamwork and the positive energy you bring every day. Wishing you a wonderful year!' },
  { id: 'warm-collega-2', tone: 'warm', relationship: 'collega', text: 'Happy birthday {name}! It’s a pleasure working with you. May this new year bring you great moments and plenty of calm ones.' },
];

export const GREETING_TEMPLATES: Record<GreetingLocale, GreetingTemplate[]> = { it, en };

export function greetingTemplates(
  locale: GreetingLocale,
  relationship: GreetingRelationship,
  tone: GreetingTone,
  age?: number,
): GreetingTemplate[] {
  return GREETING_TEMPLATES[locale].filter(
    (template) =>
      template.tone === tone &&
      (template.relationship === 'any' || template.relationship === relationship) &&
      (!template.needsAge || age !== undefined),
  );
}

export function renderGreeting(template: GreetingTemplate, name: string, age?: number): string {
  return template.text.replaceAll('{name}', name.trim().split(/\s+/)[0] ?? name).replaceAll('{age}', age === undefined ? '' : String(age));
}

export function removeRecipientName(message: string, name: string): string {
  const firstName = name.trim().split(/\s+/)[0];
  if (!firstName) return message.trim();
  const escapedName = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const salutation = new RegExp(`^(?:(?:gentile|dear|caro|cara|hey|hi|ehi)\\s+)?${escapedName}\\s*,\\s*`, 'iu');
  const formalSalutation = new RegExp(`^(?:gentile|dear)\\s+${escapedName}\\s*,\\s*`, 'iu');
  let result = message.replace(formalSalutation, '').replace(salutation, '');

  result = result.replace(new RegExp(`(?:,\\s*|\\s+)${escapedName}(?=\\s*[,!?.]|$)`, 'giu'), '');
  result = result
    .replace(/,\s*([!?])/g, '$1')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return result.replace(/^(\p{Ll})/u, (letter) => letter.toLocaleUpperCase());
}

export interface FitOptions {
  width: number;
  height: number;
  minFontSize: number;
  maxFontSize: number;
  lineHeightRatio?: number;
}

export interface TextFit {
  fontSize: number;
  fits: boolean;
}

export function estimateLines(text: string, width: number, fontSize: number): number {
  const maxChars = Math.max(1, Math.floor(width / (fontSize * 0.52)));
  let lines = 1;
  let lineLength = 0;
  for (const word of text.split(/\s+/)) {
    const wordLength = [...word].length;
    if (lineLength && lineLength + 1 + wordLength > maxChars) {
      lines += 1;
      lineLength = wordLength;
    } else {
      lineLength += (lineLength ? 1 : 0) + wordLength;
    }
  }
  return lines;
}

export function fitGreeting(text: string, options: FitOptions): TextFit {
  const lineHeightRatio = options.lineHeightRatio ?? 1.45;
  for (let fontSize = options.maxFontSize; fontSize >= options.minFontSize; fontSize -= 1) {
    if (estimateLines(text, options.width, fontSize) * fontSize * lineHeightRatio <= options.height) {
      return { fontSize, fits: true };
    }
  }
  return { fontSize: options.minFontSize, fits: false };
}