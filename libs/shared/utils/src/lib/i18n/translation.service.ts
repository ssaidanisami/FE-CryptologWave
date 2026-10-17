import { Injectable, signal } from '@angular/core';
import { Language, translations } from './translations';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly currentLanguageSignal = signal<Language>('en');

  readonly currentLanguage = this.currentLanguageSignal.asReadonly();

  setLanguage(lang: Language): void {
    if (this.currentLanguageSignal() !== lang) {
      this.currentLanguageSignal.set(lang);
    }
  }

  getLanguage(): Language {
    return this.currentLanguageSignal();
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLanguageSignal();
    const dictionary = translations[lang] || translations['en'];

    let value: unknown = dictionary;
    const keys = key.split('.');

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    if (value === undefined || typeof value !== 'string') {
      // Fallback to English if translation is missing in selected language
      if (lang !== 'en') {
        let fallbackValue: unknown = translations['en'];
        for (const k of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
            fallbackValue = (fallbackValue as Record<string, unknown>)[k];
          } else {
            fallbackValue = undefined;
            break;
          }
        }
        if (typeof fallbackValue === 'string') {
          return this.interpolate(fallbackValue, params);
        }
      }
      return key;
    }

    return this.interpolate(value, params);
  }

  private interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) {
      return text;
    }
    return Object.keys(params).reduce((result, paramKey) => {
      const regex = new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g');
      return result.replace(regex, String(params[paramKey]));
    }, text);
  }
}
