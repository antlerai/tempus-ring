import '@/styles/theme-switcher.css';
import { i18n } from '../i18n';
// biome-ignore lint/style/useImportType: ThemeManager is used as constructor parameter
import { ThemeManager } from '../services/theme-manager';
import type { ThemeName } from '../types/theme-types';
import { IconManager } from '../utils/icons';

export interface ThemeSwitcherConfig {
  container: HTMLElement;
  themeManager: ThemeManager;
}

export class ThemeSwitcher {
  private container: HTMLElement;
  private themeManager: ThemeManager;
  private iconManager: IconManager;
  private button: HTMLButtonElement;
  private dropdown: HTMLElement;
  private isOpen = false;

  constructor(config: ThemeSwitcherConfig) {
    this.container = config.container;
    this.themeManager = config.themeManager;
    this.iconManager = IconManager.getInstance();

    this.button = this.createButton();
    this.dropdown = this.createDropdown();

    this.render();
    this.attachEventListeners();
    this.setupThemeEventListeners();

    // Listen for locale changes
    window.addEventListener('localeChange', () => {
      this.updateLabels();
    });
  }

  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className =
      'p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800';
    button.innerHTML = '<i data-lucide="palette" class="w-5 h-5"></i>';
    button.setAttribute('aria-label', i18n.t('theme.switch'));
    button.setAttribute('title', i18n.t('theme.switch'));
    return button;
  }

  private createDropdown(): HTMLElement {
    const dropdown = document.createElement('div');
    dropdown.className =
      'absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-48 hidden';

    const themes = this.themeManager.getAvailableThemes();
    const currentTheme = this.themeManager.getCurrentThemeName();

    for (const theme of themes) {
      const item = document.createElement('button');
      item.className = `w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3 ${
        theme.config.name === currentTheme
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300'
      }`;

      item.innerHTML = `
        <div class="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" style="background-color: ${theme.config.colors.accent}"></div>
        <span class="flex-1">${i18n.getThemeName(theme.config.name)}</span>
        ${theme.config.name === currentTheme ? '<i data-lucide="check" class="w-4 h-4 ml-auto"></i>' : ''}
      `;

      item.setAttribute('data-theme', theme.config.name);
      item.addEventListener('click', () => {
        this.switchTheme(theme.config.name as ThemeName);
      });

      dropdown.appendChild(item);
    }

    return dropdown;
  }

  private render(): void {
    // Preserve existing classes and add theme-switcher class
    const existingClasses = this.container.className;
    if (!existingClasses.includes('theme-switcher')) {
      this.container.className = `${existingClasses} theme-switcher`.trim();
    }

    this.container.innerHTML = '';
    this.container.appendChild(this.button);
    this.container.appendChild(this.dropdown);

    // Refresh icons after rendering
    setTimeout(() => {
      this.iconManager.refreshIcons();
    }, 10);
  }

  private attachEventListeners(): void {
    // Toggle dropdown on button click
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target as Node)) {
        this.closeDropdown();
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDropdown();
      }
    });
  }

  private setupThemeEventListeners(): void {
    this.themeManager.on('theme:changed', ({ to }) => {
      this.updateActiveTheme(to as ThemeName);
    });
  }

  private toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  private openDropdown(): void {
    this.dropdown.classList.remove('hidden');
    this.isOpen = true;
    this.button.setAttribute('aria-expanded', 'true');

    // Refresh icons after showing dropdown
    setTimeout(() => {
      this.iconManager.refreshIcons();
    }, 10);
  }

  private closeDropdown(): void {
    this.dropdown.classList.add('hidden');
    this.isOpen = false;
    this.button.setAttribute('aria-expanded', 'false');
  }

  private async switchTheme(themeName: ThemeName): Promise<void> {
    try {
      await this.themeManager.switchTheme(themeName);
      this.closeDropdown();
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  }

  private updateActiveTheme(themeName: ThemeName): void {
    const items = this.dropdown.querySelectorAll('button[data-theme]');

    for (const item of items) {
      const itemTheme = item.getAttribute('data-theme');
      const isActive = itemTheme === themeName;

      if (isActive) {
        item.className =
          'w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';

        // Add check icon if not present
        if (!item.querySelector('[data-lucide="check"]')) {
          const checkIcon = document.createElement('i');
          checkIcon.setAttribute('data-lucide', 'check');
          checkIcon.className = 'w-4 h-4 ml-auto';
          item.appendChild(checkIcon);
        }
      } else {
        item.className =
          'w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3 text-gray-700 dark:text-gray-300';

        // Remove check icon if present
        const checkIcon = item.querySelector('[data-lucide="check"]');
        if (checkIcon) {
          checkIcon.remove();
        }
      }
    }

    // Refresh icons after updating
    this.iconManager.refreshIcons();
  }

  private updateLabels(): void {
    this.button.setAttribute('aria-label', i18n.t('theme.switch'));
    this.button.setAttribute('title', i18n.t('theme.switch'));

    // Update theme names in dropdown
    const items = this.dropdown.querySelectorAll('button[data-theme]');
    for (const item of items) {
      const themeName = item.getAttribute('data-theme') as ThemeName;
      const nameElement = item.querySelector('.flex-1');
      if (nameElement && themeName) {
        nameElement.textContent = i18n.getThemeName(themeName);
      }
    }
  }

  public destroy(): void {
    window.removeEventListener('localeChange', () => {
      this.updateLabels();
    });

    document.removeEventListener('click', () => {
      this.closeDropdown();
    });

    document.removeEventListener('keydown', () => {
      this.closeDropdown();
    });

    this.container.innerHTML = '';
  }
}
