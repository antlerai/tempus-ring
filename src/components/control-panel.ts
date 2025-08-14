import { i18n } from '../i18n';
// biome-ignore lint/style/useImportType: TimerService is used as constructor parameter
import { TimerService } from '../services/timer-service';
import type { TimerData, TimerState } from '../types';
import { TimerState as TimerStateEnum } from '../types';
import { IconManager } from '../utils/icons';

export interface ControlPanelConfig {
  container: HTMLElement;
  timerService: TimerService;
  onStateChange?: (state: TimerState) => void;
}

export class ControlPanel {
  private container: HTMLElement;
  private timerService: TimerService;
  private onStateChange: ((state: TimerState) => void) | undefined;
  private currentState: TimerState = TimerStateEnum.IDLE;
  private iconManager: IconManager;

  private startButton: HTMLButtonElement;
  private pauseButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;

  constructor(config: ControlPanelConfig) {
    this.container = config.container;
    this.timerService = config.timerService;
    this.onStateChange = config.onStateChange;
    this.iconManager = IconManager.getInstance();

    this.startButton = this.createElement(
      'button',
      'start-btn',
      'bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
    );
    this.pauseButton = this.createElement(
      'button',
      'pause-btn',
      'bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
    );
    this.resetButton = this.createElement(
      'button',
      'reset-btn',
      'bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
    );

    this.render();
    this.attachEventListeners();
    this.setupTimerEventListeners();
    this.updateButtons();
    this.updateLabels();

    // Listen for locale changes
    window.addEventListener('localeChange', () => {
      this.updateLabels();
    });
  }

  private createElement(tag: string, id: string, className: string): HTMLButtonElement {
    const element = document.createElement(tag) as HTMLButtonElement;
    element.id = id;
    element.className = className;
    return element;
  }

  private render(): void {
    // Check if using cloudlight theme for different button styling
    const isCloudlight = document.body.classList.contains('theme-cloudlight');

    if (isCloudlight) {
      // Cloudlight minimal design - just two buttons
      this.container.className = 'flex items-center justify-center gap-4';

      // Update button styles for cloudlight - matches prototype
      const buttonStyle =
        'flex items-center justify-center w-16 h-16 rounded-full border-2 border-gray-300 text-gray-500 transition-all duration-200 ease-out hover:border-gray-400 hover:text-gray-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

      this.resetButton.className = buttonStyle;
      this.startButton.className = buttonStyle;
      this.pauseButton.className = buttonStyle;

      // Only show reset and start/pause buttons - reset comes first like in prototype
      this.container.appendChild(this.resetButton);
      this.container.appendChild(this.startButton);
      this.container.appendChild(this.pauseButton);
    } else {
      this.container.className =
        'flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto';

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex gap-3 justify-center w-full';

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
    const isCloudlight = document.body.classList.contains('theme-cloudlight');

    if (isCloudlight) {
      this.updateCloudlightButtons(states);
    } else {
      this.updateStandardButtons(states);
    }

    this.updatePauseButton(states.isPaused, isCloudlight);
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

  private updateCloudlightButtons(states: {
    isIdle: boolean;
    isRunning: boolean;
    isPaused: boolean;
  }): void {
    this.startButton.style.display = states.isIdle || states.isPaused ? 'flex' : 'none';
    this.pauseButton.style.display = states.isRunning ? 'flex' : 'none';
    this.resetButton.disabled = states.isIdle;

    if (states.isPaused) {
      this.startButton.style.display = 'flex';
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

  private updatePauseButton(isPaused: boolean, isCloudlight: boolean): void {
    if (isCloudlight) {
      this.pauseButton.innerHTML = isPaused
        ? '<i data-lucide="play" class="w-8 h-8"></i>'
        : '<i data-lucide="pause" class="w-8 h-8"></i>';
    } else {
      if (isPaused) {
        this.pauseButton.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i><span>${i18n.t('timer.controls.resume')}</span>`;
        this.pauseButton.className =
          'bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';
      } else {
        this.pauseButton.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i><span>${i18n.t('timer.controls.pause')}</span>`;
        this.pauseButton.className =
          'bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';
      }
    }
  }

  private updateLabels(): void {
    const isCloudlight = document.body.classList.contains('theme-cloudlight');

    if (isCloudlight) {
      // Cloudlight uses only icons, no text
      this.startButton.innerHTML = '<i data-lucide="play" class="w-8 h-8"></i>';
      this.resetButton.innerHTML = '<i data-lucide="rotate-cw" class="w-8 h-8"></i>';
    } else {
      this.startButton.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i><span>${i18n.t('timer.controls.start')}</span>`;
      this.resetButton.innerHTML = `<i data-lucide="square" class="w-4 h-4"></i><span>${i18n.t('timer.controls.reset')}</span>`;
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
