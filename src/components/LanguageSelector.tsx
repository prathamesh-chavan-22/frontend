import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ disabled = false }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', flag: '🇮🇳' }
  ];

  const setLanguage = async (languageCode: string) => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/set_language', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ language: languageCode })
      });

      if (response.ok) {
        setSelectedLanguage(languageCode);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error setting language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentLanguage = languages.find(l => l.code === selectedLanguage);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setShowDropdown(!showDropdown)}
        disabled={disabled || isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
      >
        <Globe size={16} />
        <span className="text-sm">{currentLanguage?.flag}</span>
        <span className="text-sm hidden sm:inline">{currentLanguage?.name}</span>
        
        {isLoading && (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>

      {showDropdown && !disabled && !isLoading && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => setLanguage(language.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                  selectedLanguage === language.code 
                    ? 'bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{language.flag}</span>
                <span className="flex-1 text-left">{language.name}</span>
                {selectedLanguage === language.code && (
                  <Check size={14} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;