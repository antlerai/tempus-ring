# Theme Implementation

## Theme Design Specifications

Based on the prototype designs in `design/prototypes/`, each theme must be implemented with precise visual fidelity:

### 1. Cloudlight Minimal (云光极简) - DOM Renderer

```typescript
// Visual Specifications
{
  renderer: 'DOM',
  background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
  colors: {
    background: '#f3f4f6',     // gray-100
    clockFace: '#ffffff',       // white
    border: '#e5e7eb',          // gray-200
    ticks: '#1f2937',           // gray-800
    hand: '#ef4444',            // red-500
    centerDot: '#1f2937',       // gray-800
    timeText: '#1f2937',        // gray-800
    buttons: '#e5e7eb'          // gray-200
  },
  dimensions: {
    clockSize: 320,             // w-80 h-80
    borderWidth: 8,             // border-8
    handWidth: 2,               // w-0.5
    handLength: '45%',
    centerDotSize: 12,          // w-3 h-3
    tickCount: 100,
    majorTickInterval: 10
  },
  animations: {
    handTransition: 'transform 1s linear',
    buttonHover: 'translateY(-2px) with shadow'
  }
}
```

### 2. Nightfall (暗夜时钟) - DOM Renderer

```typescript
// Visual Specifications
{
  renderer: 'DOM',
  background: '#000000',       // black
  clockGradient: `conic-gradient(
    #e2e8f0 90deg 126deg,     // slate-200
    #cbd5e1 126deg 162deg,    // slate-300
    #94a3b8 162deg 198deg,    // slate-400
    #64748b 198deg 234deg,    // slate-500
    #475569 234deg 270deg,    // slate-600
    #334155 270deg 306deg,    // slate-700
    #1e293b 306deg 342deg,    // slate-800
    #0f172a 342deg 360deg,    // slate-900
    // Repeat for smooth transition
  )`,
  colors: {
    clockFace: '#0f172a',       // slate-900
    border: '#475569',          // slate-700
    innerBorder: '#475569',     // slate-600
    ticks: 'rgba(226,232,240,0.7)', // slate-200/70
    hand: '#fb923c',            // orange-400
    centerDot: '#ffffff',       // white
    timeText: '#ffffff',        // white
    buttons: '#475569'          // slate-700
  }
}
```

### 3. Hand-Drawn Sketch (手绘素描) - SVG Renderer

```typescript
// Visual Specifications
{
  renderer: 'SVG',
  font: 'Kalam, cursive',
  background: '#EFEFEF',
  effects: {
    wobbleFilter: 'feTurbulence with feDisplacementMap',
    baseFrequency: 0.02,
    numOctaves: 3,
    scale: 3
  },
  clockPath: 'Hand-drawn circle with irregularities',
  colors: {
    stroke: '#333333',
    fill: '#EFEFEF',
    secondHand: '#ff0000',
    centerDot: '#ff0000'
  },
  strokeWidths: {
    clockFace: 4,
    hourHand: 6,
    minuteHand: 4,
    secondHand: 2
  },
  numbers: ['12', '3', '6', '9'] // Only show cardinal numbers
}
```

### 4. Artistic Sketch (艺术简笔画) - SVG Renderer

```typescript
// Visual Specifications
{
  renderer: 'SVG',
  fonts: {
    primary: 'Kalam, cursive',
    numbers: 'Caveat, cursive'
  },
  background: '#f8f6f0',
  dimensions: {
    size: 320,
    radius: 150
  },
  sketchyEffects: {
    strokeDasharray: '2,1',
    doubleStroke: true,        // Additional rotated border
    rotation: 'random(-2, 2)deg per element',
    minuteMarkWobble: true     // Random position offset
  },
  progressArc: {
    display: true,
    color: '#e74c3c',
    strokeWidth: 4,
    opacity: 0.7
  },
  colors: {
    stroke: '#333333',
    fill: '#ffffff',
    secondHand: '#e74c3c',
    buttons: '#ffffff with #333 border'
  }
}
```

#### 5. WabiSabi (侘寂) - Canvas Renderer

```typescript
// Visual Specifications
{
  renderer: 'Canvas',
  library: 'rough.js',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  paperTexture: {
    enabled: true,
    pattern: 'radial-gradient + linear-gradient overlay'
  },
  dynamicEffects: {
    outerCircleAnimation: true,  // Subtle shape morphing
    updateInterval: '150-250ms',
    wobbleAmount: 'canvasSize / 100',
    perlinNoise: true            // Organic movement
  },
  roughOptions: {
    roughness: 1.5,
    bowing: 1,
    strokeWidth: 2,
    fillStyle: 'hachure'
  },
  colors: {
    clockFace: '#ffffff',
    stroke: '#333333',
    hand: '#ef4444',
    timeText: '#1f2937'
  },
  responsive: {
    250: 'screenWidth <= 480',
    300: 'screenWidth <= 640',
    350: 'screenWidth <= 768',
    400: 'default'
  }
}
```

### 6. Dawn and Dusk (晨昏) - DOM Renderer

