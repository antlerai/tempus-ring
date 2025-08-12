/**
 * 国际化配置和管理
 * Internationalization configuration and management
 */

export interface TranslationKeys {
  timer: {
    start: string;
    pause: string;
    reset: string;
    duration: string;
    completed: string;
  };
  themes: {
    'cloudlight-minimal': string;
    nightfall: string;
    'hand-drawn-sketch': string;
    'artistic-sketch': string;
    'wabi-sabi': string;
    'dawn-and-dusk': string;
  };
  settings: {
    language: string;
    theme: string;
    notifications: string;
    duration: string;
  };
  common: {
    minutes: string;
    seconds: string;
    hours: string;
  };
}

export type SupportedLanguage = 'en' | 'zh_cn' | 'ja' | 'zh_tw';

class I18nManager {
  private currentLanguage: SupportedLanguage = 'en';
  private translations: Map<SupportedLanguage, TranslationKeys> = new Map();
  private fallbackLanguage: SupportedLanguage = 'en';

  /**
   * 初始化国际化管理器
   * Initialize the i18n manager
   */
  async init(): Promise<void> {
    // 检测浏览器语言
    const browserLang = this.detectBrowserLanguage();
    await this.loadLanguage(browserLang);
  }

  /**
   * 检测浏览器语言
   * Detect browser language
   */
  private detectBrowserLanguage(): SupportedLanguage {
    const lang = navigator.language.split('-')[0] as SupportedLanguage;
    const supportedLanguages: SupportedLanguage[] = ['en', 'zh_cn', 'ja', 'zh_tw'];
    return supportedLanguages.includes(lang) ? lang : 'en';
  }

  /**
   * 加载指定语言包
   * Load specified language pack
   * @param language - 语言代码 (Language code)
   */
  async loadLanguage(language: SupportedLanguage): Promise<void> {
    if (this.translations.has(language)) {
      this.currentLanguage = language;
      return;
    }

    try {
      const response = await fetch(`/src/i18n/locales/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language: ${language}`);
      }

      const translations = (await response.json()) as TranslationKeys;
      this.translations.set(language, translations);
      this.currentLanguage = language;
    } catch (_error) {
      console.warn(`Failed to load language ${language}, falling back to ${this.fallbackLanguage}`);
      if (language !== this.fallbackLanguage) {
        await this.loadLanguage(this.fallbackLanguage);
      }
    }
  }

  /**
   * 获取翻译文本
   * Get translated text
   * @param key - 翻译键 (Translation key)
   * @param params - 插值参数 (Interpolation parameters)
   */
  t(key: string, params?: Record<string, string | number>): string {
    const translations = this.translations.get(this.currentLanguage);
    if (!translations) {
      return key;
    }

    // 支持嵌套键访问 (Support nested key access)
    const value = this.getNestedValue(translations, key);
    if (typeof value !== 'string') {
      return key;
    }

    // 插值处理 (Interpolation handling)
    if (params) {
      return this.interpolate(value, params);
    }

    return value;
  }

  /**
   * 获取嵌套对象值
   * Get nested object value
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * 字符串插值
   * String interpolation
   */
  private interpolate(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  /**
   * 切换语言
   * Switch language
   */
  async switchLanguage(language: SupportedLanguage): Promise<void> {
    await this.loadLanguage(language);
    // 触发语言切换事件
    document.dispatchEvent(
      new CustomEvent('languageChanged', {
        detail: { language },
      })
    );
  }

  /**
   * 获取当前语言
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * 获取支持的语言列表
   * Get supported languages list
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return ['en', 'zh_cn', 'ja', 'zh_tw'];
  }
}

// 单例实例
export const i18n = new I18nManager();

// 便捷函数
export const t = (key: string, params?: Record<string, string | number>) => i18n.t(key, params);
