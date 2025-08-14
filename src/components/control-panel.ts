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
    this.container.className =
      'flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-3 justify-center w-full';

    buttonContainer.appendChild(this.startButton);
    buttonContainer.appendChild(this.pauseButton);
    buttonContainer.appendChild(this.resetButton);

    this.container.appendChild(buttonContainer);
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
    const isIdle = this.currentState === TimerStateEnum.IDLE;
    const isRunning =
      this.currentState === TimerStateEnum.WORK ||
      this.currentState === TimerStateEnum.SHORT_BREAK ||
      this.currentState === TimerStateEnum.LONG_BREAK;
    const isPaused = this.currentState === TimerStateEnum.PAUSED;

    // Start button - visible when idle or paused
    this.startButton.disabled = !isIdle && !isPaused;
    this.startButton.style.display = isIdle || isPaused ? 'block' : 'none';

    // Pause button - visible when running, shows "Resume" when paused
    this.pauseButton.disabled = !isRunning && !isPaused;
    this.pauseButton.style.display = isRunning || isPaused ? 'block' : 'none';

    // Reset button - always available except when idle
    this.resetButton.disabled = isIdle;

    // Update pause/resume button text and icon
    if (isPaused) {
      this.pauseButton.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i><span>${i18n.t('timer.controls.resume')}</span>`;
      this.pauseButton.className =
        'bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';
    } else {
      this.pauseButton.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i><span>${i18n.t('timer.controls.pause')}</span>`;
      this.pauseButton.className =
        'bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';
    }

    // Refresh icons after content update
    this.iconManager.refreshIcons();
  }

  private updateLabels(): void {
    this.startButton.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i><span>${i18n.t('timer.controls.start')}</span>`;
    this.resetButton.innerHTML = `<i data-lucide="square" class="w-4 h-4"></i><span>${i18n.t('timer.controls.reset')}</span>`;

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