```typescript
// Visual Specifications
{
  renderer: 'DOM',
  backgrounds: {
    dawn: 'radial-gradient with light tones',
    body: 'radial-gradient(1200px 600px at 30% 20%, ...)'
  },
  clockGradient: `conic-gradient(
    from 0deg,
    #f8fafc 0deg 36deg,     // slate-50 (brightest at top)
    // Gradually darken clockwise
    #0f172a 324deg 360deg   // slate-900 (darkest before top)
  )`,
  handDesign: {
    style: 'triangular pointer tip',
    color: '#f59e0b',        // amber-500
    shadow: 'drop-shadow with amber glow',
    triangleTip: {
      width: 10,
      height: 25,
      position: 'top of hand'
    }
  },
  centerDot: {
    size: 15,
    color: '#f59e0b',        // amber-500
    effects: 'inset shadow for 3D appearance'
  },
  buttons: {
    style: 'glassmorphism',
    background: 'rgba(255,255,255,0.6)',
    backdropBlur: true,
    border: '#e2e8f0'        // slate-200
  }
}
```

## Theme CSS Implementation Guidelines

Each theme requires specific CSS files to achieve the prototype designs:

```css
/* src/styles/themes/theme-cloudlight.css */
.theme-cloudlight {
  --bg-primary: #f3f4f6;
  --clock-face: #ffffff;
  --clock-border: #e5e7eb;
  --tick-color: #1f2937;
  --hand-color: #ef4444;
  --text-color: #1f2937;
  --button-bg: #e5e7eb;
  --button-hover: #d1d5db;
  
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
}

.theme-cloudlight .clock-container {
  border: 8px solid var(--clock-border);
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
}

/* src/styles/themes/theme-nightfall.css */
.theme-nightfall {
  --bg-primary: #000000;
  --clock-face: #0f172a;
  --tick-color: rgba(226, 232, 240, 0.7);
  --hand-color: #fb923c;
  --text-color: #ffffff;
  
  background-color: #000000;
}

.theme-nightfall .clock-gradient {
  background: conic-gradient(
    #e2e8f0 90deg 126deg,
    #cbd5e1 126deg 162deg,
    #94a3b8 162deg 198deg,
    #64748b 198deg 234deg,
    #475569 234deg 270deg,
    #334155 270deg 306deg,
    #1e293b 306deg 342deg,
    #0f172a 342deg 360deg,
    #0f172a 0deg 18deg,
    #1e293b 18deg 54deg,
    #334155 54deg 90deg
  );
}

/* src/styles/themes/theme-dawndusk.css */
.theme-dawndusk {
  --hand-color: #f59e0b;
  --center-dot: #f59e0b;
  
  background: radial-gradient(
    1200px 600px at 30% 20%, 
    rgba(255,255,255,0.95), 
    rgba(241,245,249,0.92) 40%, 
    rgba(226,232,240,0.88) 100%
  ), #f5f7fb;
}

.theme-dawndusk .clock-gradient {
  background: conic-gradient(
    from 0deg,
    #f8fafc 0deg 36deg,
    #f1f5f9 36deg 72deg,
    #e2e8f0 72deg 108deg,
    #cbd5e1 108deg 144deg,
    #94a3b8 144deg 180deg,
    #64748b 180deg 216deg,
    #475569 216deg 252deg,
    #334155 252deg 288deg,
    #1e293b 288deg 324deg,
    #0f172a 324deg 360deg
  );
  box-shadow: 
    0 25px 50px -12px rgba(15, 23, 42, 0.25),
    inset 0 3px 4px rgba(255, 255, 255, 0.1),
    inset 0 -4px 6px rgba(15, 23, 42, 0.2);
}

.theme-dawndusk .hand::after {
  content: '';
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 25px solid var(--hand-color);
  filter: drop-shadow(0px -2px 2px rgba(0,0,0,0.2));
}

.theme-dawndusk button {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
}

/* src/styles/themes/theme-sketch.css */
.theme-sketch {
  --font-primary: 'Kalam', cursive;
  --bg-color: #EFEFEF;
  --stroke-color: #333333;
}

.theme-sketch svg {
  filter: url(#wobble-filter);
}

.theme-sketch #wobble-filter feTurbulence {
  baseFrequency: 0.02;
  numOctaves: 3;
}

/* src/styles/themes/theme-artistic.css */
.theme-artistic {
  --font-primary: 'Kalam', cursive;
  --font-numbers: 'Caveat', cursive;
  --bg-color: #f8f6f0;
  --stroke-color: #333333;
  --accent-color: #e74c3c;
}

.theme-artistic .sketchy-button {
  background: #fff;
  border: 2px solid #333;
  border-radius: 8px;
  position: relative;
}

.theme-artistic .sketchy-button::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: transparent;
  border: 2px solid #333;
  border-radius: 8px;
  transform: rotate(0.5deg);
  z-index: -1;
}

/* src/styles/themes/theme-wabisabi.css */
.theme-wabisabi {
  --font-display: 'Caveat', cursive;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  background-image: 
    radial-gradient(circle at 20% 50%, transparent 20%, rgba(255,255,255,0.3) 21%, rgba(255,255,255,0.3) 34%, transparent 35%),
    linear-gradient(0deg, rgba(255,255,255,0.1) 50%, transparent 50%);
  background-size: 75px 50px, 20px 20px;
}

.theme-wabisabi canvas {
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1));
  background: white;
  border-radius: 50%;
}
```
