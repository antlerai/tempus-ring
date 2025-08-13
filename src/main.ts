import { i18n } from './i18n';
import { ThemeManager } from './services/theme-manager';
import { TimerService } from './services/timer-service';
import { TimerFactory } from './factories/timer-factory';
import { StorageService } from './services/storage-service';
import { NotificationService } from './services/notification-service';
import { StatisticsService } from './services/statistics-service';
import { TimerDisplay } from './components/timer-display';
import { ControlPanel } from './components/control-panel';
import { SettingsPanel } from './components/settings-panel';
import type { TimerConfig } from './types/timer-types';
import type { ThemeName } from './types/theme-types';

class TempusRingApp {
  private themeManager: ThemeManager;
  private timerService: TimerService;
  private storageService: StorageService;
  private notificationService: NotificationService;
  private statisticsService: StatisticsService;

  private timerDisplay?: TimerDisplay;
  private controlPanel?: ControlPanel;
  private settingsPanel?: SettingsPanel;

  constructor() {
    this.storageService = StorageService.getInstance();
    this.themeManager = new ThemeManager();
    this.timerService = TimerService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.statisticsService = StatisticsService.getInstance();
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
        i18n.switchLanguage(preferences.language);
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
      await this.notificationService.initialize();

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

    // Create main layout
    appContainer.innerHTML = `
      <div class="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div class="container mx-auto px-4 py-8">
          <header class="text-center mb-8">
            <h1 class="text-3xl font-bold mb-2" data-i18n="app.title">Tempus Ring</h1>
            <p class="text-muted-foreground" data-i18n="app.subtitle">Focus Timer</p>
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
      // Initialize timer display with required services
      this.timerDisplay = new TimerDisplay({
        container: timerDisplayContainer,
        timerService: this.timerService,
        themeManager: this.themeManager,
        timerFactory: TimerFactory.getInstance(),
      });

      // Initialize control panel
      this.controlPanel = new ControlPanel({
        container: controlPanelContainer,
        timerService: this.timerService,
      });

      // Initialize settings panel
      this.settingsPanel = new SettingsPanel({
        container: settingsPanelContainer,
        timerService: this.timerService,
        themeManager: this.themeManager,
      });
    }
  }

  private setupEventHandlers(): void {
    // Timer state changes
    this.timerService.on('stateChange', (data) => {
      this.timerDisplay?.handleStateChange(data);
      this.controlPanel?.handleStateChange(data);
    });

    this.timerService.on('tick', (data) => {
      this.timerDisplay?.handleTick(data);
    });

    this.timerService.on('sessionComplete', (session) => {
      this.notificationService.notify({
        title: i18n.t('notifications.sessionComplete'),
        body: i18n.t('notifications.sessionCompleteBody'),
        icon: '/icon.png',
      });
      this.statisticsService.addSession(session);
    });

    // Theme changes
    this.themeManager.on('theme:changed', () => {
      this.savePreferences();
    });

    // Language changes
    i18n.on('languageChanged', () => {
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
    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        element.textContent = i18n.t(key);
      }
    });

    // Components will handle their own translation updates
    this.controlPanel?.render();
    this.settingsPanel?.render();
    this.timerDisplay?.render();
  }

  private async savePreferences(): Promise<void> {
    try {
      const currentConfig = this.timerService.getConfiguration();
      const preferences = {
        theme: this.themeManager.getCurrentThemeName(),
        language: i18n.getCurrentLanguage(),
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
  }
}

// Initialize application when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
  const app = new TempusRingApp();
  await app.initialize();
});
