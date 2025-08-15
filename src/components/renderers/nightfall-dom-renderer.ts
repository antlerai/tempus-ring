import type { ThemeConfig } from '../../types/theme-types';
import { DOMRenderer } from './dom-renderer';

export class NightfallDOMRenderer extends DOMRenderer {
  private starField!: HTMLElement;
  private moonElement!: HTMLElement;
  private glowRing!: HTMLElement;
  private progressOrb!: HTMLElement;

  protected override createDOMStructure(): void {
    // Clear container
    this.container.innerHTML = '';

    // Set container class
    this.container.className = 'timer-container';

    // Create night sky background
    const nightSky = document.createElement('div');
    nightSky.className = 'nightfall-sky';

    // Create glow ring for progress
    this.glowRing = document.createElement('div');
    this.glowRing.className = 'nightfall-glow-ring';

    // Create inner container
    const innerContainer = document.createElement('div');
    innerContainer.className = 'nightfall-inner-container';

    // Create star field
    this.starField = document.createElement('div');
    this.starField.className = 'nightfall-stars';

    // Create moon element
    this.moonElement = document.createElement('div');
    this.moonElement.className = 'nightfall-moon';

    // Create progress orb (shooting star effect)
    this.progressOrb = document.createElement('div');
    this.progressOrb.className = 'nightfall-progress-orb';

    // Create tick container
    this.tickContainer = document.createElement('div');
    this.tickContainer.className = 'nightfall-ticks';

    // Generate stars
    this.createStars();

    // Assemble DOM structure
    innerContainer.appendChild(this.starField);
    innerContainer.appendChild(this.moonElement);
    innerContainer.appendChild(this.progressOrb);
    innerContainer.appendChild(this.tickContainer);
    this.glowRing.appendChild(innerContainer);
    nightSky.appendChild(this.glowRing);
    this.container.appendChild(nightSky);

    // Store reference for base class compatibility
    this.progressRing = this.progressOrb;
  }

  protected override setupStyles(): void {
    // Nightfall theme uses its own styling approach
    // Override parent implementation to avoid standard styles
  }

  private createStars(): void {
    if (!this.starField) return;

    // Create scattered stars
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.className = 'nightfall-star';

      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.8 + 0.2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;

      // Only set dynamic properties that can't be in CSS
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.opacity = `${opacity}`;
      star.style.boxShadow = `0 0 ${size * 2}px rgba(248, 250, 252, 0.8)`;

      // Add twinkling animation class
      if (Math.random() > 0.7) {
        star.classList.add('twinkle');
      }

      this.starField.appendChild(star);
    }
  }

  public override createTicks(count: number = 12): void {
    if (!this.tickContainer) return;

    // Force reflow to ensure proper dimensions
    this.tickContainer.offsetHeight;

    const radius = this.tickContainer.clientWidth / 2;
    if (radius === 0) return;

    const centerX = radius;
    const centerY = radius;

    // Create constellation-like hour markers
    for (let i = 0; i < count; i++) {
      const tick = document.createElement('div');
      const isMajor = i % 3 === 0; // Major ticks every 3 hours

      // Use CSS classes for styling
      tick.className = isMajor ? 'nightfall-tick major' : 'nightfall-tick minor';

      const tickSize = isMajor ? 4 : 2;

      // Only set dynamic properties that can't be in CSS
      tick.style.width = `${tickSize}px`;
      tick.style.height = `${tickSize}px`;

      // Angle calculation for 12-hour cycle
      const angleRad = ((i * 30 - 90) * Math.PI) / 180; // 30 degrees per hour

      // Position at edge of circle
      const r = radius - tickSize - 8;
      const cx = centerX + r * Math.cos(angleRad);
      const cy = centerY + r * Math.sin(angleRad);

      tick.style.left = `${cx - tickSize / 2}px`;
      tick.style.top = `${cy - tickSize / 2}px`;

      this.tickContainer.appendChild(tick);
    }
  }

  protected override updateProgressRing(progress: number): void {
    // Nightfall uses moving celestial bodies instead of a progress ring
    this.updateCelestialBodies(progress);
  }

  private updateCelestialBodies(progress: number): void {
    if (!this.moonElement || !this.progressOrb) return;

    // Moon moves in opposite direction (slower, more majestic)
    const moonRotation = -progress * 120; // Slower than progress orb
    this.moonElement.style.transform = `rotate(${moonRotation}deg)`;

    // Progress orb follows the timer progress
    const orbRotation = progress * 360 - 90; // Start from top
    this.progressOrb.style.transform = `rotate(${orbRotation}deg)`;

    // Create shooting star trail effect
    if (progress > 0 && this.renderState.isAnimating) {
      const trailLength = Math.min(progress * 20, 10);
      this.progressOrb.style.boxShadow = `
        0 0 15px #a855f7,
        -${trailLength}px 0 5px rgba(168, 85, 247, 0.5),
        -${trailLength * 2}px 0 3px rgba(168, 85, 247, 0.3)
      `;
    }
  }

  public override render(progress: number, _theme: ThemeConfig): void {
    if (!this.initialized) return;

    this.renderState.progress = progress;
    this.renderState.isDirty = true;

    // Update celestial bodies
    this.updateCelestialBodies(progress);

    // Update night sky intensity based on progress
    this.updateNightIntensity(progress);

    this.renderState.lastRenderTime = performance.now();
  }

  private updateNightIntensity(progress: number): void {
    if (!this.glowRing) return;

    // Intensify glow as time progresses
    const intensity = progress * 0.6 + 0.2; // 0.2 to 0.8
    this.glowRing.style.boxShadow = `
      inset 0 0 20px rgba(99, 102, 241, ${intensity}),
      0 0 30px rgba(99, 102, 241, ${intensity * 0.8})
    `;
  }

  public override setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    if (this.moonElement) {
      this.moonElement.style.transition = isRunning ? 'transform 1s linear' : 'none';
    }
    if (this.progressOrb) {
      this.progressOrb.style.transition = isRunning ? 'transform 1s linear' : 'none';
    }
  }

  public override updateTime(timeString: string): void {
    this.renderState.timeString = timeString;
    // Time display is handled separately in Nightfall theme
  }

  public override destroy(): void {
    // Call parent destroy
    super.destroy();

    // Clear additional references
    this.starField = null!;
    this.moonElement = null!;
    this.glowRing = null!;
    this.progressOrb = null!;
  }
}
