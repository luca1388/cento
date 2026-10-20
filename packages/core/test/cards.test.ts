import { describe, expect, it } from 'vitest';
import {
  GREETING_TEMPLATES,
  estimateLines,
  fitGreeting,
  greetingTemplates,
  removeRecipientName,
  renderGreeting,
} from '../src/cards';

describe('greeting templates', () => {
  it('keeps the available template IDs parallel and omits gender-dependent pairs', () => {
    const italianIds = GREETING_TEMPLATES.it.map((template) => template.id).sort();
    const englishIds = GREETING_TEMPLATES.en.map((template) => template.id).sort();

    expect(italianIds).toEqual(englishIds);
    expect(italianIds).not.toContain('warm-any-7');
    expect(italianIds).not.toContain('warm-amico-3');
    expect(italianIds).not.toContain('warm-famiglia-4');
    expect(italianIds).toHaveLength(38);
    expect(JSON.stringify(GREETING_TEMPLATES)).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('filters by tone, relationship, and known age', () => {
    const noAge = greetingTemplates('it', 'amico', 'warm');
    const withAge = greetingTemplates('it', 'amico', 'warm', 42);

    expect(noAge.every((template) => !template.needsAge)).toBe(true);
    expect(withAge.length).toBeGreaterThan(noAge.length);
    expect(withAge.every((template) => template.tone === 'warm')).toBe(true);
    expect(withAge.every((template) => template.relationship === 'any' || template.relationship === 'amico')).toBe(true);
  });

  it('renders first name and age placeholders', () => {
    const template = GREETING_TEMPLATES.it.find((item) => item.id === 'warm-any-5')!;
    expect(renderGreeting(template, 'Marta Rossi', 34)).toContain('34 anni');
    expect(renderGreeting(template, 'Marta Rossi', 34)).toContain('Marta');
    expect(renderGreeting(template, 'Marta Rossi', 34)).not.toContain('Rossi');
  });

  it('removes the recipient name and greeting from card copy without damaging the sentence', () => {
    expect(removeRecipientName('Non stai invecchiando, Simone, stai maturando. Auguri, Simone!', 'Simone Rossi')).toBe(
      'Non stai invecchiando, stai maturando. Auguri!',
    );
    expect(removeRecipientName('Buon compleanno, Marta! Ti auguro una bella giornata.', 'Marta Rossi')).toBe(
      'Buon compleanno! Ti auguro una bella giornata.',
    );
    expect(removeRecipientName('Gentile Luca, i migliori auguri.', 'Luca Verdi')).toBe('I migliori auguri.');
  });
});

describe('card text utilities', () => {
  it('estimates wrapped lines and reports when text cannot fit', () => {
    expect(estimateLines('one two three four', 80, 10)).toBeGreaterThan(1);
    expect(fitGreeting('Short message', { width: 276, height: 66, minFontSize: 11, maxFontSize: 15 }).fits).toBe(true);
    expect(fitGreeting('A '.repeat(100), { width: 80, height: 10, minFontSize: 11, maxFontSize: 15 }).fits).toBe(false);
  });
});