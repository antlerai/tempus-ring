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

      // Use CSS classes for styling
      tick.className = isMajor ? 'cloudlight-tick major' : 'cloudlight-tick';

      const tickLength = isMajor ? 12 : 8;
      const tickWidth = isMajor ? 3 : 1;

      // Set size using inline styles (dimensions need to be dynamic)
      tick.style.width = `${tickWidth}px`;
      tick.style.height = `${tickLength}px`;

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

  protected override updateProgressRing(progress: number): void {
    // Cloudlight uses a rotating hand instead of a progress ring
    this.updateHand(progress);
  }

  private updateHand(progress: number): void {
    if (!this.hand) return;

    // Calculate rotation based on progress (0 to 1)
    // Progress 0 = 0 degrees (top), Progress 1 = 360 degrees (full rotation)
    const rotation = progress * 360;

    this.hand.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
  }

  public override render(progress: number, _theme: ThemeConfig): void {
    if (!this.initialized) return;

    this.renderState.progress = progress;
    this.renderState.isDirty = true;

    // Update hand position (instead of progress ring)
    this.updateHand(progress);

    // Apply dynamic styling based on progress for enhanced visual feedback
    this.updateProgressStyling(progress);

    this.renderState.lastRenderTime = performance.now();
  }

  private updateProgressStyling(progress: number): void {
    if (!this.hand || !this.centerDot) return;

    // Subtle color transition for the hand based on progress
    const intensity = Math.min(1, progress * 1.2); // Slightly more intense than linear
    const handColor = `hsl(0, ${Math.round(60 + intensity * 20)}%, ${Math.round(55 - intensity * 10)}%)`;

    this.hand.style.background = handColor;
    this.hand.style.boxShadow = `0 1px 2px rgba(239, 68, 68, ${0.3 + intensity * 0.2})`;

    // Subtle pulsing effect for center dot when near completion
    if (progress > 0.9) {
      this.centerDot.style.animation = 'pulse 1s ease-in-out infinite';
    } else {
      this.centerDot.style.animation = 'none';
    }
  }

  public override setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    if (this.hand) {
      if (isRunning) {
        this.hand.style.transition = 'transform 1s linear';
      } else {
        this.hand.style.transition = 'none';
      }
    }
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
