import type { RenderState, SVGRendererConfig, TimerRenderer } from '../../types/renderer-types';
import type { ThemeConfig } from '../../types/theme-types';

export class SVGRenderer implements TimerRenderer {
  private container: HTMLElement;
  private svg!: SVGSVGElement;
  private progressCircle!: SVGCircleElement;
  private backgroundCircle!: SVGCircleElement;
  private timeText!: SVGTextElement;
  private tickGroup!: SVGGElement;
  private clockHands!: { minute: SVGLineElement; hour: SVGLineElement };
  private initialized = false;
  private config: SVGRendererConfig;
  private renderState: RenderState;
  private radius: number;
  private center: { x: number; y: number };

  constructor(config: SVGRendererConfig) {
    this.config = config;
    this.container = config.container;
    this.renderState = {
      progress: 0,
      timeString: '25:00',
      isAnimating: false,
      isDirty: true,
      lastRenderTime: 0,
    };

    // Calculate dimensions
    const size = Math.min(config.width, config.height);
    this.radius = size * 0.4 - 20; // Leave margin for ticks
    this.center = { x: size / 2, y: size / 2 };

    this.initialize();
  }

  private initialize(): void {
    this.createSVGStructure();
    this.setupStyles();
    this.initialized = true;
  }

  private createSVGStructure(): void {
    // Clear container
    this.container.innerHTML = '';

    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'timer-renderer svg-renderer');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute(
      'viewBox',
      this.config.viewBox || `0 0 ${this.config.width} ${this.config.height}`
    );
    this.svg.setAttribute(
      'preserveAspectRatio',
      this.config.preserveAspectRatio || 'xMidYMid meet'
    );

    // Create background circle
    this.backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.backgroundCircle.setAttribute('cx', this.center.x.toString());
    this.backgroundCircle.setAttribute('cy', this.center.y.toString());
    this.backgroundCircle.setAttribute('r', this.radius.toString());
    this.backgroundCircle.setAttribute('fill', 'none');
    this.backgroundCircle.setAttribute('stroke', 'var(--ring-bg-color, #e5e5e5)');
    this.backgroundCircle.setAttribute('stroke-width', 'var(--ring-width, 8)');
    this.backgroundCircle.setAttribute('class', 'background-circle');

    // Create progress circle
    this.progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.progressCircle.setAttribute('cx', this.center.x.toString());
    this.progressCircle.setAttribute('cy', this.center.y.toString());
    this.progressCircle.setAttribute('r', this.radius.toString());
    this.progressCircle.setAttribute('fill', 'none');
    this.progressCircle.setAttribute('stroke', 'var(--primary-color, #3b82f6)');
    this.progressCircle.setAttribute('stroke-width', 'var(--ring-width, 8)');
    this.progressCircle.setAttribute('stroke-linecap', 'round');
    this.progressCircle.setAttribute('class', 'progress-circle');

    // Set up progress circle for animation
    const circumference = 2 * Math.PI * this.radius;
    this.progressCircle.setAttribute('stroke-dasharray', circumference.toString());
    this.progressCircle.setAttribute('stroke-dashoffset', circumference.toString());
    this.progressCircle.setAttribute('transform', `rotate(-90 ${this.center.x} ${this.center.y})`);

    // Add transition for smooth animation
    this.progressCircle.style.transition = 'stroke-dashoffset 0.1s ease-out';

    // Create tick marks group
    this.tickGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.tickGroup.setAttribute('class', 'tick-group');

    // Create time text
    this.timeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.timeText.setAttribute('x', this.center.x.toString());
    this.timeText.setAttribute('y', this.center.y.toString());
    this.timeText.setAttribute('text-anchor', 'middle');
    this.timeText.setAttribute('dominant-baseline', 'central');
    this.timeText.setAttribute('class', 'time-text');
    this.timeText.setAttribute('font-family', 'var(--font-mono, monospace)');
    this.timeText.setAttribute('font-size', 'var(--time-font-size, 2rem)');
    this.timeText.setAttribute('font-weight', '600');
    this.timeText.setAttribute('fill', 'var(--text-color, #1f2937)');
    this.timeText.textContent = '25:00';

