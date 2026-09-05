"use client";

import { useEffect } from "react";
import { useLearning } from "./learning-provider";

/** Applies persistent accessibility and future localization preferences globally. */
export function WorkspacePreferencesController() {
  const { data } = useLearning();
  const preferences = data.workspacePreferences;

  useEffect(() => {
    const documentRoot = document.documentElement;
    documentRoot.lang = preferences.interfaceLanguage;
    documentRoot.dir = preferences.interfaceLanguage === "ar" ? "rtl" : "ltr";
    documentRoot.dataset.textScale = preferences.textScale;
    documentRoot.dataset.highContrast = String(preferences.highContrast);
    documentRoot.dataset.reduceMotion = String(preferences.reduceMotion);
  }, [
    preferences.highContrast,
    preferences.interfaceLanguage,
    preferences.reduceMotion,
    preferences.textScale,
  ]);

  return null;
}
