import type { DOMRendererConfig, RenderState, TimerRenderer } from '../../types/renderer-types';
import type { ThemeConfig } from '../../types/theme-types';

export class CloudlightDOMRenderer implements TimerRenderer {
  private container: HTMLElement;
  private clockFace!: HTMLElement;
  private hand!: HTMLElement;
  private centerDot!: HTMLElement;
  private initialized = false;
  private config: DOMRendererConfig;
  private renderState: RenderState;

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

  private initialize(): void {
    this.createDOMStructure();
    this.createTicks();
    this.initialized = true;
  }

  private createDOMStructure(): void {
    // Clear container
    this.container.innerHTML = '';

    // Remove any inner flex centering
    this.container.style.cssText = `
      position: relative;
      width: 320px;
      height: 320px;
    `;

    // Create outer ring (gray-200 border)
    const outerRing = document.createElement('div');
    outerRing.className = 'cloudlight-outer-ring';
    outerRing.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 8px solid #e5e7eb;
      background: linear-gradient(145deg, #ffffff, #e6e6e6);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create clock face (white inner circle with ticks)
    this.clockFace = document.createElement('div');
    this.clockFace.className = 'cloudlight-clock-face';
    this.clockFace.style.cssText = `
      position: relative;
      width: 95%;
      height: 95%;
      background: white;
      border-radius: 50%;
      border: 2px solid #e5e7eb;
    `;

    // Create the hand
    this.hand = document.createElement('div');
    this.hand.className = 'cloudlight-hand';
    this.hand.style.cssText = `
      position: absolute;
      bottom: 50%;
      left: 50%;
      width: 2px;
      height: 45%;
      background: #ef4444;
      transform-origin: bottom center;
      transform: translateX(-50%) rotate(0deg);
      border-radius: 1px;
      z-index: 10;
      transition: transform 1s linear;
    `;

    // Create center dot
    this.centerDot = document.createElement('div');
    this.centerDot.className = 'cloudlight-center-dot';
    this.centerDot.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 12px;
      background: #1f2937;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 20;
    `;

    // Assemble DOM structure
    this.clockFace.appendChild(this.hand);
    this.clockFace.appendChild(this.centerDot);
    outerRing.appendChild(this.clockFace);
    this.container.appendChild(outerRing);
  }

  public createTicks(_count: number = 100): void {
    if (!this.clockFace) return;

    // By reading offsetHeight, we trigger a reflow, ensuring that clientWidth
    // will be computed and not return 0.
    this.clockFace.offsetHeight;

    const radius = this.clockFace.clientWidth / 2;
    if (radius === 0) {
      // If the radius is still 0, it means the element is not visible,
      // so we can't draw the ticks.
      return;
    }

    // The center of the clock face's content area.
    const centerX = radius;
    const centerY = radius;

    // Create 100 tick marks like in the prototype
    for (let i = 0; i < 100; i++) {
      const tick = document.createElement('div');
      tick.className = 'cloudlight-tick';

      const isMajor = i % 10 === 0 || i === 50;
      const tickLength = isMajor ? 12 : 8;
      const tickWidth = isMajor ? 3 : 1;

      tick.style.cssText = `
        position: absolute;
        width: ${tickWidth}px;
        height: ${tickLength}px;
        background: ${isMajor ? '#1f2937' : '#9ca3af'};
      `;

      // Angle in radians with -90deg offset so i=0 is at top
      const angleRad = ((i * 3.6 - 90) * Math.PI) / 180;

      // Position the tick's center (r) so its outer edge is at the content radius.
      const r = radius - tickLength / 2;
      const cx = centerX + r * Math.cos(angleRad);
      const cy = centerY + r * Math.sin(angleRad);

      tick.style.left = `${cx}px`;
      tick.style.top = `${cy}px`;
      tick.style.transformOrigin = 'center center';
      tick.style.transform = `translate(-50%, -50%) rotate(${i * 3.6}deg)`;

      this.clockFace.appendChild(tick);
    }
  }

  private updateHand(progress: number): void {
    if (!this.hand) return;

    // Calculate rotation based on progress (0 to 1)
    // Progress 0 = 0 degrees (top), Progress 1 = 360 degrees (full rotation)
    const rotation = progress * 360;

    this.hand.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
  }

  render(progress: number, _theme: ThemeConfig): void {
    if (!this.initialized) return;

    this.renderState.progress = progress;
    this.renderState.isDirty = true;

    // Update hand position
    this.updateHand(progress);

    this.renderState.lastRenderTime = performance.now();
  }

  resize(width: number, height: number): void {
    const size = Math.min(width, height);
    this.container.style.width = `${size}px`;
    this.container.style.height = `${size}px`;

    this.config.width = width;
    this.config.height = height;
  }

  updateTime(timeString: string): void {
    this.renderState.timeString = timeString;
    // Time is displayed separately in the cloudlight theme
  }

  setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    if (this.hand) {
      if (isRunning) {
        this.hand.style.transition = 'transform 1s linear';
      } else {
        this.hand.style.transition = 'none';
      }
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
    this.clockFace = null!;
    this.hand = null!;
    this.centerDot = null!;
    this.initialized = false;
  }
}
