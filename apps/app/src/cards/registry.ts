import type { GreetingTone } from '@cento/core';
import { alba } from './designs/Alba';
import { blocchiBlu } from './designs/BlocchiBlu';
import { candelina } from './designs/Candelina';
import { cartaInchiostro } from './designs/CartaInchiostro';
import { coriandoli } from './designs/Coriandoli';
import { palloncini } from './designs/Palloncini';
import { tipografica } from './designs/Tipografica';
import { tortaPop } from './designs/TortaPop';
import type { CardDesign } from './types';

export const CARD_DESIGNS: CardDesign[] = [coriandoli, alba, palloncini, tortaPop, cartaInchiostro, blocchiBlu, tipografica, candelina];

export function designsForTone(tone: GreetingTone, age?: number): CardDesign[] {
  const available = CARD_DESIGNS.filter((design) => !design.needsAge || age !== undefined);
  return [...available.filter((design) => design.tones.includes(tone)), ...available.filter((design) => !design.tones.includes(tone))];
}