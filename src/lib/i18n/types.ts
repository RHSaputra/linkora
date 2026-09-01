export type SupportedLocale = "id" | "en" | "ja" | "zh" | "ko" | "es" | "fr";

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  isRtl?: boolean;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: "🇮🇩",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
];

export const DEFAULT_LOCALE: SupportedLocale = "id";
export const FALLBACK_LOCALE: SupportedLocale = "id";

// Deep nested dictionary type
export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};
