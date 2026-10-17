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

    const value: unknown = this.lookupKey(dictionary, key);

    if (value === undefined || typeof value !== 'string') {
      // Fallback to English if translation is missing in selected language
      if (lang !== 'en') {
        const fallbackValue = this.lookupKey(translations['en'], key);
        if (typeof fallbackValue === 'string') {
          return this.interpolate(fallbackValue, params);
        }
      }
      return key;
    }

    return this.interpolate(value, params);
  }

  private lookupKey(dict: Record<string, unknown>, key: string): unknown {
    if (!dict) {
      return undefined;
    }

    // Direct key lookup (flat json)
    if (key in dict) {
      return dict[key];
    }

    // Nested key traversal (nested json)
    let current: unknown = dict;
    const keys = key.split('.');

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }

    return current;
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
