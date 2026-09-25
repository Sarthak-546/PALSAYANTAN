import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageModal = () => {
  const { language, setLanguage, hasSelectedLanguage } = useLanguage();

  // Only render if user hasn't selected a language yet
  if (hasSelectedLanguage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold text-center tracking-wide">
          Select Language / भाषा चुनें
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-2">
          Choose your preferred language for voice and text guidance.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setLanguage('en')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-base"
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-4 rounded-xl border border-slate-300 dark:border-slate-600 transition-all text-base"
          >
            हिंदी (Hindi)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;