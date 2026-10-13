import { foldName, namesOn, suggestNameDay } from '../src';

describe('name days', () => {
  it('folds accents and case', () => {
    expect(foldName('  Nicolò ')).toBe('nicolo');
    expect(foldName('GIULIA')).toBe('giulia');
  });

  it('suggests a single date for simple names', () => {
    const s = suggestNameDay('Giulia');
    expect(s?.suggested).toEqual({ month: 5, day: 22 });
    expect(s?.candidates).toHaveLength(1);
  });

  it('prefers the most common date for names with several', () => {
    const s = suggestNameDay('Antonio');
    expect(s?.suggested).toEqual({ month: 6, day: 13 });
    expect(s?.candidates.length).toBeGreaterThan(1);
    expect(suggestNameDay('Giovanni')?.suggested).toEqual({ month: 6, day: 24 });
  });

  it('falls back to the first word of a compound first name', () => {
    expect(suggestNameDay('Anna Chiara')?.suggested).toEqual({ month: 7, day: 26 });
  });

  it('returns null for unknown names and lists names on a date', () => {
    expect(suggestNameDay('Xyz')).toBeNull();
    expect(suggestNameDay('')).toBeNull();
    expect(namesOn({ month: 12, day: 13 })).toContain('Lucia');
  });
});
