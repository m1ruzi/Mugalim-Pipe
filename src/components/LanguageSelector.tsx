import React from 'react';
import { Globe } from 'lucide-react';
import { languageService, type SupportedLanguage } from '../services/LanguageService';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  const languages = languageService.getAvailableLanguages();

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100/50 backdrop-blur-sm border border-gray-200 hover:bg-gray-200 transition-all duration-300">
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-500 text-gray-700">
          {languages.find(lang => lang.code === currentLanguage)?.nativeName}
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 bg-apple-gray-50 rounded-2xl shadow-lg border border-apple-gray-200 py-2 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={`w-full text-left px-4 py-2.5 text-sm font-500 transition-all ${
              currentLanguage === language.code 
                ? 'text-carmine-600 bg-carmine-50' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {language.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;