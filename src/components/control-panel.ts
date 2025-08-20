import { i18n } from '../i18n';
// biome-ignore lint/style/useImportType: ThemeManager is used as constructor parameter
import { ThemeManager } from '../services/theme-manager';
// biome-ignore lint/style/useImportType: TimerService is used as constructor parameter
import { TimerService } from '../services/timer-service';
import type { ThemeConfig, TimerData, TimerState } from '../types';
import { TimerState as TimerStateEnum } from '../types';
import { IconManager } from '../utils/icons';

export interface ControlPanelConfig {
  container: HTMLElement;
  timerService: TimerService;
  themeManager: ThemeManager;
  onStateChange?: (state: TimerState) => void;
}

export class ControlPanel {
  private container: HTMLElement;
  private timerService: TimerService;
  private themeManager: ThemeManager;
  private onStateChange: ((state: TimerState) => void) | undefined;
  private currentState: TimerState = TimerStateEnum.IDLE;
  private iconManager: IconManager;
  private currentTheme: ThemeConfig;

  private startButton!: HTMLButtonElement;
  private pauseButton!: HTMLButtonElement;
  private resetButton!: HTMLButtonElement;

  constructor(config: ControlPanelConfig) {
    this.container = config.container;
    this.timerService = config.timerService;
    this.themeManager = config.themeManager;
    this.onStateChange = config.onStateChange;
    this.iconManager = IconManager.getInstance();
    this.currentTheme = this.themeManager.getCurrentTheme();

    this.createButtons();
    this.render();
    this.attachEventListeners();
    this.setupTimerEventListeners();
    this.setupThemeEventListeners();
    this.updateButtons();
    this.updateLabels();

    // Listen for locale changes
    window.addEventListener('localeChange', () => {
      this.updateLabels();
    });
  }

  private createButtons(): void {
    const buttonLayout = this.currentTheme.controlPanel?.buttonLayout || 'standard';
    const buttonClass =
      buttonLayout === 'minimal' ? 'timer-button-minimal' : 'timer-button-standard';

    this.startButton = this.createElement('button', 'start-btn', buttonClass);
    this.pauseButton = this.createElement('button', 'pause-btn', `${buttonClass} pause`);
    this.resetButton = this.createElement('button', 'reset-btn', `${buttonClass} reset`);
  }

  private createElement(tag: string, id: string, className: string): HTMLButtonElement {
    const element = document.createElement(tag) as HTMLButtonElement;
    element.id = id;
    element.className = className;
    return element;
  }

  private render(): void {
    const buttonLayout = this.currentTheme.controlPanel?.buttonLayout || 'standard';

    // Clear container first
    this.container.innerHTML = '';

    // Apply appropriate container class based on button layout
    if (buttonLayout === 'minimal') {
      this.container.className = 'control-panel-minimal';

      // Minimal layout: reset, start/pause buttons only
      this.container.appendChild(this.resetButton);
      this.container.appendChild(this.startButton);
      this.container.appendChild(this.pauseButton);
    } else {
      this.container.className = 'control-panel-standard';

      // Standard layout: all buttons in a container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'control-buttons';

      buttonContainer.appendChild(this.startButton);
      buttonContainer.appendChild(this.pauseButton);
      buttonContainer.appendChild(this.resetButton);

      this.container.appendChild(buttonContainer);
    }
  }

  private attachEventListeners(): void {
    this.startButton.addEventListener('click', () => {
      this.handleStart();
    });

    this.pauseButton.addEventListener('click', () => {
      this.handlePause();
    });

    this.resetButton.addEventListener('click', () => {
      this.handleReset();
    });
  }

  private setupTimerEventListeners(): void {
    this.timerService.on('timer:stateChange', ({ to }) => {
      this.currentState = to;
      this.updateButtons();
      this.onStateChange?.(to);
    });

    this.timerService.on('timer:tick', (data: TimerData) => {
      this.currentState = data.state;
      this.updateButtons();
    });

    this.timerService.on('timer:sessionStart', () => {
      this.updateButtons();
    });

    this.timerService.on('timer:sessionComplete', () => {
      this.updateButtons();
    });

    this.timerService.on('timer:pause', () => {
      this.updateButtons();
    });

    this.timerService.on('timer:resume', () => {
      this.updateButtons();
    });

    this.timerService.on('timer:reset', () => {
      this.updateButtons();
    });
  }

  private setupThemeEventListeners(): void {
    this.themeManager.on('theme:changed', () => {
      this.currentTheme = this.themeManager.getCurrentTheme();
      this.recreateButtons();
      this.render();
      this.updateButtons();
      this.updateLabels();
    });
  }

  private recreateButtons(): void {
    // Create new buttons with updated theme styles
    this.createButtons();

    // Re-attach event listeners to new buttons
    this.attachEventListeners();
  }

  private handleStart(): void {
    try {
      this.timerService.start();
    } catch (error) {
      console.error('Error starting timer:', error);
      // Could emit error event here for UI feedback
    }
  }

