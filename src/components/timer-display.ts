// biome-ignore lint/style/useImportType: TimerFactory is used as constructor parameter
import { TimerFactory } from '../factories/timer-factory';
// biome-ignore lint/style/useImportType: ThemeManager is used as constructor parameter
import { ThemeManager } from '../services/theme-manager';
// biome-ignore lint/style/useImportType: TimerService is used as constructor parameter
import { TimerService } from '../services/timer-service';
import type { TimerData } from '../types';
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
  private sessionCounter: HTMLElement;

  constructor(config: TimerDisplayConfig) {
    this.container = config.container;
    this.timerService = config.timerService;
    this.themeManager = config.themeManager;
    this.timerFactory = config.timerFactory;

    // Create display elements
    this.displayContainer = this.createDisplayContainer();
    this.rendererContainer = this.createRendererContainer();
    this.timeDisplay = this.createTimeDisplay();
    this.sessionCounter = this.createSessionCounter();

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
    this.sessionCounter = this.createSessionCounter();

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

  private createSessionCounter(): HTMLElement {
    const sessionCounter = document.createElement('div');
    sessionCounter.className = 'timer-session-dots';
    sessionCounter.id = 'session-dots-container';

    // Create dots based on the long break interval (default 4)
    const totalSessions =
      this.timerService.getState().sessionsUntilLongBreak +
      this.timerService.getState().completedSessions;
    const maxSessions = Math.max(4, totalSessions); // Ensure at least 4 dots

    for (let i = 0; i < maxSessions; i++) {
      const dot = document.createElement('div');
      dot.className = 'timer-dot remaining';
      dot.dataset.sessionIndex = i.toString();
      sessionCounter.appendChild(dot);
    }

    return sessionCounter;
  }

  private render(): void {
    const isCloudlight = this.themeManager.getCurrentThemeName() === 'cloudlight';

    // Clear the display container first
    this.displayContainer.innerHTML = '';

    if (isCloudlight) {
      // Cloudlight theme layout with status components between clock and buttons
      this.container.className = '';

      // Add components in the cloudlight order: clock, time, session counter
      this.displayContainer.appendChild(this.rendererContainer);
      this.displayContainer.appendChild(this.timeDisplay);
      this.displayContainer.appendChild(this.sessionCounter);
    } else {
      this.container.className = 'flex flex-col items-center justify-center min-h-screen p-8';

      // Add all components to display container
      this.displayContainer.appendChild(this.rendererContainer);
      this.displayContainer.appendChild(this.timeDisplay);
      this.displayContainer.appendChild(this.sessionCounter);
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

    // Update session counters
    this.updateSessionCounters(data);

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

  private updateSessionCounters(data: TimerData): void {
    const dots = this.sessionCounter.querySelectorAll('.timer-dot');
    const totalSessions = data.completedSessions + data.sessionsUntilLongBreak;
    const currentSessionIndex = data.completedSessions;

    dots.forEach((dot, index) => {
      const dotElement = dot as HTMLElement;

      if (index < data.completedSessions) {
        // Completed sessions
        dotElement.className = 'timer-dot completed';
      } else if (
        index === currentSessionIndex &&
        (data.state === 'work' || data.state === 'short_break' || data.state === 'long_break')
      ) {
        // Current active session
        dotElement.className = 'timer-dot current';
      } else if (index < totalSessions) {
        // Remaining sessions
        dotElement.className = 'timer-dot remaining';
      } else {
        // Hide extra dots if any
        dotElement.style.display = 'none';
      }
    });
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private updateLabels(): void {
    // Update all text content when language changes
    if (this.currentData) {
      this.updateSessionCounters(this.currentData);
    } else {
      // Update with default values
      const data = this.timerService.getState();
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
