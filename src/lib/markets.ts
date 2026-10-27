/**
 * Markets and languages the product currently supports. Providers differ in
 * regional support, so adding a market here does not by itself guarantee that
 * every provider can localize results for it; adapters declare their own
 * geographic capabilities.
 */

export const LANGUAGES = {
  de: "German",
  en: "English",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export const COUNTRIES = {
  DE: { name: "Germany", defaultLanguages: ["de", "en"] },
  AT: { name: "Austria", defaultLanguages: ["de", "en"] },
  CH: { name: "Switzerland", defaultLanguages: ["de", "fr", "en"] },
  US: { name: "United States", defaultLanguages: ["en"] },
  GB: { name: "United Kingdom", defaultLanguages: ["en"] },
  IE: { name: "Ireland", defaultLanguages: ["en"] },
  FR: { name: "France", defaultLanguages: ["fr", "en"] },
  ES: { name: "Spain", defaultLanguages: ["es", "en"] },
  IT: { name: "Italy", defaultLanguages: ["it", "en"] },
  NL: { name: "Netherlands", defaultLanguages: ["nl", "en"] },
  IN: { name: "India", defaultLanguages: ["en"] },
  CA: { name: "Canada", defaultLanguages: ["en", "fr"] },
  AU: { name: "Australia", defaultLanguages: ["en"] },
} as const satisfies Record<string, { name: string; defaultLanguages: LanguageCode[] }>;

export type CountryCode = keyof typeof COUNTRIES;

export const COUNTRY_CODES = Object.keys(COUNTRIES) as [CountryCode, ...CountryCode[]];
export const LANGUAGE_CODES = Object.keys(LANGUAGES) as [LanguageCode, ...LanguageCode[]];
