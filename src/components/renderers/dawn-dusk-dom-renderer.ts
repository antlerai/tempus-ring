import type { ThemeConfig } from '../../types/theme-types';
import { DOMRenderer } from './dom-renderer';

export class DawnDuskDOMRenderer extends DOMRenderer {
  private gradientContainer!: HTMLElement;
  private sunElement!: HTMLElement;
  private skyGradient!: HTMLElement;

  protected override createDOMStructure(): void {
    // Clear container
    this.container.innerHTML = '';

    // Set container styles for Dawn & Dusk theme
    this.container.style.cssText = `
      position: relative;
      width: 320px;
      height: 320px;
    `;

    // Create sky gradient background
    this.skyGradient = document.createElement('div');
    this.skyGradient.className = 'dawn-dusk-sky';
    this.skyGradient.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(180deg, 
        #fef3c7 0%,
        #fbbf24 30%, 
        #f59e0b 60%, 
        #d97706 100%);
      border: 8px solid #f59e0b;
    `;

    // Create gradient container for progress
    this.gradientContainer = document.createElement('div');
    this.gradientContainer.className = 'dawn-dusk-gradient-container';
    this.gradientContainer.style.cssText = `
      position: relative;
      width: 95%;
      height: 95%;
      border-radius: 50%;
      background: linear-gradient(45deg, 
        rgba(254, 243, 199, 0.9),
        rgba(251, 191, 36, 0.9));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: auto;
      margin-top: 2.5%;
    `;

    // Create sun element
    this.sunElement = document.createElement('div');
    this.sunElement.className = 'dawn-dusk-sun';
    this.sunElement.style.cssText = `
      position: absolute;
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, #fbbf24 0%, #f59e0b 70%);
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
      transform-origin: center 130px;
      transition: transform 1s linear;
    `;

    // Create tick container
    this.tickContainer = document.createElement('div');
    this.tickContainer.className = 'dawn-dusk-ticks';
    this.tickContainer.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    `;

    // Assemble DOM structure
    this.gradientContainer.appendChild(this.sunElement);
    this.gradientContainer.appendChild(this.tickContainer);
    this.skyGradient.appendChild(this.gradientContainer);
    this.container.appendChild(this.skyGradient);

    // Store reference for base class compatibility
    this.progressRing = this.sunElement;
  }

  protected override setupStyles(): void {
    // Dawn & Dusk theme uses its own styling approach
    // Override parent implementation to avoid standard styles
  }

  public override createTicks(count: number = 24): void {
    if (!this.tickContainer) return;

    // Force reflow to ensure proper dimensions
    this.tickContainer.offsetHeight;

    const radius = this.tickContainer.clientWidth / 2;
    if (radius === 0) return;

    const centerX = radius;
    const centerY = radius;

    // Create hour markers (24 for full day cycle)
    for (let i = 0; i < count; i++) {
      const tick = document.createElement('div');
      tick.className = 'dawn-dusk-tick';

      const isMajor = i % 6 === 0; // Major ticks every 6 hours
      const tickLength = isMajor ? 16 : 10;
      const tickWidth = isMajor ? 3 : 2;

      tick.style.cssText = `
        position: absolute;
        width: ${tickWidth}px;
        height: ${tickLength}px;
        background: ${isMajor ? '#92400e' : '#d97706'};
        border-radius: 1px;
      `;

      // Angle calculation for 24-hour cycle
      const angleRad = ((i * 15 - 90) * Math.PI) / 180; // 15 degrees per hour

      // Position at edge of circle
      const r = radius - tickLength / 2 - 4;
      const cx = centerX + r * Math.cos(angleRad);
      const cy = centerY + r * Math.sin(angleRad);

      tick.style.left = `${cx}px`;
      tick.style.top = `${cy}px`;
      tick.style.transformOrigin = 'center center';
      tick.style.transform = `translate(-50%, -50%) rotate(${i * 15}deg)`;

      this.tickContainer.appendChild(tick);
    }
  }

  protected override updateProgressRing(progress: number): void {
    // Dawn & Dusk uses a moving sun instead of a progress ring
    this.updateSunPosition(progress);
  }

  private updateSunPosition(progress: number): void {
    if (!this.sunElement) return;

    // Calculate sun position based on progress (dawn to dusk arc)
    // Progress 0 = dawn (left), Progress 1 = dusk (right)
    const rotation = progress * 180 - 90; // -90 to +90 degrees

    this.sunElement.style.transform = `rotate(${rotation}deg)`;
  }

  public override render(progress: number, _theme: ThemeConfig): void {
    if (!this.initialized) return;

    this.renderState.progress = progress;
    this.renderState.isDirty = true;

    // Update sun position
    this.updateSunPosition(progress);

    // Update sky gradient based on time of day
    this.updateSkyGradient(progress);

    this.renderState.lastRenderTime = performance.now();
  }

  private updateSkyGradient(progress: number): void {
    if (!this.skyGradient) return;

    // Transition from dawn to dusk colors
    const dawnColors = ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706'];
    const duskColors = ['#7c3aed', '#a855f7', '#c084fc', '#e9d5ff'];

    // Interpolate between dawn and dusk
    const t = progress;
    const gradientStops = dawnColors.map((dawnColor, index) => {
      const duskColor = duskColors[index];
      // Simple color interpolation would go here
      return t < 0.5 ? dawnColor : duskColor;
    });

    this.skyGradient.style.background = `linear-gradient(180deg, 
      ${gradientStops[0]} 0%,
      ${gradientStops[1]} 30%, 
      ${gradientStops[2]} 60%, 
      ${gradientStops[3]} 100%)`;
  }

  public override setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    if (this.sunElement) {
      this.sunElement.style.transition = isRunning ? 'transform 1s linear' : 'none';
    }
  }

  public override updateTime(timeString: string): void {
    this.renderState.timeString = timeString;
    // Time display is handled separately in Dawn & Dusk theme
  }

  public override destroy(): void {
    // Call parent destroy
    super.destroy();

    // Clear additional references
    this.gradientContainer = null!;
    this.sunElement = null!;
    this.skyGradient = null!;
  }
}
