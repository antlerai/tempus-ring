import type { DOMRendererConfig, RenderState, TimerRenderer } from '../../types/renderer-types';
import type { ThemeConfig } from '../../types/theme-types';

export class DOMRenderer implements TimerRenderer {
  protected container: HTMLElement;
  protected progressRing!: HTMLElement;
  protected timeDisplay!: HTMLElement;
  protected tickContainer!: HTMLElement;
  protected initialized = false;
  protected config: DOMRendererConfig;
  protected renderState: RenderState;

  constructor(config: DOMRendererConfig) {
    this.config = config;
    this.container = config.container;
    this.renderState = {
      progress: 0,
      timeString: '25:00',
      isAnimating: false,
      isDirty: true,
      lastRenderTime: 0,
    };

    this.initialize();
  }

  protected initialize(): void {
    this.createDOMStructure();
    this.setupStyles();
    this.initialized = true;
  }

  protected createDOMStructure(): void {
    // Clear container
    this.container.innerHTML = '';

    // Create main wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'timer-renderer dom-renderer';
    wrapper.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create circular progress container
    const circleContainer = document.createElement('div');
    circleContainer.className = 'circle-container';
    circleContainer.style.cssText = `
      position: relative;
      width: var(--timer-size, 300px);
      height: var(--timer-size, 300px);
      border-radius: 50%;
    `;

    // Create progress ring background
    const ringBackground = document.createElement('div');
    ringBackground.className = 'ring-background';
    ringBackground.style.cssText = `
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: var(--ring-width, 8px) solid var(--ring-bg-color, #e5e5e5);
      transition: border-color 0.3s ease;
    `;

    // Create progress ring
    this.progressRing = document.createElement('div');
    this.progressRing.className = 'progress-ring';
    this.progressRing.style.cssText = `
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: var(--ring-width, 8px) solid transparent;
      border-top-color: var(--primary-color, #3b82f6);
      transform: rotate(-90deg);
      transition: transform 0.1s ease-out;
      background: conic-gradient(from -90deg, var(--primary-color, #3b82f6) 0%, transparent 0%);
      mask: radial-gradient(circle at center, transparent calc(50% - var(--ring-width, 8px)), black calc(50% - var(--ring-width, 8px)));
      -webkit-mask: radial-gradient(circle at center, transparent calc(50% - var(--ring-width, 8px)), black calc(50% - var(--ring-width, 8px)));
    `;

    // Create tick container
    this.tickContainer = document.createElement('div');
    this.tickContainer.className = 'tick-container';
    this.tickContainer.style.cssText = `
      position: absolute;
      inset: var(--ring-width, 8px);
      border-radius: 50%;
    `;

    // Create time display
    this.timeDisplay = document.createElement('div');
    this.timeDisplay.className = 'time-display';
    this.timeDisplay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: var(--time-font-size, 2rem);
      font-weight: 600;
      color: var(--text-color, #1f2937);
      text-align: center;
      user-select: none;
      font-family: var(--font-mono, monospace);
    `;
    this.timeDisplay.textContent = '25:00';

    // Assemble DOM structure
    circleContainer.appendChild(ringBackground);
    circleContainer.appendChild(this.progressRing);
    circleContainer.appendChild(this.tickContainer);
    circleContainer.appendChild(this.timeDisplay);
    wrapper.appendChild(circleContainer);
    this.container.appendChild(wrapper);
  }

  protected setupStyles(): void {
    // Apply theme-based CSS custom properties
    const theme = this.config.theme;
    const cssVariables = {
      '--timer-size': '300px',
      '--ring-width': '8px',
      '--primary-color': theme.colors.primary,
      '--ring-bg-color': theme.colors.secondary,
      '--text-color': theme.colors.text,
      '--background-color': theme.colors.background,
      '--time-font-size': '2rem',
      '--font-mono': theme.fonts.mono,
    };

    for (const [prop, value] of Object.entries(cssVariables)) {
      this.container.style.setProperty(prop, value);
    }
  }

  protected createTickElement(angle: number, isLarge: boolean): HTMLElement {
    const tick = document.createElement('div');
    tick.className = isLarge ? 'tick tick-large' : 'tick tick-small';

    const length = isLarge ? '12px' : '6px';
    const width = isLarge ? '2px' : '1px';

    tick.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, 0) rotate(${angle}deg);
      width: ${width};
      height: ${length};
      background: var(--text-color, #6b7280);
      transform-origin: center ${150 - 8}px;
      opacity: ${isLarge ? '0.8' : '0.4'};
    `;

    return tick;
  }

  protected updateProgressRing(progress: number): void {
    const percentage = Math.min(Math.max(progress, 0), 1) * 100;

    // Update conic-gradient background
    this.progressRing.style.background = `conic-gradient(
      from -90deg,
      var(--primary-color, #3b82f6) ${percentage}%,
      transparent ${percentage}%
    )`;
  }

  render(progress: number, theme: ThemeConfig): void {
    if (!this.initialized) return;

    this.renderState.progress = progress;
    this.renderState.isDirty = true;

    // Update theme if changed
    if (theme.name !== this.config.theme.name) {
      this.config.theme = theme;
      this.setupStyles();
    }

    // Update progress ring
    this.updateProgressRing(progress);

    this.renderState.lastRenderTime = performance.now();
  }

  resize(width: number, height: number): void {
    const size = Math.min(width, height) * 0.8;
    this.container.style.setProperty('--timer-size', `${size}px`);

    this.config.width = width;
    this.config.height = height;
  }

  updateTime(timeString: string): void {
    this.renderState.timeString = timeString;
    if (this.timeDisplay) {
      this.timeDisplay.textContent = timeString;
    }
  }

  setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    if (this.progressRing) {
      if (isRunning) {
        this.progressRing.style.transition = 'none';
      } else {
        this.progressRing.style.transition = 'transform 0.1s ease-out';
      }
    }
  }

  createTicks(count: number = 100): void {
    if (!this.tickContainer || !this.initialized) return;

    // Clear existing ticks
    this.tickContainer.innerHTML = '';

    const angleIncrement = 360 / count;

    for (let i = 0; i < count; i++) {
      const angle = i * angleIncrement;
      const isLargeTick = i % (count / 12) === 0; // 12 major ticks

      const tick = this.createTickElement(angle, isLargeTick);
      this.tickContainer.appendChild(tick);
    }
  }

  getType(): 'dom' | 'svg' | 'canvas' {
    return 'dom';
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear references
    this.progressRing = null!;
    this.timeDisplay = null!;
    this.tickContainer = null!;
    this.initialized = false;
  }
}
