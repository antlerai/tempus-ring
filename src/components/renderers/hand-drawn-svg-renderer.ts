import { SVGRenderer } from './svg-renderer';

export class HandDrawnSVGRenderer extends SVGRenderer {
  private sketchGroup!: SVGGElement;
  private doodleElements!: SVGGElement;
  private handDrawnBorder!: SVGPathElement;
  private scribbles!: SVGGElement;
  private progressPath!: SVGPathElement;

  protected override createSVGStructure(): void {
    // Call parent to create basic structure
    super.createSVGStructure();

    // Add hand-drawn sketch elements
    this.createHandDrawnElements();
  }

  private createHandDrawnElements(): void {
    const svg = this.svg;
    const center = this.center;
    const radius = this.radius;

    // Create sketch group for hand-drawn elements
    this.sketchGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.sketchGroup.setAttribute('class', 'hand-drawn-sketch-group');

    // Create doodle elements group
    this.doodleElements = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.doodleElements.setAttribute('class', 'hand-drawn-doodles');

    // Create very rough hand-drawn border
    this.handDrawnBorder = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.handDrawnBorder.setAttribute('class', 'hand-drawn-border');

    // Generate very shaky circle path for authentic hand-drawn effect
    const roughCirclePath = this.generateRoughCircle(center.x, center.y, radius);
    this.handDrawnBorder.setAttribute('d', roughCirclePath);
    this.handDrawnBorder.setAttribute('fill', 'none');
    this.handDrawnBorder.setAttribute('stroke', '#4b5563');
    this.handDrawnBorder.setAttribute('stroke-width', '2.5');
    this.handDrawnBorder.setAttribute('stroke-linecap', 'round');
    this.handDrawnBorder.setAttribute('opacity', '0.9');

    // Create progress path for hand-drawn progress indicator
    this.progressPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.progressPath.setAttribute('class', 'hand-drawn-progress');
    this.progressPath.setAttribute('fill', 'none');
    this.progressPath.setAttribute('stroke', '#f97316');
    this.progressPath.setAttribute('stroke-width', '4');
    this.progressPath.setAttribute('stroke-linecap', 'round');
    this.progressPath.setAttribute('opacity', '0.8');

    // Create scribbles group for decorative elements
    this.scribbles = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.scribbles.setAttribute('class', 'hand-drawn-scribbles');

    // Add random doodles and scribbles
    this.createDoodles();
    this.createScribbles();

    // Add notebook paper lines
    this.createNotebookLines();

    // Assemble sketch elements
    this.sketchGroup.appendChild(this.handDrawnBorder);
    this.sketchGroup.appendChild(this.progressPath);
    this.sketchGroup.appendChild(this.doodleElements);
    this.sketchGroup.appendChild(this.scribbles);

    // Insert sketch group before other elements for background effect
    svg.insertBefore(this.sketchGroup, svg.firstChild);
  }

