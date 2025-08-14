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

    // Set container styles for Nightfall theme
    this.container.style.cssText = `
      position: relative;
      width: 320px;
      height: 320px;
    `;

    // Create night sky background
    const nightSky = document.createElement('div');
    nightSky.className = 'nightfall-sky';
    nightSky.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(circle at center, 
        #1e1b4b 0%,
        #312e81 30%, 
        #1e1b4b 60%, 
        #0f172a 100%);
      border: 8px solid #6366f1;
      box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
    `;

    // Create glow ring for progress
    this.glowRing = document.createElement('div');
    this.glowRing.className = 'nightfall-glow-ring';
    this.glowRing.style.cssText = `
      position: absolute;
      width: 95%;
      height: 95%;
      border-radius: 50%;
      border: 3px solid transparent;
      background: linear-gradient(#1e1b4b, #312e81) padding-box,
                  linear-gradient(45deg, #6366f1, #8b5cf6, #a855f7) border-box;
      margin: auto;
      margin-top: 2.5%;
    `;

    // Create inner container
    const innerContainer = document.createElement('div');
    innerContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create star field
    this.starField = document.createElement('div');
    this.starField.className = 'nightfall-stars';
    this.starField.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    `;

    // Create moon element
    this.moonElement = document.createElement('div');
    this.moonElement.className = 'nightfall-moon';
    this.moonElement.style.cssText = `
      position: absolute;
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 50%;
      box-shadow: 
        0 0 20px rgba(248, 250, 252, 0.8),
        inset -5px -5px 0 rgba(0, 0, 0, 0.1);
      transform-origin: center 115px;
      transition: transform 1s linear;
    `;

    // Create progress orb (shooting star effect)
    this.progressOrb = document.createElement('div');
    this.progressOrb.className = 'nightfall-progress-orb';
    this.progressOrb.style.cssText = `
      position: absolute;
      width: 6px;
      height: 6px;
      background: radial-gradient(circle, #a855f7, #6366f1);
      border-radius: 50%;
      box-shadow: 0 0 15px #a855f7;
      transform-origin: center 140px;
      transition: transform 1s linear;
    `;

    // Create tick container
    this.tickContainer = document.createElement('div');
    this.tickContainer.className = 'nightfall-ticks';
    this.tickContainer.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    `;

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

      star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: #f8fafc;
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        opacity: ${opacity};
        box-shadow: 0 0 ${size * 2}px rgba(248, 250, 252, 0.8);
      `;

      // Add twinkling animation
      if (Math.random() > 0.7) {
        star.style.animation = `twinkle ${2 + Math.random() * 3}s infinite`;
      }

      this.starField.appendChild(star);
    }

    // Add CSS animation for twinkling
    if (!document.getElementById('nightfall-animations')) {
      const style = document.createElement('style');
      style.id = 'nightfall-animations';
      style.textContent = `
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `;
      document.head.appendChild(style);
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
      tick.className = 'nightfall-tick';

      const isMajor = i % 3 === 0; // Major ticks every 3 hours
      const tickSize = isMajor ? 4 : 2;

      tick.style.cssText = `
        position: absolute;
        width: ${tickSize}px;
        height: ${tickSize}px;
        background: ${isMajor ? '#f8fafc' : '#8b5cf6'};
        border-radius: 50%;
        box-shadow: 0 0 ${tickSize * 3}px ${isMajor ? 'rgba(248, 250, 252, 0.8)' : 'rgba(139, 92, 246, 0.6)'};
      `;

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
    // Remove animation styles
    const animationStyle = document.getElementById('nightfall-animations');
    if (animationStyle) {
      animationStyle.remove();
    }

    // Call parent destroy
    super.destroy();

    // Clear additional references
    this.starField = null!;
    this.moonElement = null!;
    this.glowRing = null!;
    this.progressOrb = null!;
  }
}
