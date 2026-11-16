import { useTranslation } from '../i18n/provider';

export default function LanguageSwitcher() {
  const { locale, onLocaleChange } = useTranslation();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onLocaleChange('en')}
        aria-label="Switch to English"
        aria-pressed={locale === 'en'}
        className={`px-2 py-1 rounded ${
          locale === 'en' ? 'bg-blue-500 text-white' : 'opacity-60'
        }`}
      >
        🇺🇸
      </button>
      <button
        type="button"
        onClick={() => onLocaleChange('pt-BR')}
        aria-label="Mudar para português"
        aria-pressed={locale === 'pt-BR'}
        className={`px-2 py-1 rounded ${
          locale === 'pt-BR' ? 'bg-blue-500 text-white' : 'opacity-60'
        }`}
      >
        🇧🇷
      </button>
    </div>
  );
}
