import it from './locales/it.json';

/** Italian is the source catalog: key types come from it, so a misspelled key fails type-checking. */
type RawKey = keyof typeof it;
/** Strips i18next plural suffixes so callers use the base key (`event.turns`). */
type BaseKey<K> = K extends `${infer B}_one` ? B : K extends `${infer B}_other` ? B : K;
export type TranslationKey = BaseKey<RawKey>;
