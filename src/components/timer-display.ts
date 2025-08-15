// biome-ignore lint/style/useImportType: TimerFactory is used as constructor parameter
import { TimerFactory } from '../factories/timer-factory';
import { i18n } from '../i18n';
// biome-ignore lint/style/useImportType: ThemeManager is used as constructor parameter
import { ThemeManager } from '../services/theme-manager';
// biome-ignore lint/style/useImportType: TimerService is used as constructor parameter
import { TimerService } from '../services/timer-service';
import type { TimerData, TimerState } from '../types';
import { TimerState as TimerStateEnum } from '../types';
import type { TimerRenderer } from '../types/renderer-types';

export interface TimerDisplayConfig {
  container: HTMLElement;
  timerService: TimerService;
  themeManager: ThemeManager;
  timerFactory: TimerFactory;
}

export class TimerDisplay {
  private container: HTMLElement;
  private timerService: TimerService;
  private themeManager: ThemeManager;
  private timerFactory: TimerFactory;

  private renderer: TimerRenderer | undefined;
  private currentData: TimerData | undefined;

  // Display elements
  private displayContainer: HTMLElement;
  private rendererContainer: HTMLElement;
  private timeDisplay: HTMLElement;
  private stateDisplay: HTMLElement;
  private sessionCounter: HTMLElement;
  private progressText: HTMLElement;

  constructor(config: TimerDisplayConfig) {
    this.container = config.container;
    this.timerService = config.timerService;
    this.themeManager = config.themeManager;
    this.timerFactory = config.timerFactory;

    // Create display elements
    this.displayContainer = this.createDisplayContainer();
    this.rendererContainer = this.createRendererContainer();
    this.timeDisplay = this.createTimeDisplay();
    this.stateDisplay = this.createStateDisplay();
    this.sessionCounter = this.createSessionCounter();
    this.progressText = this.createProgressText();

    this.render();
    this.setupEventListeners();
    this.setupThemeEventListeners();
    this.initializeRenderer();
    this.updateDisplay();

    // Listen for locale changes
    window.addEventListener('localeChange', () => {
      this.updateLabels();
    });
  }

  private setupThemeEventListeners(): void {
    this.themeManager.on('theme:changed', () => {
      this.handleThemeChange();
    });
  }

  private async handleThemeChange(): Promise<void> {
    // Clear the container completely
    this.container.innerHTML = '';

    // Recreate all display elements with updated theme styles
    this.displayContainer = this.createDisplayContainer();
    this.rendererContainer = this.createRendererContainer();
    this.timeDisplay = this.createTimeDisplay();
    this.stateDisplay = this.createStateDisplay();
    this.sessionCounter = this.createSessionCounter();
    this.progressText = this.createProgressText();

    // Re-render the layout
    this.render();

    // Recreate the renderer
    await this.recreateRenderer();

    // Update display with current data
    this.updateDisplay();
  }

  private createDisplayContainer(): HTMLElement {
    const container = document.createElement('div');
    const currentTheme = this.themeManager.getCurrentTheme();
    const layoutMode = currentTheme.layoutMode || 'standard';

    // Apply appropriate layout class based on theme
    if (layoutMode === 'minimal') {
      container.className = 'timer-layout-minimal';
    } else {
      container.className = 'timer-layout-standard';
    }

    return container;
  }

