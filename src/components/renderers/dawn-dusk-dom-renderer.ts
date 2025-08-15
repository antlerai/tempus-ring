import type { ThemeConfig } from '../../types/theme-types';
import { DOMRenderer } from './dom-renderer';

export class DawnDuskDOMRenderer extends DOMRenderer {
  private gradientContainer!: HTMLElement;
  private sunElement!: HTMLElement;
  private skyGradient!: HTMLElement;

  protected override createDOMStructure(): void {
    // Clear container
    this.container.innerHTML = '';

    // Set container class
    this.container.className = 'timer-container';

    // Create sky gradient background
    this.skyGradient = document.createElement('div');
    this.skyGradient.className = 'dawn-dusk-sky';

    // Create gradient container for progress
    this.gradientContainer = document.createElement('div');
    this.gradientContainer.className = 'dawn-dusk-gradient-container';

    // Create sun element
    this.sunElement = document.createElement('div');
    this.sunElement.className = 'dawn-dusk-sun';

    // Create tick container
    this.tickContainer = document.createElement('div');
    this.tickContainer.className = 'dawn-dusk-ticks';

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
      const isMajor = i % 6 === 0; // Major ticks every 6 hours

      // Use CSS classes for styling
      tick.className = isMajor ? 'dawn-dusk-tick major' : 'dawn-dusk-tick minor';

      const tickLength = isMajor ? 16 : 10;
      const tickWidth = isMajor ? 3 : 2;

      // Only set dynamic properties that can't be in CSS
      tick.style.width = `${tickWidth}px`;
      tick.style.height = `${tickLength}px`;

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

    // Update CSS class based on progress to trigger different gradients
    const progressClass = this.getProgressClass(progress);

    // Remove existing progress classes
    this.container.classList.remove(
      'progress-dawn',
      'progress-day',
      'progress-dusk',
      'progress-night'
    );

    // Add current progress class
    this.container.classList.add(progressClass);
  }

  private getProgressClass(progress: number): string {
    if (progress < 0.25) return 'progress-dawn';
    if (progress < 0.5) return 'progress-day';
    if (progress < 0.75) return 'progress-dusk';
    return 'progress-night';
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
