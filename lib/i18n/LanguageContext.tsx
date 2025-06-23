'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

type Language = 'fr' | 'en';
type Translations = typeof translations;
type Section = keyof Translations['fr'];
type Key<S extends Section> = keyof Translations['fr'][S];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <S extends Section, K extends Key<S>>(section: S, key: K) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      return (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) 
        ? savedLanguage 
        : 'fr';
    }
    return 'fr';
  });

  // Sauvegarder la langue dans localStorage quand elle change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = <S extends Section, K extends Key<S>>(section: S, key: K): string => {
    try {
      return translations[language][section][key] as string;
    } catch (error) {
      console.error(`Traduction manquante : ${section}.${String(key)}`);
      return `${section}.${String(key)}`;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 