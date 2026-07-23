"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { content, shared } from "@/lib/content";

const LanguageContext = createContext(null);
const STORAGE_KEY = "sasha-lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  // Restore the visitor's choice, otherwise guess from the browser once.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") {
      setLang(stored);
      return;
    }
    if (navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === "en" ? "fr" : "en")), []);

  const value = useMemo(
    () => ({ lang, setLang, toggle, t: content[lang], shared }),
    [lang, toggle]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}
