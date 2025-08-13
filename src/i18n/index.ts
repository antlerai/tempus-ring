type LocaleData = Record<string, unknown>;

interface I18nConfig {
  defaultLocale: string;
  fallbackLocale: string;
  storageKey: string;
}

class I18n {
  private locales: Map<string, LocaleData> = new Map();
  private currentLocale = 'en';
  private config: I18nConfig = {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    storageKey: 'tempus-ring-locale',
  };

  async init(config?: Partial<I18nConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Load all locale files
    await this.loadLocales();

    // Detect and set initial locale
    this.currentLocale = this.detectLocale();

    // Save to storage
    this.saveLocaleToStorage(this.currentLocale);
  }

  private async loadLocales(): Promise<void> {
    const localeModules = {
      en: () => import('./locales/en.json'),
      'zh-CN': () => import('./locales/zh-CN.json'),
      'zh-TW': () => import('./locales/zh-TW.json'),
      ja: () => import('./locales/ja.json'),
    };

    for (const [locale, importFn] of Object.entries(localeModules)) {
      try {
        const module = await importFn();
        this.locales.set(locale, module.default || module);
      } catch (error) {
        console.warn(`Failed to load locale ${locale}:`, error);
      }
    }
  }

  private detectLocale(): string {
    // 1. Check storage first
    const stored = this.getLocaleFromStorage();
    if (stored && this.locales.has(stored)) {
      return stored;
    }

    // 2. Check browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language;

      // Exact match
      if (this.locales.has(browserLang)) {
        return browserLang;
      }

      // Language-only match (e.g., 'zh' -> 'zh-CN')
      const langCode = browserLang.split('-')[0];
      if (langCode) {
        const availableLocales = Array.from(this.locales.keys());
        const matchedLocale = availableLocales.find((locale) => locale.startsWith(langCode));

        if (matchedLocale) {
          return matchedLocale;
        }
      }
    }

    // 3. Fall back to default
    return this.config.defaultLocale;
  }

  private getLocaleFromStorage(): string | null {
    try {
      return localStorage.getItem(this.config.storageKey);
    } catch {
      return null;
    }
  }

  private saveLocaleToStorage(locale: string): void {
    try {
      localStorage.setItem(this.config.storageKey, locale);
    } catch (error) {
      console.warn('Failed to save locale to storage:', error);
    }
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  getAvailableLocales(): string[] {
    return Array.from(this.locales.keys());
  }

  async switchLocale(locale: string): Promise<boolean> {
    if (!this.locales.has(locale)) {
      console.warn(`Locale ${locale} is not available`);
      return false;
    }

    const oldLocale = this.currentLocale;
    this.currentLocale = locale;
    this.saveLocaleToStorage(locale);

    // Emit locale change event
    this.emitLocaleChange(oldLocale, locale);

    return true;
  }

  private emitLocaleChange(oldLocale: string, newLocale: string): void {
    const event = new CustomEvent('localeChange', {
      detail: { oldLocale, newLocale },
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    const value = this.getValue(key, this.currentLocale);

    if (typeof value === 'string') {
      return this.interpolate(value, params);
    }

    // Fallback to fallback locale
    if (this.currentLocale !== this.config.fallbackLocale) {
      const fallbackValue = this.getValue(key, this.config.fallbackLocale);
      if (typeof fallbackValue === 'string') {
        return this.interpolate(fallbackValue, params);
      }
    }

    // Return key as last resort
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }

  private getValue(key: string, locale: string): unknown {
    const localeData = this.locales.get(locale);
    if (!localeData) {
      return undefined;
    }

    const keys = key.split('.');
    let value: unknown = localeData;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) {
      return text;
    }

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  // Utility methods for common translations
  formatTime(minutes: number, seconds: number): string {
    if (minutes > 0 && seconds > 0) {
      return this.t('timer.timeFormat.minutesSeconds', {
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    } else if (minutes > 0) {
      return this.t('timer.timeFormat.minutes', { count: minutes });
    } else {
      return this.t('timer.timeFormat.seconds', { count: seconds });
    }
  }

  formatSessionCount(count: number): string {
    return count === 1
      ? `${count} ${this.t('timer.session')}`
      : `${count} ${this.t('timer.sessions')}`;
  }

  getLocaleName(locale: string): string {
    return this.t(`languages.${locale}`) || locale;
  }

  getThemeName(themeKey: string): string {
    return this.t(`themes.${themeKey}`) || themeKey;
  }
}

// Create singleton instance
export const i18n = new I18n();

// Export translation function for convenience
export const t = (key: string, params?: Record<string, string | number>) => i18n.t(key, params);

// Export types for external use
export type { I18nConfig };

// Default export
export default i18n;
