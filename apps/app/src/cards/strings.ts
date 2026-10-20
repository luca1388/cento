import type { GreetingLocale } from '@cento/core';

export const CARD_LABELS: Record<GreetingLocale, { birthday: string; manyWishes: string; cheers: string; years: string }> = {
  it: { birthday: 'Buon compleanno', manyWishes: 'Tantissimi auguri', cheers: 'Auguri', years: 'anni' },
  en: { birthday: 'Happy birthday', manyWishes: 'Best wishes', cheers: 'Hooray', years: 'years' },
};