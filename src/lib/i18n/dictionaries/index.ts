import { id } from "./id";
import { en } from "./en";
import { SupportedLocale, TranslationDictionary } from "../types";

export const dictionaries: Record<SupportedLocale, TranslationDictionary> = {
  id,
  en,
  ja: {}, // Ready for Japanese
  zh: {}, // Ready for Chinese
  ko: {}, // Ready for Korean
  es: {}, // Ready for Spanish
  fr: {}, // Ready for French
};

export { id, en };