  private generateRoughCircle(cx: number, cy: number, r: number): string {
    const segments = 48; // More segments for rougher appearance
    const angleStep = (2 * Math.PI) / segments;
    let path = '';

    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep;

      // Add significant random variation for hand-drawn shakiness
      const radiusVariation = r + (Math.random() - 0.5) * 8;
      const x = cx + Math.cos(angle) * radiusVariation + (Math.random() - 0.5) * 3;
      const y = cy + Math.sin(angle) * radiusVariation + (Math.random() - 0.5) * 3;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        // Add more erratic curves for natural hand-drawn look
        const prevAngle = (i - 1) * angleStep;
        const controlRadius = radiusVariation + (Math.random() - 0.5) * 6;
        const controlX =
          cx + Math.cos(prevAngle + angleStep / 2) * controlRadius + (Math.random() - 0.5) * 4;
        const controlY =
          cy + Math.sin(prevAngle + angleStep / 2) * controlRadius + (Math.random() - 0.5) * 4;

        // Sometimes use line, sometimes curve for variety
        if (Math.random() > 0.3) {
          path += ` Q ${controlX} ${controlY} ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      }
    }

    path += ' Z'; // Close the path
    return path;
  }

  private createDoodles(): void {
    const center = this.center;
    const radius = this.radius;

    // Create small doodles around the clock
    const doodleTypes = ['star', 'heart', 'spiral', 'arrow'];

    for (let i = 0; i < 6; i++) {
      const doodleType = doodleTypes[Math.floor(Math.random() * doodleTypes.length)];
      const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 1;
      const distance = radius + 40 + Math.random() * 20;
      const doodleX = center.x + Math.cos(angle) * distance;
      const doodleY = center.y + Math.sin(angle) * distance;

      const doodle = this.createDoodle(doodleType!, doodleX, doodleY);
      if (doodle) {
        this.doodleElements.appendChild(doodle);
      }
    }
  }

  private createDoodle(type: string, x: number, y: number): SVGElement | null {
    switch (type) {
      case 'star':
        return this.createHandDrawnStar(x, y);
      case 'heart':
        return this.createHandDrawnHeart(x, y);
      case 'spiral':
        return this.createHandDrawnSpiral(x, y);
      case 'arrow':
        return this.createHandDrawnArrow(x, y);
      default:
        return null;
    }
  }

  private createHandDrawnStar(x: number, y: number): SVGPathElement {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const size = 4 + Math.random() * 3;

    // Create rough star shape
    const points = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const outerX = x + Math.cos(angle) * size + (Math.random() - 0.5);
      const outerY = y + Math.sin(angle) * size + (Math.random() - 0.5);
      const innerAngle = angle + Math.PI / 5;
      const innerX = x + Math.cos(innerAngle) * (size / 2) + (Math.random() - 0.5);
      const innerY = y + Math.sin(innerAngle) * (size / 2) + (Math.random() - 0.5);

      points.push([outerX, outerY]);
      points.push([innerX, innerY]);
    }

    let path = `M ${points[0]![0]} ${points[0]![1]}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i]![0]} ${points[i]![1]}`;
    }
    path += ' Z';

    star.setAttribute('d', path);
    star.setAttribute('fill', 'none');
    star.setAttribute('stroke', '#f97316');
    star.setAttribute('stroke-width', '1.5');
    star.setAttribute('opacity', '0.6');

    return star;
  }

  private createHandDrawnHeart(x: number, y: number): SVGPathElement {
    const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const size = 3 + Math.random() * 2;

    // Rough heart shape with shaky lines
    const path = `M ${x} ${y + size} 
                  Q ${x - size} ${y - size / 2 + (Math.random() - 0.5)} ${x} ${y} 
                  Q ${x + size} ${y - size / 2 + (Math.random() - 0.5)} ${x} ${y + size}`;

    heart.setAttribute('d', path);
    heart.setAttribute('fill', 'none');
    heart.setAttribute('stroke', '#ef4444');
    heart.setAttribute('stroke-width', '1.5');
    heart.setAttribute('opacity', '0.6');

    return heart;
  }

  private createHandDrawnSpiral(x: number, y: number): SVGPathElement {
    const spiral = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const turns = 2 + Math.random() * 1;
    const maxRadius = 4 + Math.random() * 2;

    let path = `M ${x} ${y}`;
    const steps = 20;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2;
      const radius = t * maxRadius;
      const spiralX = x + Math.cos(angle) * radius + (Math.random() - 0.5);
      const spiralY = y + Math.sin(angle) * radius + (Math.random() - 0.5);

      if (i === 1) {
        path += ` Q ${x + (Math.random() - 0.5)} ${y + (Math.random() - 0.5)} ${spiralX} ${spiralY}`;
      } else {
        path += ` L ${spiralX} ${spiralY}`;
      }
    }

    spiral.setAttribute('d', path);
    spiral.setAttribute('fill', 'none');
    spiral.setAttribute('stroke', '#9ca3af');
    spiral.setAttribute('stroke-width', '1.5');
    spiral.setAttribute('opacity', '0.5');

    return spiral;
  }

  private createHandDrawnArrow(x: number, y: number): SVGPathElement {
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const length = 8 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    // Arrow shaft with shaky line
    const path = `M ${x} ${y} L ${endX + (Math.random() - 0.5)} ${endY + (Math.random() - 0.5)}
                  M ${endX - Math.cos(angle - 0.5) * 3} ${endY - Math.sin(angle - 0.5) * 3} 
                  L ${endX} ${endY} 
                  L ${endX - Math.cos(angle + 0.5) * 3} ${endY - Math.sin(angle + 0.5) * 3}`;

    arrow.setAttribute('d', path);
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', '#6b7280');
    arrow.setAttribute('stroke-width', '1.5');
    arrow.setAttribute('stroke-linecap', 'round');
    arrow.setAttribute('opacity', '0.6');

    return arrow;
  }

  private createScribbles(): void {
    const center = this.center;
    const radius = this.radius;

    // Create random scribbles for texture
    for (let i = 0; i < 4; i++) {
      const scribble = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      const scribbleX = center.x + (Math.random() - 0.5) * radius * 0.5;
      const scribbleY = center.y + (Math.random() - 0.5) * radius * 0.5;

      let path = `M ${scribbleX} ${scribbleY}`;

      // Create random scribble path
      for (let j = 0; j < 5; j++) {
        const newX = scribbleX + (Math.random() - 0.5) * 20;
        const newY = scribbleY + (Math.random() - 0.5) * 20;
        path += ` L ${newX} ${newY}`;
      }

      scribble.setAttribute('d', path);
      scribble.setAttribute('fill', 'none');
      scribble.setAttribute('stroke', '#9ca3af');
      scribble.setAttribute('stroke-width', '0.8');
      scribble.setAttribute('opacity', '0.3');

      this.scribbles.appendChild(scribble);
    }
  }

  private createNotebookLines(): void {
    const center = this.center;
    const radius = this.radius;

    // Add faint notebook paper lines across the background
    for (let i = -3; i <= 3; i++) {
      const y = center.y + i * 25;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

      line.setAttribute('x1', (center.x - radius).toString());
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', (center.x + radius).toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#e5e7eb');
      line.setAttribute('stroke-width', '0.5');
      line.setAttribute('opacity', '0.4');

      this.sketchGroup.appendChild(line);
    }
  }

  public override createTicks(count: number = 12): void {
    if (!this.tickGroup) return;

    const center = this.center;
    const radius = this.radius;

    // Clear existing ticks
    this.tickGroup.innerHTML = '';

    // Create very rough hand-drawn tick marks
    for (let i = 0; i < count; i++) {
      const tickGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tickGroup.setAttribute('class', 'hand-drawn-tick');

      const angle = (i * Math.PI * 2) / count - Math.PI / 2; // Start from top
      const isMajor = i % 3 === 0;

      // Create very shaky tick line
      const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      const tickLength = isMajor ? 18 : 10;
      const startRadius = radius - 3;
      const endRadius = radius - 3 - tickLength;

      // Add lots of randomness for authentic hand-drawn shakiness
      const startX = center.x + Math.cos(angle) * startRadius + (Math.random() - 0.5) * 2;
      const startY = center.y + Math.sin(angle) * startRadius + (Math.random() - 0.5) * 2;
      const endX = center.x + Math.cos(angle) * endRadius + (Math.random() - 0.5) * 2;
      const endY = center.y + Math.sin(angle) * endRadius + (Math.random() - 0.5) * 2;

      // Create very shaky line with multiple segments
      const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 3;
      const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 3;

      const tickPath = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

      tickLine.setAttribute('d', tickPath);
      tickLine.setAttribute('stroke', isMajor ? '#1f2937' : '#6b7280');
      tickLine.setAttribute('stroke-width', isMajor ? '3' : '2');
      tickLine.setAttribute('stroke-linecap', 'round');
      tickLine.setAttribute('fill', 'none');
      tickLine.setAttribute('opacity', '0.8');

      tickGroup.appendChild(tickLine);
      this.tickGroup.appendChild(tickGroup);
    }
  }

  protected override updateProgressRing(progress: number): void {
    // Call parent method first
    // Call parent method to update basic progress ring
    const circumference = 2 * Math.PI * this.radius;
    const offset = circumference - progress * circumference;
    this.progressCircle.setAttribute('stroke-dashoffset', offset.toString());

    // Update hand-drawn progress path
    this.updateHandDrawnProgress(progress);
  }

  private updateHandDrawnProgress(progress: number): void {
    if (!this.progressPath || progress <= 0) return;

    const center = this.center;
    const radius = this.radius + 5; // Slightly outside main circle
    const progressAngle = progress * Math.PI * 2;

    // Create rough progress arc
    let path = '';
    const segments = Math.floor(progressAngle * 20); // More segments for smoother rough line

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * progressAngle - Math.PI / 2;
      const x = center.x + Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      const y = center.y + Math.sin(angle) * radius + (Math.random() - 0.5) * 2;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }

    this.progressPath.setAttribute('d', path);
  }

  public override setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    // Add jittery animation effects for hand-drawn feel
    if (isRunning && this.handDrawnBorder) {
      this.handDrawnBorder.style.animation = 'hand-drawn-jitter 4s ease-in-out infinite';
    } else if (this.handDrawnBorder) {
      this.handDrawnBorder.style.animation = 'none';
    }

    // Add CSS animation if not exists
    if (!document.getElementById('hand-drawn-animations')) {
      const style = document.createElement('style');
      style.id = 'hand-drawn-animations';
      style.textContent = `
        @keyframes hand-drawn-jitter {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(0.5px, 0.5px) rotate(0.1deg); }
          40% { transform: translate(-0.5px, 0.5px) rotate(-0.1deg); }
          60% { transform: translate(0.5px, -0.5px) rotate(0.05deg); }
          80% { transform: translate(-0.5px, -0.5px) rotate(-0.05deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  public override destroy(): void {
    // Remove animation styles
    const animationStyle = document.getElementById('hand-drawn-animations');
    if (animationStyle) {
      animationStyle.remove();
    }

    // Call parent destroy
    super.destroy();

    // Clear additional references
    this.sketchGroup = null!;
    this.doodleElements = null!;
    this.handDrawnBorder = null!;
    this.scribbles = null!;
    this.progressPath = null!;
  }
}
