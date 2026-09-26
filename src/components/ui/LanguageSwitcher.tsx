import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-slate-900/90 transition-colors shadow-sm"
    >
      {language === 'en' ? 'EN' : 'HI'}
    </button>
  );
};