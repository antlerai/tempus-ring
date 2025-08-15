import { SVGRenderer } from './svg-renderer';

export class ArtisticSVGRenderer extends SVGRenderer {
  private sketchGroup!: SVGGElement;
  private brushStrokes!: SVGGElement;
  private handDrawnCircle!: SVGPathElement;
  private inkSplashes!: SVGGElement;

  // CSS variables cache for performance
  private cssVars: Record<string, string> = {};

  protected override createSVGStructure(): void {
    // Call parent to create basic structure
    super.createSVGStructure();

    // Update CSS variables cache
    this.updateCSSVariables();

    // Add artistic sketch elements
    this.createSketchElements();
  }

  private updateCSSVariables(): void {
    const computedStyle = getComputedStyle(document.documentElement);
    this.cssVars = {
      '--svg-stroke-primary': computedStyle.getPropertyValue('--svg-stroke-primary').trim(),
      '--svg-stroke-secondary': computedStyle.getPropertyValue('--svg-stroke-secondary').trim(),
      '--svg-stroke-accent': computedStyle.getPropertyValue('--svg-stroke-accent').trim(),
      '--svg-fill-primary': computedStyle.getPropertyValue('--svg-fill-primary').trim(),
      '--svg-fill-secondary': computedStyle.getPropertyValue('--svg-fill-secondary').trim(),
      '--svg-fill-accent': computedStyle.getPropertyValue('--svg-fill-accent').trim(),
      '--svg-ink-splash': computedStyle.getPropertyValue('--svg-ink-splash').trim(),
      '--svg-tick-major': computedStyle.getPropertyValue('--svg-tick-major').trim(),
      '--svg-tick-minor': computedStyle.getPropertyValue('--svg-tick-minor').trim(),
      '--svg-tick-decorative': computedStyle.getPropertyValue('--svg-tick-decorative').trim(),
      '--svg-brush-stroke': computedStyle.getPropertyValue('--svg-brush-stroke').trim(),
    };
  }

  private createSketchElements(): void {
    const svg = this.svg;
    const center = this.center;
    const radius = this.radius;

    // Create sketch group for artistic elements
    this.sketchGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.sketchGroup.setAttribute('class', 'artistic-sketch-group');

    // Create brush strokes group
    this.brushStrokes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.brushStrokes.setAttribute('class', 'artistic-brush-strokes');

    // Create hand-drawn circle border
    this.handDrawnCircle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.handDrawnCircle.setAttribute('class', 'artistic-hand-drawn-circle');

    // Generate slightly wavy circle path for hand-drawn effect
    const wavyCirclePath = this.generateWavyCircle(center.x, center.y, radius);
    this.handDrawnCircle.setAttribute('d', wavyCirclePath);
    this.handDrawnCircle.setAttribute('fill', 'none');
    this.handDrawnCircle.setAttribute('stroke', this.cssVars['--svg-stroke-primary'] || '#374151');
    this.handDrawnCircle.setAttribute('stroke-width', '3');
    this.handDrawnCircle.setAttribute('stroke-linecap', 'round');
    this.handDrawnCircle.setAttribute('opacity', '0.8');

    // Create ink splashes group
    this.inkSplashes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.inkSplashes.setAttribute('class', 'artistic-ink-splashes');

    // Add random ink splashes
    this.createInkSplashes();

    // Add texture pattern
    this.createTexturePattern();

    // Assemble sketch elements
    this.sketchGroup.appendChild(this.handDrawnCircle);
    this.sketchGroup.appendChild(this.brushStrokes);
    this.sketchGroup.appendChild(this.inkSplashes);

    // Insert sketch group before other elements for background effect
    svg.insertBefore(this.sketchGroup, svg.firstChild);
  }

