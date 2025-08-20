import type { ThemeConfig } from '../../types/theme-types';
import { DOMRenderer } from './dom-renderer';

export class CloudlightDOMRenderer extends DOMRenderer {
  private clockFace!: HTMLElement;
  private hand!: HTMLElement;
  private centerDot!: HTMLElement;

  protected override createDOMStructure(): void {
    // Clear container
    this.container.innerHTML = '';

    // Set container size using CSS class
    this.container.className = 'timer-container';

    // Create outer ring using CSS class
    const outerRing = document.createElement('div');
    outerRing.className = 'cloudlight-outer-ring';

    // Create clock face using CSS class
    this.clockFace = document.createElement('div');
    this.clockFace.className = 'cloudlight-clock-face';

    // Create the hand using CSS class
    this.hand = document.createElement('div');
    this.hand.className = 'cloudlight-hand';

    // Create center dot using CSS class
    this.centerDot = document.createElement('div');
    this.centerDot.className = 'cloudlight-center-dot';

    // Store reference to tickContainer as clockFace for base class compatibility
    this.tickContainer = this.clockFace;

    // Assemble DOM structure
    this.clockFace.appendChild(this.hand);
    this.clockFace.appendChild(this.centerDot);
    outerRing.appendChild(this.clockFace);
    this.container.appendChild(outerRing);
  }

  protected override setupStyles(): void {
    // Cloudlight theme uses inline styles instead of CSS variables
    // Override parent implementation to avoid applying standard styles
  }

  public override createTicks(_count: number = 100): void {
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
      const isMajor = i % 10 === 0 || i === 50;

      // Use CSS classes for styling - no inline styles for appearance
      tick.className = isMajor ? 'cloudlight-tick major' : 'cloudlight-tick';

      // Set data attributes for CSS to use
      tick.dataset.tickIndex = i.toString();
      tick.dataset.tickType = isMajor ? 'major' : 'minor';

      const tickLength = isMajor ? 12 : 8;
      const tickWidth = isMajor ? 3 : 1;

      // Only set size using CSS custom properties, not inline styles
      tick.style.setProperty('--tick-width', `${tickWidth}px`);
      tick.style.setProperty('--tick-height', `${tickLength}px`);

      // Angle in radians with -90deg offset so i=0 is at top
      const angleRad = ((i * 3.6 - 90) * Math.PI) / 180;

      // Position the tick's center (r) so its outer edge is at the content radius.
      const r = radius - tickLength / 2;
      const cx = centerX + r * Math.cos(angleRad);
      const cy = centerY + r * Math.sin(angleRad);

      // Use CSS custom properties for positioning
      tick.style.setProperty('--tick-x', `${cx}px`);
      tick.style.setProperty('--tick-y', `${cy}px`);
      tick.style.setProperty('--tick-rotation', `${i * 3.6}deg`);

      this.clockFace.appendChild(tick);
    }
  }

  protected override updateProgressRing(progress: number): void {
    // Cloudlight uses a rotating hand instead of a progress ring
    this.updateHand(progress);
  }

  private updateHand(progress: number): void {
    if (!this.hand) return;

    // Calculate rotation based on progress (0 to 1)
    // Progress 0 = 0 degrees (top), Progress 1 = 360 degrees (full rotation)
    const rotation = progress * 360;

    // Use CSS custom properties instead of direct style manipulation
    this.hand.style.setProperty('--rotation', `${rotation}deg`);
    this.hand.classList.add('timer-progress-dynamic');
  }

  public override render(progress: number, _theme: ThemeConfig): void {
    if (!this.initialized) return;

    this.renderState.progress = progress;
    this.renderState.isDirty = true;

    // Update hand position (instead of progress ring)
    this.updateHand(progress);

    // Use CSS variables and data attributes for dynamic styling
    this.updateProgressVariables(progress);

    this.renderState.lastRenderTime = performance.now();
  }

  private updateProgressVariables(progress: number): void {
    if (!this.hand || !this.centerDot) return;

    // Set CSS variables for dynamic styling instead of direct manipulation
    const intensity = Math.min(1, progress * 1.2);

    // Update CSS custom properties for intensity-based effects
    this.container.style.setProperty('--progress', progress.toString());
    this.container.style.setProperty('--intensity', intensity.toString());

    // Use data attributes for state-based styling
    this.centerDot.dataset.progress = Math.round(progress * 100).toString();

    // Add CSS classes for intensity effects
    this.hand.classList.toggle('timer-intensity-effects', intensity > 0);

    // Near completion state
    if (progress > 0.9) {
      this.centerDot.classList.add('animate-pulse-glow');
    } else {
      this.centerDot.classList.remove('animate-pulse-glow');
    }
  }

  public override setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    // Use data attributes and CSS classes instead of direct style manipulation
    if (this.hand) {
      this.hand.dataset.animationState = isRunning ? 'running' : 'paused';
      this.hand.classList.toggle('animate-gpu', isRunning);
    }

    // Set state on container for global CSS rules
    this.container.dataset.timerState = isRunning ? 'running' : 'paused';
  }

  public override updateTime(timeString: string): void {
    this.renderState.timeString = timeString;
    // Time is displayed separately in the cloudlight theme
    // Don't update timeDisplay as it doesn't exist in this structure
  }

  public override destroy(): void {
    // Call parent destroy
    super.destroy();

    // Clear additional references
    this.clockFace = null!;
    this.hand = null!;
    this.centerDot = null!;
  }
}
