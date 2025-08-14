import '@/styles/settings-panel.css';
import { i18n } from '../i18n';
// biome-ignore lint/style/useImportType: ThemeManager is used as constructor parameter
import { ThemeManager } from '../services/theme-manager';
// biome-ignore lint/style/useImportType: TimerService is used as constructor parameter
import { TimerService } from '../services/timer-service';
import type { TimerConfig } from '../types';
import type { ThemeName } from '../types/theme-types';
import { IconManager } from '../utils/icons';

export interface SettingsPanelConfig {
  container: HTMLElement;
  timerService: TimerService;
  themeManager: ThemeManager;
  onSettingsChange?: (settings: Partial<TimerConfig>) => void;
}

interface SettingsForm {
  theme: string;
  language: string;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export class SettingsPanel {
  private container: HTMLElement;
  private timerService: TimerService;
  private themeManager: ThemeManager;
  private onSettingsChange: ((settings: Partial<TimerConfig>) => void) | undefined;

  private form: HTMLFormElement;
  private isVisible = false;

  constructor(config: SettingsPanelConfig) {
    this.container = config.container;
    this.timerService = config.timerService;
    this.themeManager = config.themeManager;
    this.onSettingsChange = config.onSettingsChange;

    this.form = this.createForm();
    this.render();
    this.attachEventListeners();
    this.loadCurrentSettings();

    // Listen for locale changes
    window.addEventListener('localeChange', () => {
      this.updateLabels();
    });
  }

  private createForm(): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'settings-form';
    return form;
  }