  private generateWavyCircle(cx: number, cy: number, r: number): string {
    const segments = 36; // Number of segments for smooth curve
    const angleStep = (2 * Math.PI) / segments;
    let path = '';

    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep;

      // Add slight random variation for hand-drawn effect
      const radiusVariation = r + (Math.random() - 0.5) * 4;
      const x = cx + Math.cos(angle) * radiusVariation;
      const y = cy + Math.sin(angle) * radiusVariation;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        // Use quadratic curves for smoother, more organic lines
        const prevAngle = (i - 1) * angleStep;
        const controlX =
          cx + Math.cos(prevAngle + angleStep / 2) * (radiusVariation + (Math.random() - 0.5) * 2);
        const controlY =
          cy + Math.sin(prevAngle + angleStep / 2) * (radiusVariation + (Math.random() - 0.5) * 2);
        path += ` Q ${controlX} ${controlY} ${x} ${y}`;
      }
    }

    path += ' Z'; // Close the path
    return path;
  }

  private createInkSplashes(): void {
    const center = this.center;
    const radius = this.radius;

    // Create 8-12 random ink splashes around the circle
    const splashCount = Math.floor(Math.random() * 5) + 8;

    for (let i = 0; i < splashCount; i++) {
      const splash = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      splash.setAttribute('class', 'artistic-ink-splash');

      // Random position around the circle
      const angle = (Math.PI * 2 * i) / splashCount + (Math.random() - 0.5) * 0.5;
      const distance = radius + 20 + Math.random() * 30;
      const splashX = center.x + Math.cos(angle) * distance;
      const splashY = center.y + Math.sin(angle) * distance;

      // Random size and opacity
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.4 + 0.1;

      splash.setAttribute('cx', splashX.toString());
      splash.setAttribute('cy', splashY.toString());
      splash.setAttribute('r', size.toString());
      splash.setAttribute('fill', this.cssVars['--svg-ink-splash'] || '#6b7280');
      splash.setAttribute('opacity', opacity.toString());

      this.inkSplashes.appendChild(splash);
    }
  }

  private createTexturePattern(): void {
    // Create paper texture pattern
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');

    pattern.setAttribute('id', 'artistic-paper-texture');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '4');
    pattern.setAttribute('height', '4');

    // Add subtle texture dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', (Math.random() * 4).toString());
      dot.setAttribute('cy', (Math.random() * 4).toString());
      dot.setAttribute('r', '0.2');
      dot.setAttribute('fill', '#000');
      dot.setAttribute('opacity', '0.05');
      pattern.appendChild(dot);
    }

    defs.appendChild(pattern);
    this.svg.appendChild(defs);

    // Apply texture to background
    const textureRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    textureRect.setAttribute('width', '100%');
    textureRect.setAttribute('height', '100%');
    textureRect.setAttribute('fill', 'url(#artistic-paper-texture)');
    textureRect.setAttribute('opacity', '0.3');

    this.sketchGroup.insertBefore(textureRect, this.sketchGroup.firstChild);
  }

  public override createTicks(count: number = 12): void {
    if (!this.tickGroup) return;

    const center = this.center;
    const radius = this.radius;

    // Clear existing ticks
    this.tickGroup.innerHTML = '';

    // Create artistic tick marks
    for (let i = 0; i < count; i++) {
      const tickGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tickGroup.setAttribute('class', 'artistic-tick');

      const angle = (i * Math.PI * 2) / count - Math.PI / 2; // Start from top
      const isMajor = i % 3 === 0;

      // Create hand-drawn tick line
      const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      const tickLength = isMajor ? 15 : 8;
      const startRadius = radius - 5;
      const endRadius = radius - 5 - tickLength;

      // Add slight randomness for hand-drawn effect
      const startX = center.x + Math.cos(angle) * startRadius + (Math.random() - 0.5) * 1;
      const startY = center.y + Math.sin(angle) * startRadius + (Math.random() - 0.5) * 1;
      const endX = center.x + Math.cos(angle) * endRadius + (Math.random() - 0.5) * 1;
      const endY = center.y + Math.sin(angle) * endRadius + (Math.random() - 0.5) * 1;

      // Use path for slightly wavy line
      const tickPath = `M ${startX} ${startY} Q ${(startX + endX) / 2 + (Math.random() - 0.5)} ${(startY + endY) / 2 + (Math.random() - 0.5)} ${endX} ${endY}`;

      tickLine.setAttribute('d', tickPath);
      tickLine.setAttribute(
        'stroke',
        isMajor
          ? this.cssVars['--svg-tick-major'] || '#111827'
          : this.cssVars['--svg-tick-minor'] || '#6b7280'
      );
      tickLine.setAttribute('stroke-width', isMajor ? '2.5' : '1.5');
      tickLine.setAttribute('stroke-linecap', 'round');
      tickLine.setAttribute('fill', 'none');
      tickLine.setAttribute('opacity', '0.8');

      // Add small decorative dots for major ticks
      if (isMajor && Math.random() > 0.5) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', (endX + (Math.random() - 0.5) * 3).toString());
        dot.setAttribute('cy', (endY + (Math.random() - 0.5) * 3).toString());
        dot.setAttribute('r', '1');
        dot.setAttribute('fill', this.cssVars['--svg-tick-decorative'] || '#ef4444');
        dot.setAttribute('opacity', '0.6');
        tickGroup.appendChild(dot);
      }

      tickGroup.appendChild(tickLine);
      this.tickGroup.appendChild(tickGroup);
    }
  }

  protected override updateProgressRing(progress: number): void {
    // Update CSS variables in case theme changed
    this.updateCSSVariables();

    // Call parent method to update basic progress ring
    const circumference = 2 * Math.PI * this.radius;
    const offset = circumference - progress * circumference;
    this.progressCircle.setAttribute('stroke-dashoffset', offset.toString());

    // Add artistic brush stroke effect for progress
    this.updateBrushStrokes(progress);
  }

  private updateBrushStrokes(progress: number): void {
    if (!this.brushStrokes) return;

    // Clear previous brush strokes
    this.brushStrokes.innerHTML = '';

    if (progress <= 0) return;

    const center = this.center;
    const radius = this.radius;
    const strokeCount = Math.floor(progress * 20) + 1; // More strokes as progress increases

    for (let i = 0; i < strokeCount; i++) {
      const strokeProgress = i / strokeCount;
      const angle = strokeProgress * progress * Math.PI * 2 - Math.PI / 2;

      // Create artistic brush stroke
      const stroke = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      const strokeRadius = radius + 8;
      const strokeLength = 6 + Math.random() * 4;

      const startX = center.x + Math.cos(angle) * strokeRadius;
      const startY = center.y + Math.sin(angle) * strokeRadius;
      const endX = startX + Math.cos(angle + Math.PI / 2) * strokeLength;
      const endY = startY + Math.sin(angle + Math.PI / 2) * strokeLength;

      const strokePath = `M ${startX} ${startY} L ${endX} ${endY}`;

      stroke.setAttribute('d', strokePath);
      stroke.setAttribute('stroke', this.cssVars['--svg-brush-stroke'] || '#ef4444');
      stroke.setAttribute('stroke-width', (2 + Math.random()).toString());
      stroke.setAttribute('stroke-linecap', 'round');
      stroke.setAttribute('opacity', (0.4 + Math.random() * 0.4).toString());

      this.brushStrokes.appendChild(stroke);
    }
  }

  public override setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    // Add sketchy animation effects
    if (isRunning && this.handDrawnCircle) {
      // Add subtle animation to hand-drawn circle
      this.handDrawnCircle.style.animation = 'artistic-wobble 3s ease-in-out infinite';
    } else if (this.handDrawnCircle) {
      this.handDrawnCircle.style.animation = 'none';
    }

    // Add CSS animation if not exists
    if (!document.getElementById('artistic-animations')) {
      const style = document.createElement('style');
      style.id = 'artistic-animations';
      style.textContent = `
        @keyframes artistic-wobble {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(0.5deg) scale(1.002); }
          50% { transform: rotate(0deg) scale(0.998); }
          75% { transform: rotate(-0.5deg) scale(1.001); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  public override destroy(): void {
    // Remove animation styles
    const animationStyle = document.getElementById('artistic-animations');
    if (animationStyle) {
      animationStyle.remove();
    }

    // Call parent destroy
    super.destroy();

    // Clear additional references
    this.sketchGroup = null!;
    this.brushStrokes = null!;
    this.handDrawnCircle = null!;
    this.inkSplashes = null!;
  }
}