    // Create clock hands for time mode (initially hidden)
    this.clockHands = {
      minute: document.createElementNS('http://www.w3.org/2000/svg', 'line'),
      hour: document.createElementNS('http://www.w3.org/2000/svg', 'line'),
    };

    // Setup minute hand
    this.clockHands.minute.setAttribute('x1', this.center.x.toString());
    this.clockHands.minute.setAttribute('y1', this.center.y.toString());
    this.clockHands.minute.setAttribute('x2', this.center.x.toString());
    this.clockHands.minute.setAttribute('y2', (this.center.y - this.radius * 0.8).toString());
    this.clockHands.minute.setAttribute('stroke', 'var(--primary-color, #3b82f6)');
    this.clockHands.minute.setAttribute('stroke-width', '3');
    this.clockHands.minute.setAttribute('stroke-linecap', 'round');
    this.clockHands.minute.setAttribute('class', 'minute-hand');
    this.clockHands.minute.style.transformOrigin = `${this.center.x}px ${this.center.y}px`;
    this.clockHands.minute.style.display = 'none';

    // Setup hour hand
    this.clockHands.hour.setAttribute('x1', this.center.x.toString());
    this.clockHands.hour.setAttribute('y1', this.center.y.toString());
    this.clockHands.hour.setAttribute('x2', this.center.x.toString());
    this.clockHands.hour.setAttribute('y2', (this.center.y - this.radius * 0.6).toString());
    this.clockHands.hour.setAttribute('stroke', 'var(--secondary-color, #6b7280)');
    this.clockHands.hour.setAttribute('stroke-width', '4');
    this.clockHands.hour.setAttribute('stroke-linecap', 'round');
    this.clockHands.hour.setAttribute('class', 'hour-hand');
    this.clockHands.hour.style.transformOrigin = `${this.center.x}px ${this.center.y}px`;
    this.clockHands.hour.style.display = 'none';

    // Assemble SVG structure
    this.svg.appendChild(this.backgroundCircle);
    this.svg.appendChild(this.tickGroup);
    this.svg.appendChild(this.progressCircle);
    this.svg.appendChild(this.clockHands.hour);
    this.svg.appendChild(this.clockHands.minute);
    this.svg.appendChild(this.timeText);