  private createRendererContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'relative flex items-center justify-center w-80 h-80 mx-auto';
    container.id = 'timer-renderer';
    return container;
  }

  private createTimeDisplay(): HTMLElement {
    const timeDisplay = document.createElement('div');
    const currentTheme = this.themeManager.getCurrentTheme();
    const layoutMode = currentTheme.layoutMode || 'standard';

    // Apply appropriate time display class based on theme
    if (layoutMode === 'minimal') {
      timeDisplay.className = 'timer-time-large';
    } else {
      timeDisplay.className = 'timer-time-standard';
    }

    timeDisplay.textContent = '25:00';
    return timeDisplay;
  }

  private createStateDisplay(): HTMLElement {
    const stateDisplay = document.createElement('div');
    const currentTheme = this.themeManager.getCurrentTheme();
    const layoutMode = currentTheme.layoutMode || 'standard';

    // Apply appropriate state display class based on theme
    if (layoutMode === 'minimal') {
      stateDisplay.className = 'timer-state-minimal';
    } else {
      stateDisplay.className = 'timer-state-standard';
    }

    stateDisplay.textContent = i18n.t('timer.work');
    return stateDisplay;
  }

  private createSessionCounter(): HTMLElement {
    const sessionCounter = document.createElement('div');
    const currentTheme = this.themeManager.getCurrentTheme();
    const layoutMode = currentTheme.layoutMode || 'standard';

    // Base container styling
    sessionCounter.className = 'flex items-center justify-between w-full max-w-sm';

    const completedSessions = document.createElement('span');
    completedSessions.id = 'completed-sessions';
    // Apply appropriate session counter class based on theme
    if (layoutMode === 'minimal') {
      completedSessions.className = 'timer-session-minimal';
    } else {
      completedSessions.className = 'timer-session-standard';
    }
    completedSessions.textContent = `${i18n.t('timer.completed')}: 0`;

    const remainingSessions = document.createElement('span');
    remainingSessions.id = 'remaining-sessions';
    // Apply same class to remaining sessions
    remainingSessions.className = completedSessions.className;
    remainingSessions.textContent = `${i18n.t('timer.remaining')}: 4`;

    sessionCounter.appendChild(completedSessions);
    sessionCounter.appendChild(remainingSessions);

    return sessionCounter;
  }

  private createProgressText(): HTMLElement {
    const progressText = document.createElement('div');
    progressText.className = 'timer-progress-text';
    progressText.textContent = '0% complete';
    return progressText;
  }

  private render(): void {
    const isCloudlight = this.themeManager.getCurrentThemeName() === 'cloudlight';

    // Clear the display container first
    this.displayContainer.innerHTML = '';

    if (isCloudlight) {
      // Cloudlight theme layout with status components between clock and buttons
      this.container.className = '';

      // Add components in the cloudlight order: clock, time, status components
      this.displayContainer.appendChild(this.rendererContainer);
      this.displayContainer.appendChild(this.timeDisplay);
      this.displayContainer.appendChild(this.stateDisplay);
      this.displayContainer.appendChild(this.sessionCounter);
      this.displayContainer.appendChild(this.progressText);
    } else {
      this.container.className = 'flex flex-col items-center justify-center min-h-screen p-8';

      // Add all components to display container
      this.displayContainer.appendChild(this.rendererContainer);
      this.displayContainer.appendChild(this.timeDisplay);
      this.displayContainer.appendChild(this.stateDisplay);
      this.displayContainer.appendChild(this.sessionCounter);
      this.displayContainer.appendChild(this.progressText);
    }

    // Clear container and add the display container
    this.container.innerHTML = '';
    this.container.appendChild(this.displayContainer);
  }

  private setupEventListeners(): void {
    // Timer events
    this.timerService.on('timer:tick', (data: TimerData) => {
      this.currentData = data;
      this.updateDisplay();
      this.updateRenderer();
    });

    this.timerService.on('timer:stateChange', ({ to }) => {
      this.updateStateDisplay(to);
    });

    this.timerService.on('timer:sessionStart', () => {
      this.updateDisplay();
    });

    this.timerService.on('timer:sessionComplete', () => {
      this.updateDisplay();
    });

    this.timerService.on('timer:reset', () => {
      this.updateDisplay();
    });

    // Theme change events
    this.themeManager.on('theme:changed', () => {
      this.recreateRenderer();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  private async initializeRenderer(): Promise<void> {
    try {
      const themeConfig = this.themeManager.getCurrentTheme();
      this.renderer = this.timerFactory.createRenderer(this.rendererContainer, themeConfig, {
        width: 320,
        height: 320,
        displayMode: 'percentage',
        cacheKey: 'main-timer-display',
      });
      this.updateRenderer();
    } catch (error) {
      console.error('Failed to initialize renderer:', error);
    }
  }

  private async recreateRenderer(): Promise<void> {
    // Remove cached renderer first
    this.timerFactory.removeCachedRenderer('main-timer-display');

    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = undefined;
    }

    // Clear the renderer container
    this.rendererContainer.innerHTML = '';

    // Wait a bit for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create new renderer with current theme
    await this.initializeRenderer();
  }

  private updateDisplay(): void {
    const data = this.currentData || this.timerService.getState();
    this.currentData = data;

    // Update time display
    const timeString = this.formatTime(data.remainingTime);
    this.timeDisplay.textContent = timeString;

    // Update state display
    this.updateStateDisplay(data.state);

    // Update session counters
    this.updateSessionCounters(data);

    // Update progress text
    this.updateProgressText(data.progress);

    // Update renderer with time
    if (this.renderer) {
      this.renderer.updateTime(timeString);
    }
  }

  private updateRenderer(): void {
    if (!this.renderer || !this.currentData) {
      return;
    }

    const themeConfig = this.themeManager.getCurrentTheme();
    const isRunning =
      this.currentData.state === TimerStateEnum.WORK ||
      this.currentData.state === TimerStateEnum.SHORT_BREAK ||
      this.currentData.state === TimerStateEnum.LONG_BREAK;

    this.renderer.render(this.currentData.progress, themeConfig);
    this.renderer.setAnimationState(isRunning);
  }

  private updateStateDisplay(state: TimerState): void {
    let stateText: string;
    let stateClass: string;

    switch (state) {
      case TimerStateEnum.WORK:
        stateText = i18n.t('timer.work');
        stateClass = 'text-blue-600 dark:text-blue-400';
        break;
      case TimerStateEnum.SHORT_BREAK:
        stateText = i18n.t('timer.shortBreak');
        stateClass = 'text-green-600 dark:text-green-400';
        break;
      case TimerStateEnum.LONG_BREAK:
        stateText = i18n.t('timer.longBreak');
        stateClass = 'text-purple-600 dark:text-purple-400';
        break;
      case TimerStateEnum.PAUSED:
        stateText = i18n.t('timer.pause');
        stateClass = 'text-orange-600 dark:text-orange-400';
        break;
      default:
        stateText = i18n.t('timer.work');
        stateClass = 'text-gray-600 dark:text-gray-300';
        break;
    }

    this.stateDisplay.textContent = stateText;
    this.stateDisplay.className = `text-2xl font-semibold text-center capitalize ${stateClass}`;
  }

  private updateSessionCounters(data: TimerData): void {
    const completedElement = this.sessionCounter.querySelector('#completed-sessions');
    const remainingElement = this.sessionCounter.querySelector('#remaining-sessions');

    if (completedElement) {
      completedElement.textContent = `${i18n.t('timer.completed')}: ${data.completedSessions}`;
    }

    if (remainingElement) {
      remainingElement.textContent = `${i18n.t('timer.remaining')}: ${data.sessionsUntilLongBreak}`;
    }
  }

  private updateProgressText(progress: number): void {
    const percentage = Math.round(progress * 100);
    this.progressText.textContent = `${percentage}% complete`;
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private updateLabels(): void {
    // Update all text content when language changes
    if (this.currentData) {
      this.updateStateDisplay(this.currentData.state);
      this.updateSessionCounters(this.currentData);
    } else {
      // Update with default values
      const data = this.timerService.getState();
      this.updateStateDisplay(data.state);
      this.updateSessionCounters(data);
    }
  }

  private handleResize(): void {
    if (this.renderer) {
      // Get the container dimensions
      const rect = this.rendererContainer.getBoundingClientRect();
      this.renderer.resize(rect.width, rect.height);
    }
  }

  public updateTimerData(data: TimerData): void {
    this.currentData = data;
    this.updateDisplay();
    this.updateRenderer();
  }

  public setAnimationEnabled(enabled: boolean): void {
    if (this.renderer) {
      this.renderer.setAnimationState(enabled);
    }
  }

  public getRendererContainer(): HTMLElement {
    return this.rendererContainer;
  }

  public getCurrentRenderer(): TimerRenderer | undefined {
    return this.renderer;
  }

  public async switchTheme(): Promise<void> {
    await this.recreateRenderer();
  }

  public destroy(): void {
    window.removeEventListener('localeChange', () => {
      this.updateLabels();
    });

    window.removeEventListener('resize', () => {
      this.handleResize();
    });

    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = undefined;
    }

    this.container.innerHTML = '';
  }
}
