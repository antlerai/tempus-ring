import './styles/global.css';
import { ControlPanel } from './components/control-panel';
import { SettingsPanel } from './components/settings-panel';
import { TimerDisplay } from './components/timer-display';
import { TimerFactory } from './factories/timer-factory';
import { i18n } from './i18n';
import { NotificationService } from './services/notification-service';
import { StorageService } from './services/storage-service';
import { ThemeManager } from './services/theme-manager';
import { TimerService } from './services/timer-service';
import type { ThemeName } from './types/theme-types';
import type { TimerConfig } from './types/timer-types';
import { IconManager } from './utils/icons';

class TempusRingApp {
  private themeManager: ThemeManager;
  private timerService: TimerService;
  private storageService: StorageService;
  private notificationService: NotificationService;
  private timerFactory: TimerFactory;
  private iconManager: IconManager;

  // UI Components
  private timerDisplay: TimerDisplay | undefined;
  private controlPanel: ControlPanel | undefined;
  private settingsPanel: SettingsPanel | undefined;

  constructor() {
    this.storageService = StorageService.getInstance();
    this.themeManager = new ThemeManager();
    this.timerService = new TimerService();
    this.notificationService = new NotificationService();
    this.timerFactory = new TimerFactory();
    this.iconManager = IconManager.getInstance();
    // Statistics service will be used later for session tracking
  }

  async initialize(): Promise<void> {
    try {
      // Initialize i18n system
      await i18n.init();

      // Load user preferences
      const preferences = await this.storageService.loadPreferences();

      // Initialize theme
      await this.themeManager.init();
      if (preferences.theme && this.themeManager.hasTheme(preferences.theme as ThemeName)) {
        await this.themeManager.switchTheme(preferences.theme as ThemeName);
      }

      // Initialize language
      if (preferences.language) {
        await i18n.switchLocale(preferences.language);
      }

      // Initialize timer with saved config
      const timerConfig: TimerConfig = {
        workDuration: preferences.workDuration,
        shortBreakDuration: preferences.shortBreakDuration,
        longBreakDuration: preferences.longBreakDuration,
        sessionsUntilLongBreak: preferences.sessionsUntilLongBreak,
        autoStartBreaks: preferences.autoStartBreaks,
        autoStartPomodoros: preferences.autoStartPomodoros,
      };

      this.timerService.updateConfig(timerConfig);

      // Request notification permissions
      await this.notificationService.requestPermission();

      // Mount UI components
      this.mountComponents();

      // Setup event handlers
      this.setupEventHandlers();

      console.log('Tempus Ring initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Tempus Ring:', error);
      this.showErrorMessage('Failed to initialize application');
    }
  }

