import type { ThemeConfig } from '../../types/theme-types';
import { CanvasRenderer } from './canvas-renderer';

export class WabiSabiCanvasRenderer extends CanvasRenderer {
  private roughnessLevel: number = 2.5;
  private asymmetryFactor: number = 0.3;

  protected override setupRoughHelper(): void {
    // Call parent setup
    super.setupRoughHelper();

    // Configure rough.js for Wabi-sabi aesthetic
    this.roughHelper.updateConfig({
      ...this.config,
      theme: {
        ...this.config.theme,
        effects: {
          ...this.config.theme.effects,
          roughness: this.roughnessLevel,
          strokeWidth: 3,
          fillStyle: 'hachure',
          hachureGap: 6,
          hachureAngle: 45,
        },
      },
    });
  }

  protected override drawBackground(): void {
    if (!this.ctx) return;

    const canvas = this.canvas;

    // Clear canvas with aged paper color
    this.ctx.fillStyle = '#fafaf9';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle paper texture
    this.addPaperTexture();

    // Add aging stains and imperfections
    this.addWeatheringMarks();

    // Create asymmetric base circle with rough edges
    this.drawAsymmetricBase();
  }

  private addPaperTexture(): void {
    if (!this.ctx) return;

    const canvas = this.canvas;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Add random texture variation
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.max(0, Math.min(255, (data[i] || 0) + noise)); // R
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] || 0) + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] || 0) + noise)); // B
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private addWeatheringMarks(): void {
    if (!this.ctx) return;

    const center = this.center;
    const radius = this.radius;

    // Add subtle stains and marks
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.8;
      const distance = radius * 0.6 + Math.random() * radius * 0.3;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance;

      const stainSize = 2 + Math.random() * 8;
      const opacity = 0.02 + Math.random() * 0.08;

      this.ctx.save();
      this.ctx.globalAlpha = opacity;
      this.ctx.fillStyle = '#d6d3d1';
      this.ctx.beginPath();
      this.ctx.ellipse(
        x,
        y,
        stainSize,
        stainSize * (0.5 + Math.random() * 0.5),
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      this.ctx.restore();
    }

    // Add subtle vertical age lines
    for (let i = 0; i < 3; i++) {
      const x = center.x + (Math.random() - 0.5) * radius * 1.5;
      const y1 = center.y - radius * 0.8;
      const y2 = center.y + radius * 0.8;

      this.ctx.save();
      this.ctx.globalAlpha = 0.05;
      this.ctx.strokeStyle = '#a8a29e';
      this.ctx.lineWidth = 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y1);
      this.ctx.lineTo(x + (Math.random() - 0.5) * 10, y2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private drawAsymmetricBase(): void {
    if (!this.roughHelper) return;

    const center = this.center;
    const baseRadius = this.radius;

    // Create slightly imperfect circle as base
    const points: [number, number][] = [];
    const segments = 36;

    for (let i = 0; i < segments; i++) {
      const angle = (i * Math.PI * 2) / segments;

      // Add asymmetric variations - more on one side for natural feel
      const asymmetryOffset = Math.sin(angle * 3) * this.asymmetryFactor * 8;
      const roughnessOffset = (Math.random() - 0.5) * 12;
      const currentRadius = baseRadius + asymmetryOffset + roughnessOffset;

      const x = center.x + Math.cos(angle) * currentRadius;
      const y = center.y + Math.sin(angle) * currentRadius;

      points.push([x, y]);
    }

    // Draw the base circle using rough canvas directly
    const roughCanvas = this.roughHelper.getRoughCanvas();
    const circle = roughCanvas.generator.circle(center.x, center.y, this.radius * 2, {
      stroke: '#78716c',
      strokeWidth: 2.5,
      roughness: this.roughnessLevel,
      fill: 'rgba(245, 245, 244, 0.3)',
      fillStyle: 'hachure',
      hachureGap: 8,
      hachureAngle: 30,
    });
    roughCanvas.draw(circle);
  }

  public drawTicks(): void {
    if (!this.roughHelper) return;

    const center = this.center;
    const radius = this.radius;
    const tickCount = 60; // More ticks for detailed feel, but irregular

    // Draw imperfect, weathered tick marks
    for (let i = 0; i < tickCount; i++) {
      // Skip some ticks randomly for imperfect, aged appearance
      if (Math.random() < 0.15) continue;

      const angle = (i * Math.PI * 2) / tickCount - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const isHour = i % 15 === 0;

      // Varying tick lengths with imperfection
      let tickLength = 8;
      let strokeWidth = 1.5;

      if (isHour) {
        tickLength = 20 + (Math.random() - 0.5) * 4;
        strokeWidth = 3 + (Math.random() - 0.5) * 0.8;
      } else if (isMajor) {
        tickLength = 12 + (Math.random() - 0.5) * 3;
        strokeWidth = 2 + (Math.random() - 0.5) * 0.5;
      } else {
        tickLength += (Math.random() - 0.5) * 2;
      }

      // Add asymmetric positioning
      const radiusOffset = (Math.random() - 0.5) * 3;
      const angleOffset = (Math.random() - 0.5) * 0.05;
      const adjustedAngle = angle + angleOffset;

      const startRadius = radius - radiusOffset;
      const endRadius = startRadius - tickLength;

      const x1 = center.x + Math.cos(adjustedAngle) * startRadius;
      const y1 = center.y + Math.sin(adjustedAngle) * startRadius;
      const x2 = center.x + Math.cos(adjustedAngle) * endRadius;
      const y2 = center.y + Math.sin(adjustedAngle) * endRadius;

      // Draw tick with varying opacity for weathered effect
      const opacity = 0.6 + Math.random() * 0.3;
      const color = isHour ? '#57534e' : isMajor ? '#78716c' : '#a8a29e';

      // Draw tick using rough canvas directly
      const roughCanvas = this.roughHelper.getRoughCanvas();
      const line = roughCanvas.generator.line(x1, y1, x2, y2, {
        stroke: color,
        strokeWidth: strokeWidth,
        roughness: this.roughnessLevel + (Math.random() - 0.5) * 0.5,
      });

      // Apply opacity through canvas context
      if (this.ctx) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        roughCanvas.draw(line);
        this.ctx.restore();
      }
    }
  }

  protected drawProgressRing(progress: number): void {
    if (!this.roughHelper || progress <= 0) return;

    const center = this.center;
    const radius = this.radius + 8; // Slightly outside main circle
    const progressAngle = progress * Math.PI * 2;

    // Create organic progress arc with hand-drawn feel
    const points: [number, number][] = [];
    const segments = Math.max(8, Math.floor(progressAngle * 20)); // Adaptive detail

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * progressAngle - Math.PI / 2;

      // Add organic variation to the progress ring
      const radiusVariation = radius + (Math.random() - 0.5) * 6;
      const angleVariation = angle + (Math.random() - 0.5) * 0.02;

      const x = center.x + Math.cos(angleVariation) * radiusVariation;
      const y = center.y + Math.sin(angleVariation) * radiusVariation;

      points.push([x, y]);
    }

    // Draw the progress arc as connected lines for organic feel
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i]!;
      const [x2, y2] = points[i + 1]!;

      // Varying stroke properties for organic appearance
      const opacity = 0.7 + Math.random() * 0.2;
      const width = 3 + Math.random() * 2;

      // Draw progress line using rough canvas directly
      const roughCanvas = this.roughHelper.getRoughCanvas();
      const line = roughCanvas.generator.line(x1, y1, x2, y2, {
        stroke: '#ef4444',
        strokeWidth: width,
        roughness: this.roughnessLevel,
      });

      if (this.ctx) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        roughCanvas.draw(line);
        this.ctx.restore();
      }
    }

    // Add progress indicator at the end
    if (segments > 0) {
      const [endX, endY] = points[points.length - 1]!;
      // Draw progress indicator using rough canvas directly
      const roughCanvas = this.roughHelper.getRoughCanvas();
      const circle = roughCanvas.generator.circle(endX, endY, 8, {
        stroke: '#dc2626',
        fill: '#ef4444',
        fillStyle: 'solid',
        strokeWidth: 2,
        roughness: this.roughnessLevel * 1.2,
      });

      if (this.ctx) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        roughCanvas.draw(circle);
        this.ctx.restore();
      }
    }
  }

  protected drawTimeDisplay(): void {
    // Time display is handled separately in Wabi-sabi theme
    // The imperfect, hand-drawn aesthetic is maintained through external styling
  }

  protected drawClockHands(progress: number): void {
    if (!this.roughHelper) return;

    const center = this.center;
    const radius = this.radius;

    // Calculate hand positions based on progress
    const minutes = Math.floor(progress * 60);
    const hours = Math.floor(progress * 12);

    const minuteAngle = (minutes * Math.PI * 2) / 60 - Math.PI / 2;
    const hourAngle = (hours * Math.PI * 2) / 12 - Math.PI / 2;

    // Draw imperfect hour hand
    const hourLength = radius * 0.5;
    const hourEndX = center.x + Math.cos(hourAngle) * hourLength;
    const hourEndY = center.y + Math.sin(hourAngle) * hourLength;

    // Draw hour hand using rough canvas directly
    const roughCanvas = this.roughHelper.getRoughCanvas();
    const hourHand = roughCanvas.generator.line(center.x, center.y, hourEndX, hourEndY, {
      stroke: '#57534e',
      strokeWidth: 4 + (Math.random() - 0.5) * 0.8,
      roughness: this.roughnessLevel,
    });

    if (this.ctx) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.9;
      roughCanvas.draw(hourHand);
      this.ctx.restore();
    }

    // Draw imperfect minute hand
    const minuteLength = radius * 0.75;
    const minuteEndX = center.x + Math.cos(minuteAngle) * minuteLength;
    const minuteEndY = center.y + Math.sin(minuteAngle) * minuteLength;

    // Draw minute hand using rough canvas directly
    const minuteHand = roughCanvas.generator.line(center.x, center.y, minuteEndX, minuteEndY, {
      stroke: '#44403c',
      strokeWidth: 2.5 + (Math.random() - 0.5) * 0.5,
      roughness: this.roughnessLevel,
    });

    if (this.ctx) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.9;
      roughCanvas.draw(minuteHand);
      this.ctx.restore();
    }
  }

  public override render(progress: number, _theme: ThemeConfig): void {
    if (!this.initialized || !this.ctx) return;

    // Clear and setup
    this.drawBackground();

    // Draw clock elements with Wabi-sabi aesthetic
    this.drawTicks();

    // For Wabi-sabi, use clock hands instead of progress ring
    this.drawClockHands(progress);

    // Draw subtle progress indication around the edge
    this.drawProgressRing(progress);

    this.renderState.progress = progress;
    this.renderState.lastRenderTime = performance.now();
    this.renderState.isDirty = false;
  }

  public override setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    // Wabi-sabi aesthetic doesn't need aggressive animations
    // The natural imperfection provides visual interest
    if (isRunning) {
      // Add very subtle animation variations
      this.asymmetryFactor = 0.3 + Math.random() * 0.1;
    }
  }

  public override destroy(): void {
    // Call parent destroy
    super.destroy();

    // Reset aesthetic parameters
    this.roughnessLevel = 2.5;
    this.asymmetryFactor = 0.3;
  }
}