  private render(): void {
    this.container.className = 'settings-modal-overlay hidden flex items-center justify-center';

    const modal = document.createElement('div');
    modal.className = 'settings-modal';

    const header = this.createHeader();
    const content = this.createContent();
    const footer = this.createFooter();

    this.form.appendChild(header);
    this.form.appendChild(content);
    this.form.appendChild(footer);

    modal.appendChild(this.form);
    this.container.appendChild(modal);

    // Close modal when clicking outside
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide();
      }
    });
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'settings-header';

    const title = document.createElement('h2');
    title.className = 'settings-title';
    title.innerHTML = `
      <i data-lucide="settings" class="settings-section-icon"></i>
      ${i18n.t('settings.title')}
    `;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'settings-close-btn';
    closeButton.innerHTML = '<i data-lucide="x" class="w-5 h-5"></i>';
    closeButton.addEventListener('click', () => this.hide());

    header.appendChild(title);
    header.appendChild(closeButton);

    return header;
  }

  private createContent(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'settings-content';

    // Theme and Language section
    const appearanceSection = document.createElement('div');
    appearanceSection.className = 'settings-section';

    const appearanceTitle = document.createElement('h3');
    appearanceTitle.className = 'settings-section-title';
    appearanceTitle.innerHTML = `
      <i data-lucide="brush" class="settings-section-icon"></i>
      ${i18n.t('settings.appearance')}
    `;

    const appearanceContent = document.createElement('div');
    appearanceContent.className = 'space-y-4';
    appearanceContent.appendChild(this.createThemeSection());
    appearanceContent.appendChild(this.createLanguageSection());

    appearanceSection.appendChild(appearanceTitle);
    appearanceSection.appendChild(appearanceContent);

    // Timer Duration section
    const durationSection = this.createDurationsSection();

    // Auto Start section
    const autoStartSection = this.createAutoStartSection();

    // Notifications section
    const notificationsSection = this.createNotificationsSection();

    content.appendChild(appearanceSection);
    content.appendChild(durationSection);
    content.appendChild(autoStartSection);
    content.appendChild(notificationsSection);

    return content;
  }

  private createThemeSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'settings-form-group';

    const label = document.createElement('label');
    label.className = 'settings-label';
    label.innerHTML = `
      <span class="settings-label-text">
        <i data-lucide="palette" class="settings-section-icon"></i>
        ${i18n.t('settings.theme')}
      </span>
    `;

    const select = document.createElement('select');
    select.id = 'theme-select';
    select.className = 'settings-select';

    const themes = this.themeManager.getAvailableThemes();
    for (const theme of themes) {
      const option = document.createElement('option');
      option.value = theme.config.name;
      option.textContent = i18n.getThemeName(theme.config.name);
      select.appendChild(option);
    }

    section.appendChild(label);
    section.appendChild(select);

    return section;
  }

  private createLanguageSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'settings-form-group';

    const label = document.createElement('label');
    label.className = 'settings-label';
    label.innerHTML = `
      <span class="settings-label-text">
        <i data-lucide="globe" class="settings-section-icon"></i>
        ${i18n.t('settings.language')}
      </span>
    `;

    const select = document.createElement('select');
    select.id = 'language-select';
    select.className = 'settings-select';

    const languages = i18n.getAvailableLocales();
    for (const lang of languages) {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = i18n.getLocaleName(lang);
      select.appendChild(option);
    }

    section.appendChild(label);
    section.appendChild(select);

    return section;
  }

  private createDurationsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'settings-section';

    const title = document.createElement('h3');
    title.className = 'settings-section-title';
    title.innerHTML = `
      <i data-lucide="clock" class="settings-section-icon"></i>
      ${i18n.t('settings.durations')}
    `;

    const grid = document.createElement('div');
    grid.className = 'settings-grid';

    // Work Duration
    grid.appendChild(this.createDurationInput('work-duration', 'settings.workDuration', 25));

    // Short Break Duration
    grid.appendChild(
      this.createDurationInput('short-break-duration', 'settings.shortBreakDuration', 5)
    );

    // Long Break Duration
    grid.appendChild(
      this.createDurationInput('long-break-duration', 'settings.longBreakDuration', 15)
    );

    // Sessions Until Long Break
    grid.appendChild(
      this.createNumberInputWithDescription(
        'sessions-until-long-break',
        'settings.sessionsUntilLongBreak',
        'settings.descriptions.sessionsUntilLongBreak',
        4,
        1,
        10
      )
    );

    section.appendChild(title);
    section.appendChild(grid);

    return section;
  }

  private createDurationInput(id: string, labelKey: string, defaultValue: number): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'settings-form-group';

    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'settings-label';
    label.innerHTML = `
      <span class="settings-label-text">
        ${i18n.t(labelKey)}
      </span>
    `;

    const input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.min = '1';
    input.max = '120';
    input.value = defaultValue.toString();
    input.className = 'settings-input';

    const unit = document.createElement('span');
    unit.className = 'settings-input-unit';
    unit.textContent = 'minutes';

    const inputContainer = document.createElement('div');
    inputContainer.className = 'settings-input-container';
    inputContainer.appendChild(input);
    inputContainer.appendChild(unit);

    wrapper.appendChild(label);
    wrapper.appendChild(inputContainer);

    return wrapper;
  }

  private createNumberInputWithDescription(
    id: string,
    labelKey: string,
    descriptionKey: string,
    defaultValue: number,
    min: number,
    max: number
  ): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'settings-form-group-with-description';

    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'settings-label';
    label.innerHTML = `
      <span class="settings-label-text">
        ${i18n.t(labelKey)}
      </span>
    `;

    const input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.min = min.toString();
    input.max = max.toString();
    input.value = defaultValue.toString();
    input.className = 'settings-input';

    const description = document.createElement('div');
    description.className = 'settings-description';
    description.textContent = i18n.t(descriptionKey);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(description);

    return wrapper;
  }

  private createAutoStartSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'settings-section';

    const title = document.createElement('h3');
    title.className = 'settings-section-title';
    title.innerHTML = `
      <i data-lucide="play" class="settings-section-icon"></i>
      ${i18n.t('settings.autoStart')}
    `;

    const checkboxes = document.createElement('div');
    checkboxes.className = 'settings-checkbox-group';

    // Auto Start Breaks
    checkboxes.appendChild(
      this.createCheckboxWithDescription(
        'auto-start-breaks',
        'settings.autoStartBreaks',
        'settings.descriptions.autoStartBreaks',
        false
      )
    );

    // Auto Start Pomodoros
    checkboxes.appendChild(
      this.createCheckboxWithDescription(
        'auto-start-pomodoros',
        'settings.autoStartPomodoros',
        'settings.descriptions.autoStartPomodoros',
        false
      )
    );

    section.appendChild(title);
    section.appendChild(checkboxes);

    return section;
  }

  private createNotificationsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'settings-section';

    const title = document.createElement('h3');
    title.className = 'settings-section-title';
    title.innerHTML = `
      <i data-lucide="bell" class="settings-section-icon"></i>
      ${i18n.t('settings.notifications')}
    `;

    const checkboxes = document.createElement('div');
    checkboxes.className = 'settings-checkbox-group';

    // Desktop Notifications
    checkboxes.appendChild(
      this.createCheckboxWithDescription(
        'notifications-enabled',
        'settings.desktop',
        'settings.descriptions.desktop',
        true
      )
    );

    // Sound Notifications
    checkboxes.appendChild(
      this.createCheckboxWithDescription(
        'sound-enabled',
        'settings.sound',
        'settings.descriptions.sound',
        true
      )
    );

    section.appendChild(title);
    section.appendChild(checkboxes);

    return section;
  }

  private createCheckboxWithDescription(
    id: string,
    labelKey: string,
    descriptionKey: string,
    defaultChecked: boolean
  ): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'settings-form-group-with-description';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.checked = defaultChecked;
    input.className = 'settings-checkbox-input';

    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'settings-checkbox-label';
    label.textContent = i18n.t(labelKey);

    const description = document.createElement('div');
    description.className = 'settings-description';
    description.textContent = i18n.t(descriptionKey);

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    wrapper.appendChild(description);

    return wrapper;
  }

  private createFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'settings-footer';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'settings-btn settings-btn-secondary';
    cancelButton.textContent = i18n.t('common.cancel');
    cancelButton.addEventListener('click', () => this.hide());

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'settings-btn settings-btn-primary';
    saveButton.textContent = i18n.t('common.save');

    footer.appendChild(cancelButton);
    footer.appendChild(saveButton);

    return footer;
  }

  private attachEventListeners(): void {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });

    // Theme change
    const themeSelect = this.form.querySelector('#theme-select') as HTMLSelectElement;
    themeSelect?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.themeManager.switchTheme(target.value as ThemeName);
    });

    // Language change
    const languageSelect = this.form.querySelector('#language-select') as HTMLSelectElement;
    languageSelect?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      i18n.switchLocale(target.value);
    });
  }

  private loadCurrentSettings(): void {
    const config = this.timerService.getConfig();
    const currentTheme = this.themeManager.getCurrentThemeName();
    const currentLocale = i18n.getCurrentLocale();

    // Set form values
    const themeSelect = this.form.querySelector('#theme-select') as HTMLSelectElement;
    if (themeSelect) themeSelect.value = currentTheme;

    const languageSelect = this.form.querySelector('#language-select') as HTMLSelectElement;
    if (languageSelect) languageSelect.value = currentLocale;

    const workDuration = this.form.querySelector('#work-duration') as HTMLInputElement;
    if (workDuration) workDuration.value = Math.floor(config.workDuration / 60).toString();

    const shortBreakDuration = this.form.querySelector('#short-break-duration') as HTMLInputElement;
    if (shortBreakDuration)
      shortBreakDuration.value = Math.floor(config.shortBreakDuration / 60).toString();

    const longBreakDuration = this.form.querySelector('#long-break-duration') as HTMLInputElement;
    if (longBreakDuration)
      longBreakDuration.value = Math.floor(config.longBreakDuration / 60).toString();

    const sessionsUntilLongBreak = this.form.querySelector(
      '#sessions-until-long-break'
    ) as HTMLInputElement;
    if (sessionsUntilLongBreak)
      sessionsUntilLongBreak.value = config.sessionsUntilLongBreak.toString();

    const autoStartBreaks = this.form.querySelector('#auto-start-breaks') as HTMLInputElement;
    if (autoStartBreaks) autoStartBreaks.checked = config.autoStartBreaks;

    const autoStartPomodoros = this.form.querySelector('#auto-start-pomodoros') as HTMLInputElement;
    if (autoStartPomodoros) autoStartPomodoros.checked = config.autoStartPomodoros;
  }

  private handleSave(): void {
    const formData = this.getFormData();

    // Update timer configuration
    const timerConfig: Partial<TimerConfig> = {
      workDuration: formData.workDuration * 60,
      shortBreakDuration: formData.shortBreakDuration * 60,
      longBreakDuration: formData.longBreakDuration * 60,
      sessionsUntilLongBreak: formData.sessionsUntilLongBreak,
      autoStartBreaks: formData.autoStartBreaks,
      autoStartPomodoros: formData.autoStartPomodoros,
    };

    this.timerService.updateConfig(timerConfig);

    // Theme and language changes are handled in real-time

    // Notify parent component
    this.onSettingsChange?.(timerConfig);

    this.hide();
  }

  private getFormData(): SettingsForm {
    const themeSelect = this.form.querySelector('#theme-select') as HTMLSelectElement;
    const languageSelect = this.form.querySelector('#language-select') as HTMLSelectElement;
    const workDuration = this.form.querySelector('#work-duration') as HTMLInputElement;
    const shortBreakDuration = this.form.querySelector('#short-break-duration') as HTMLInputElement;
    const longBreakDuration = this.form.querySelector('#long-break-duration') as HTMLInputElement;
    const sessionsUntilLongBreak = this.form.querySelector(
      '#sessions-until-long-break'
    ) as HTMLInputElement;
    const autoStartBreaks = this.form.querySelector('#auto-start-breaks') as HTMLInputElement;
    const autoStartPomodoros = this.form.querySelector('#auto-start-pomodoros') as HTMLInputElement;
    const soundEnabled = this.form.querySelector('#sound-enabled') as HTMLInputElement;
    const notificationsEnabled = this.form.querySelector(
      '#notifications-enabled'
    ) as HTMLInputElement;

    return {
      theme: themeSelect?.value || 'wabisabi',
      language: languageSelect?.value || 'en',
      workDuration: Number.parseInt(workDuration?.value || '25', 10),
      shortBreakDuration: Number.parseInt(shortBreakDuration?.value || '5', 10),
      longBreakDuration: Number.parseInt(longBreakDuration?.value || '15', 10),
      sessionsUntilLongBreak: Number.parseInt(sessionsUntilLongBreak?.value || '4', 10),
      autoStartBreaks: autoStartBreaks?.checked || false,
      autoStartPomodoros: autoStartPomodoros?.checked || false,
      soundEnabled: soundEnabled?.checked || true,
      notificationsEnabled: notificationsEnabled?.checked || true,
    };
  }

  private updateLabels(): void {
    // Update all text content when language changes
    const title = this.form.querySelector('h2');
    if (title) title.textContent = i18n.t('settings.title');

    // Update all labels and buttons
    this.loadCurrentSettings();
  }

  public show(): void {
    this.loadCurrentSettings();
    this.container.classList.remove('hidden');
    this.container.classList.add('flex');
    this.isVisible = true;
    // Refresh icons after showing the panel
    IconManager.getInstance().refreshIcons();
  }

  public hide(): void {
    this.container.classList.add('hidden');
    this.container.classList.remove('flex');
    this.isVisible = false;
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public destroy(): void {
    window.removeEventListener('localeChange', () => {
      this.updateLabels();
    });

    this.container.innerHTML = '';
  }
}