  private mountComponents(): void {
    const appContainer = document.querySelector('#app');
    if (!appContainer) {
      throw new Error('App container not found');
    }

    // Check if cloudlight theme is active
    const isCloudlight = this.themeManager.getCurrentThemeName() === 'cloudlight';

    // Create main layout
    appContainer.innerHTML = isCloudlight
      ? `
      <div class="min-h-screen flex items-center justify-center transition-colors duration-300">
        <div class="flex flex-col items-center gap-12">
          <div id="timer-display"></div>
          <div id="control-panel"></div>
          <button id="settings-button" class="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700">
            <i data-lucide="settings" class="w-5 h-5"></i>
          </button>
        </div>
        <div id="settings-panel" class="hidden"></div>
      </div>
    `
      : `
      <div class="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div class="container mx-auto px-4 py-8">
          <header class="text-center mb-6 relative">
            <h1 class="text-2xl font-bold text-muted-foreground" data-i18n="app.subtitle">Focus Timer</h1>
            <button id="settings-button" class="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <i data-lucide="settings" class="w-5 h-5"></i>
            </button>
          </header>
          
          <main class="grid gap-8 lg:grid-cols-3">
            <div class="lg:col-span-2">
              <div id="timer-display" class="mb-8"></div>
              <div id="control-panel"></div>
            </div>
            
            <aside>
              <div id="settings-panel"></div>
            </aside>
          </main>
        </div>
      </div>
    `;

    // Initialize components
    const timerDisplayContainer = document.getElementById('timer-display');
    const controlPanelContainer = document.getElementById('control-panel');
    const settingsPanelContainer = document.getElementById('settings-panel');

    if (timerDisplayContainer && controlPanelContainer && settingsPanelContainer) {
      // Initialize Timer Display
      this.timerDisplay = new TimerDisplay({
        container: timerDisplayContainer,
        timerService: this.timerService,
        themeManager: this.themeManager,
        timerFactory: this.timerFactory,
      });

      // Initialize Control Panel
      this.controlPanel = new ControlPanel({
        container: controlPanelContainer,
        timerService: this.timerService,
        themeManager: this.themeManager,
      });

      // Initialize Settings Panel
      this.settingsPanel = new SettingsPanel({
        container: settingsPanelContainer,
        themeManager: this.themeManager,
        timerService: this.timerService,
      });

      console.log('UI components initialized successfully');

      // Initialize icons after DOM is ready
      this.iconManager.refreshIcons();

      // Setup settings button
      const settingsButton = document.getElementById('settings-button');
      if (settingsButton && this.settingsPanel) {
        settingsButton.addEventListener('click', () => {
          this.settingsPanel?.show();
        });
      }
    }
  }

  private setupEventHandlers(): void {
    // Timer state changes
    this.timerService.on('timer:stateChange', (data) => {
      // Components will handle their own state updates
      console.log('Timer state changed:', data);
    });

    this.timerService.on('timer:tick', (data) => {
      // Components will handle their own tick updates
      console.log('Timer tick:', data);
    });

    this.timerService.on('timer:sessionComplete', (session) => {
      // Handle session completion
      console.log('Session completed:', session);
    });

    // Theme changes
    this.themeManager.on('theme:changed', () => {
      this.savePreferences();
    });

    // Language changes - use DOM events
    window.addEventListener('localeChange', () => {
      this.updateTranslations();
      this.savePreferences();
    });

    // Window events
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  private updateTranslations(): void {
    const elements = document.querySelectorAll('[data-i18n]');
    for (const element of elements) {
      const key = element.getAttribute('data-i18n');
      if (key) {
        element.textContent = i18n.t(key);
      }
    }

    // Components will handle their own translation updates
    console.log('Translations updated');
  }

  private async savePreferences(): Promise<void> {
    try {
      const currentConfig = this.timerService.getConfig();
      const preferences = {
        theme: this.themeManager.getCurrentThemeName(),
        language: i18n.getCurrentLocale(),
        workDuration: currentConfig.workDuration,
        shortBreakDuration: currentConfig.shortBreakDuration,
        longBreakDuration: currentConfig.longBreakDuration,
        sessionsUntilLongBreak: currentConfig.sessionsUntilLongBreak,
        autoStartBreaks: currentConfig.autoStartBreaks,
        autoStartPomodoros: currentConfig.autoStartPomodoros,
        soundEnabled: true,
        notificationsEnabled: true,
        volume: 0.7,
      };

      await this.storageService.savePreferences(preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  private showErrorMessage(message: string): void {
    const appContainer = document.querySelector('#app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div class="text-center">
            <h1 class="text-2xl font-bold mb-4 text-destructive">Error</h1>
            <p class="text-muted-foreground">${message}</p>
            <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
              Retry
            </button>
          </div>
        </div>
      `;
    }
  }

  private cleanup(): void {
    this.timerService.pause();

    // Cleanup UI components
    if (this.timerDisplay) {
      this.timerDisplay.destroy();
      this.timerDisplay = undefined;
    }

    if (this.controlPanel) {
      this.controlPanel.destroy();
      this.controlPanel = undefined;
    }

    if (this.settingsPanel) {
      this.settingsPanel.destroy();
      this.settingsPanel = undefined;
    }
  }
}

// Initialize application when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
  const app = new TempusRingApp();
  await app.initialize();
});