    this.container.appendChild(this.svg);
  }

  private setupStyles(): void {
    const theme = this.config.theme;
    const cssVariables = {
      '--ring-width': '8px',
      '--primary-color': theme.colors.primary,
      '--secondary-color': theme.colors.secondary,
      '--ring-bg-color': theme.colors.secondary,
      '--text-color': theme.colors.text,
      '--time-font-size': '1.5rem',
      '--font-mono': theme.fonts.mono,
    };

    for (const [prop, value] of Object.entries(cssVariables)) {
      this.container.style.setProperty(prop, value);
    }
  }

  private createTickLine(angle: number, isLarge: boolean): SVGLineElement {
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    const outerRadius = this.radius + (isLarge ? 15 : 10);
    const innerRadius = this.radius + (isLarge ? 5 : 8);

    const radian = (angle - 90) * (Math.PI / 180); // -90 to start from top

    const x1 = this.center.x + Math.cos(radian) * innerRadius;
    const y1 = this.center.y + Math.sin(radian) * innerRadius;
    const x2 = this.center.x + Math.cos(radian) * outerRadius;
    const y2 = this.center.y + Math.sin(radian) * outerRadius;

    tick.setAttribute('x1', x1.toString());
    tick.setAttribute('y1', y1.toString());
    tick.setAttribute('x2', x2.toString());
    tick.setAttribute('y2', y2.toString());
    tick.setAttribute('stroke', 'var(--text-color, #6b7280)');
    tick.setAttribute('stroke-width', isLarge ? '2' : '1');
    tick.setAttribute('opacity', isLarge ? '0.8' : '0.4');
    tick.setAttribute('class', isLarge ? 'tick tick-large' : 'tick tick-small');

    return tick;
  }

  private updateProgressCircle(progress: number): void {
    const circumference = 2 * Math.PI * this.radius;
    const offset = circumference - progress * circumference;
    this.progressCircle.setAttribute('stroke-dashoffset', offset.toString());
  }

  private updateClockHands(timeString: string): void {
    // Parse time string (e.g., "25:00" or "04:35")
    const parts = timeString.split(':').map(Number);
    const minutes = parts[0] || 0;
    const seconds = parts[1] || 0;
    const totalMinutes = minutes + seconds / 60;

    // Calculate angles (360 degrees = 60 minutes for minute hand, 12 hours for hour hand)
    const minuteAngle = (totalMinutes / 60) * 360;
    const hourAngle = (totalMinutes / (60 * 12)) * 360;

    // Apply rotations
    this.clockHands.minute.style.transform = `rotate(${minuteAngle}deg)`;
    this.clockHands.hour.style.transform = `rotate(${hourAngle}deg)`;
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

    // Update progress circle
    this.updateProgressCircle(progress);

    // Update clock hands if in clock mode
    if (this.config.displayMode === 'clock') {
      this.updateClockHands(this.renderState.timeString);
    }

    this.renderState.lastRenderTime = performance.now();
  }

  resize(width: number, height: number): void {
    const size = Math.min(width, height);
    this.radius = size * 0.4 - 20;
    this.center = { x: width / 2, y: height / 2 };

    this.config.width = width;
    this.config.height = height;

    // Update SVG viewBox
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Update circle positions and radius
    this.backgroundCircle.setAttribute('cx', this.center.x.toString());
    this.backgroundCircle.setAttribute('cy', this.center.y.toString());
    this.backgroundCircle.setAttribute('r', this.radius.toString());

    this.progressCircle.setAttribute('cx', this.center.x.toString());
    this.progressCircle.setAttribute('cy', this.center.y.toString());
    this.progressCircle.setAttribute('r', this.radius.toString());

    // Update progress circle circumference
    const circumference = 2 * Math.PI * this.radius;
    this.progressCircle.setAttribute('stroke-dasharray', circumference.toString());
    this.progressCircle.setAttribute('transform', `rotate(-90 ${this.center.x} ${this.center.y})`);

    // Update text position
    this.timeText.setAttribute('x', this.center.x.toString());
    this.timeText.setAttribute('y', this.center.y.toString());

    // Recreate ticks with new dimensions
    this.createTicks(100);
  }

  updateTime(timeString: string): void {
    this.renderState.timeString = timeString;
    if (this.timeText) {
      this.timeText.textContent = timeString;
    }

    if (this.config.displayMode === 'clock') {
      this.updateClockHands(timeString);
    }
  }

  setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    if (this.progressCircle) {
      if (isRunning) {
        this.progressCircle.style.transition = 'none';
      } else {
        this.progressCircle.style.transition = 'stroke-dashoffset 0.1s ease-out';
      }
    }

    // Show/hide clock hands based on mode
    const displayStyle = this.config.displayMode === 'clock' ? 'block' : 'none';
    this.clockHands.minute.style.display = displayStyle;
    this.clockHands.hour.style.display = displayStyle;
  }

  createTicks(count: number = 100): void {
    if (!this.tickGroup || !this.initialized) return;

    // Clear existing ticks
    while (this.tickGroup.firstChild) {
      this.tickGroup.removeChild(this.tickGroup.firstChild);
    }

    const angleIncrement = 360 / count;

    for (let i = 0; i < count; i++) {
      const angle = i * angleIncrement;
      const isLargeTick = i % (count / 12) === 0; // 12 major ticks

      const tick = this.createTickLine(angle, isLargeTick);
      this.tickGroup.appendChild(tick);
    }
  }

  getType(): 'dom' | 'svg' | 'canvas' {
    return 'svg';
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear references
    this.svg = null!;
    this.progressCircle = null!;
    this.backgroundCircle = null!;
    this.timeText = null!;
    this.tickGroup = null!;
    this.clockHands = null!;
    this.initialized = false;
  }
}
