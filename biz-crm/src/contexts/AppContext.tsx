import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Language, type TranslationKeys } from '@/i18n/translations';

type Theme = 'light' | 'dark' | 'system';

interface AppContextType {
  // Language - fixed to UZ only
  language: Language;
  t: TranslationKeys;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark'; // actual applied theme
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const THEME_KEY = 'eduflow_theme';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  return resolved;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Language is fixed to UZ - no longer configurable
  const language: Language = 'UZ';

  // Clean up old language preference from localStorage
  useEffect(() => {
    localStorage.removeItem('eduflow_lang');
  }, []);

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const saved = (localStorage.getItem(THEME_KEY) as Theme) || 'light';
    return saved === 'system' ? getSystemTheme() : (saved as 'light' | 'dark');
  });

  // Apply theme on mount and change
  useEffect(() => {
    const resolved = applyTheme(theme);
    setResolvedTheme(resolved);
  }, [theme]);

  // Listen for system theme changes (when theme === 'system')
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = applyTheme('system');
      setResolvedTheme(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  }, []);

  const t = translations[language] as unknown as TranslationKeys;

  return (
    <AppContext.Provider value={{ language, t, theme, setTheme, resolvedTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