  private handlePause(): void {
    try {
      if (this.currentState === TimerStateEnum.PAUSED) {
        this.timerService.resume();
      } else {
        this.timerService.pause();
      }
    } catch (error) {
      console.error('Error pausing/resuming timer:', error);
    }
  }

  private handleReset(): void {
    try {
      this.timerService.reset();
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  }

  private updateButtons(): void {
    const states = this.getButtonStates();
    const buttonLayout = this.currentTheme.controlPanel?.buttonLayout || 'standard';

    if (buttonLayout === 'minimal') {
      this.updateMinimalButtons(states);
    } else {
      this.updateStandardButtons(states);
    }

    this.updatePauseButton(states.isPaused, buttonLayout);
    this.iconManager.refreshIcons();
  }

  private getButtonStates() {
    const isIdle = this.currentState === TimerStateEnum.IDLE;
    const isRunning =
      this.currentState === TimerStateEnum.WORK ||
      this.currentState === TimerStateEnum.SHORT_BREAK ||
      this.currentState === TimerStateEnum.LONG_BREAK;
    const isPaused = this.currentState === TimerStateEnum.PAUSED;

    return { isIdle, isRunning, isPaused };
  }

  private updateMinimalButtons(states: {
    isIdle: boolean;
    isRunning: boolean;
    isPaused: boolean;
  }): void {
    this.startButton.style.display = states.isIdle || states.isPaused ? 'block' : 'none';
    this.pauseButton.style.display = states.isRunning ? 'block' : 'none';
    this.resetButton.disabled = states.isIdle;

    if (states.isPaused) {
      this.startButton.style.display = 'block';
      this.pauseButton.style.display = 'none';
    }
  }

  private updateStandardButtons(states: {
    isIdle: boolean;
    isRunning: boolean;
    isPaused: boolean;
  }): void {
    this.startButton.disabled = !states.isIdle && !states.isPaused;
    this.startButton.style.display = states.isIdle || states.isPaused ? 'block' : 'none';

    this.pauseButton.disabled = !states.isRunning && !states.isPaused;
    this.pauseButton.style.display = states.isRunning || states.isPaused ? 'block' : 'none';

    this.resetButton.disabled = states.isIdle;
  }

  private updatePauseButton(isPaused: boolean, buttonLayout: string): void {
    const showLabels = this.currentTheme.controlPanel?.showLabels !== false;
    const iconSize = buttonLayout === 'minimal' ? 'w-6 h-6' : 'w-4 h-4';

    // Update button content based on state and theme preferences
    if (buttonLayout === 'minimal' || !showLabels) {
      this.pauseButton.innerHTML = isPaused
        ? `<i data-lucide="play" class="${iconSize}"></i>`
        : `<i data-lucide="pause" class="${iconSize}"></i>`;
    } else {
      if (isPaused) {
        this.pauseButton.innerHTML = `<i data-lucide="play" class="${iconSize}"></i><span>${i18n.t('timer.controls.resume')}</span>`;
        // Add resume class for styling
        this.pauseButton.classList.add('resume');
      } else {
        this.pauseButton.innerHTML = `<i data-lucide="pause" class="${iconSize}"></i><span>${i18n.t('timer.controls.pause')}</span>`;
        // Remove resume class
        this.pauseButton.classList.remove('resume');
      }
    }
  }

  private updateLabels(): void {
    const buttonLayout = this.currentTheme.controlPanel?.buttonLayout || 'standard';
    const showLabels = this.currentTheme.controlPanel?.showLabels !== false;
    const iconSize = buttonLayout === 'minimal' ? 'w-6 h-6' : 'w-4 h-4';

    // Update button content based on theme preferences
    if (buttonLayout === 'minimal' || !showLabels) {
      // Icon-only buttons
      this.startButton.innerHTML = `<i data-lucide="play" class="${iconSize}"></i>`;
      this.resetButton.innerHTML = `<i data-lucide="rotate-cw" class="${iconSize}"></i>`;
    } else {
      // Buttons with icons and labels
      this.startButton.innerHTML = `<i data-lucide="play" class="${iconSize}"></i><span>${i18n.t('timer.controls.start')}</span>`;
      this.resetButton.innerHTML = `<i data-lucide="square" class="${iconSize}"></i><span>${i18n.t('timer.controls.reset')}</span>`;
    }

    // Pause/Resume text is updated in updateButtons()
    this.updateButtons();

    // Refresh icons after content update
    this.iconManager.refreshIcons();
  }

  public updateState(timerData: TimerData): void {
    this.currentState = timerData.state;
    this.updateButtons();
  }

  public destroy(): void {
    window.removeEventListener('localeChange', () => {
      this.updateLabels();
    });

    // Remove all event listeners from buttons
    this.startButton.replaceWith(this.startButton.cloneNode(true));
    this.pauseButton.replaceWith(this.pauseButton.cloneNode(true));
    this.resetButton.replaceWith(this.resetButton.cloneNode(true));

    this.container.innerHTML = '';
  }
}
