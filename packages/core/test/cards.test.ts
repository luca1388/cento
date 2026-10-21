import { describe, expect, it } from 'vitest';
import {
  GREETING_TEMPLATES,
  estimateLines,
  fitGreeting,
  greetingTemplates,
  prepareGreetingForCard,
  renderGreeting,
} from '../src/cards';

describe('greeting templates', () => {
  it('keeps template IDs parallel and includes the gender-dependent pairs for review', () => {
    const italianIds = GREETING_TEMPLATES.it.map((template) => template.id).sort();
    const englishIds = GREETING_TEMPLATES.en.map((template) => template.id).sort();

    expect(italianIds).toEqual(englishIds);
    expect(italianIds).toContain('warm-any-7');
    expect(italianIds).toContain('warm-amico-3');
    expect(italianIds).toContain('warm-famiglia-4');
    expect(italianIds).toHaveLength(41);
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

  it('prepares the current greeting templates without repeating the name or headline', () => {
    const greeting = GREETING_TEMPLATES.it.find((item) => item.id === 'warm-any-7')!;
    const friend = GREETING_TEMPLATES.it.find((item) => item.id === 'warm-amico-3')!;

    expect(renderGreeting(friend, 'Marta Rossi')).toContain('una persona veramente speciale');
    expect(prepareGreetingForCard(renderGreeting(greeting, 'Marta Rossi'), 'Marta Rossi', 'it')).toBe(
      'Ti auguro una giornata bellissima e un anno ancora più bello.',
    );
  });

  it('removes duplicate name and localized birthday headline from card copy', () => {
    expect(prepareGreetingForCard('Non stai invecchiando, Simone, stai maturando. Auguri, Simone!', 'Simone Rossi', 'it')).toBe(
      'Non stai invecchiando, stai maturando. Auguri!',
    );
    expect(prepareGreetingForCard('Buon compleanno, Marta! Ti auguro una bella giornata.', 'Marta Rossi', 'it')).toBe(
      'Ti auguro una bella giornata.',
    );
    expect(prepareGreetingForCard('Gentile Luca, i migliori auguri.', 'Luca Verdi', 'it')).toBe('I migliori auguri.');
    expect(prepareGreetingForCard('Happy birthday, Marta! Wishing you a lovely day.', 'Marta Rossi', 'en')).toBe(
      'Wishing you a lovely day.',
    );
    expect(prepareGreetingForCard('Happy birthday Marta! Enjoy your day.', 'Marta Rossi', 'en')).toBe('Enjoy your day.');
    expect(prepareGreetingForCard('Wishing you a happy birthday, Marta!', 'Marta Rossi', 'en')).toBe('Wishing you a happy birthday!');
  });

  it('uses a localized fallback when removing the name and headline would leave no message', () => {
    expect(prepareGreetingForCard('Buon compleanno, Marta! ', 'Marta Rossi', 'it')).toBe('Goditi la giornata.');
    expect(prepareGreetingForCard('Happy birthday, Marta! ', 'Marta Rossi', 'en')).toBe('Enjoy your day!');
  });
});

describe('card text utilities', () => {
  it('estimates wrapped lines and reports when text cannot fit', () => {
    expect(estimateLines('one two three four', 80, 10)).toBeGreaterThan(1);
    expect(fitGreeting('Short message', { width: 276, height: 66, minFontSize: 11, maxFontSize: 15 }).fits).toBe(true);
    expect(fitGreeting('A '.repeat(100), { width: 80, height: 10, minFontSize: 11, maxFontSize: 15 }).fits).toBe(false);
  });
});