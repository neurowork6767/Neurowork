"use client";

import * as React from "react";

export type FontScale = "md" | "lg" | "xl";

export type AccessibilitySettings = {
  highContrast: boolean;
  fontScale: FontScale;
  simplified: boolean;
};

type AccessibilityContextValue = AccessibilitySettings & {
  update: (changes: Partial<AccessibilitySettings>) => void;
  reset: () => void;
};

export const ACCESSIBILITY_STORAGE_KEY = "neurowork:acessibilidade";

const DEFAULT_SETTINGS: AccessibilitySettings = { highContrast: false, fontScale: "md", simplified: false };

const AccessibilityContext = React.createContext<AccessibilityContextValue | null>(null);

function applyToDocument(settings: AccessibilitySettings) {
  const html = document.documentElement;
  html.dataset.contrast = settings.highContrast ? "high" : "normal";
  html.dataset.font = settings.fontScale;
  html.dataset.simplified = String(settings.simplified);
}

/**
 * Guarda as preferências de acessibilidade (FE02) e as aplica como atributos no <html>.
 * A escolha fica salva no navegador e vale para todas as páginas.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(saved) as Partial<AccessibilitySettings>) });
    } catch {
      // preferências corrompidas: mantém o padrão
    }
  }, []);

  const update = React.useCallback((changes: Partial<AccessibilitySettings>) => {
    setSettings((current) => {
      const next = { ...current, ...changes };
      applyToDocument(next);
      try {
        window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // armazenamento indisponível (ex.: modo privado): a escolha vale só nesta página
      }
      return next;
    });
  }, []);

  const reset = React.useCallback(() => update(DEFAULT_SETTINGS), [update]);

  const value = React.useMemo(() => ({ ...settings, update, reset }), [settings, update, reset]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility deve ser usado dentro de AccessibilityProvider");
  return context;
}

/**
 * Script executado antes da página aparecer, para aplicar as preferências salvas
 * sem "piscar" a tela no modo padrão.
 */
export const accessibilityInitScript = `(function(){try{var s=JSON.parse(localStorage.getItem('${ACCESSIBILITY_STORAGE_KEY}')||'{}');var h=document.documentElement;h.dataset.contrast=s.highContrast?'high':'normal';h.dataset.font=s.fontScale||'md';h.dataset.simplified=String(!!s.simplified);}catch(e){}})();`;
