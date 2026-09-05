import type { InterfaceLanguage } from "./types";

/**
 * UI locale metadata stays deliberately separate from a learner's target
 * language. Add a complete message catalog before marking a locale available.
 */
export const INTERFACE_LOCALES: Array<{
  id: InterfaceLanguage;
  label: string;
  direction: "ltr" | "rtl";
  available: boolean;
}> = [
  { id: "en", label: "English", direction: "ltr", available: true },
  { id: "ar", label: "العربية", direction: "rtl", available: false },
];

export const en = {
  interfaceLanguage: "Interface language",
  translationFoundation: "Translation-ready foundation",
  studyLanguageSeparate: "This never changes the language you study.",
} as const;

export type InterfaceCopyKey = keyof typeof en;

/** English is the safe fallback until a locale has a complete catalog. */
export function uiCopy(_locale: InterfaceLanguage, key: InterfaceCopyKey): string {
  return en[key];
}
