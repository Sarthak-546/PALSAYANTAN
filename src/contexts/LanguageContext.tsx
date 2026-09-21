import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  hasSelectedLanguage: boolean;
  setHasSelectedLanguage: (val: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<'en' | 'hi'>('en');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_lang');
    if (saved === 'en' || saved === 'hi') {
      setLang(saved);
      setHasSelectedLanguage(true);
    }
  }, []);

  const setLanguage = (lang: 'en' | 'hi') => {
    setLang(lang);
    setHasSelectedLanguage(true);
    localStorage.setItem('app_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, hasSelectedLanguage, setHasSelectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
