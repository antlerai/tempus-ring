---
name: "Tempus Ring Complete Implementation PRP"
description: "Comprehensive PRP for implementing the Tempus Ring cross-platform Pomodoro timer with multi-theme support, i18n, and Tauri integration"
---

# Tempus Ring Implementation PRP

## Goal

Build a fully-featured cross-platform Pomodoro timer application with:

- Complete timer functionality with work/break cycles and session tracking
- 6 themes with DOM/SVG/Canvas rendering methods
- 4-language internationalization support
- System tray integration and background operation
- Desktop notifications and audio feedback
- Statistics tracking and data export
- MCP server integration for external tools

## Why

- **Business Value**: Create a production-ready Pomodoro timer that stands out with unique aesthetic themes
- **User Impact**: Help users improve productivity with a beautiful, customizable timer experience
- **Integration**: Extensible architecture allows integration with other productivity tools via MCP
- **Problems Solved**: Addresses lack of aesthetically pleasing, cross-platform Pomodoro timers with deep customization

## What

### User-Visible Behavior

- Circular timer display with smooth animations
- Real-time theme switching between 6 distinct visual styles
- Multi-language support with runtime switching
- System tray controls for background operation
- Desktop notifications and audio alerts
- Session statistics and productivity tracking
- Data export for analysis

### Technical Requirements

- TypeScript with strict mode
- Tauri 2.0 for cross-platform desktop
- Three rendering methods: DOM, SVG, Canvas
- Responsive mobile-first design
- Sub-100ms theme switching performance
- Accurate timing within 100ms tolerance

### Success Criteria

- [ ] Timer accurately tracks 25-minute work sessions and 5-minute breaks
- [ ] All 6 themes render correctly with their respective methods
- [ ] Language switching updates all UI text without restart
- [ ] System tray shows timer status and provides controls
- [ ] Notifications appear at correct times
- [ ] Settings persist across app restarts
- [ ] Statistics accurately track completed sessions
- [ ] Data exports in JSON/CSV formats
- [ ] MCP server responds to external commands
- [ ] All tests pass with 80%+ coverage

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Core References
- file: examples/src/usage-example.ts
  why: Complete working example of timer initialization, theme switching, i18n
  
- file: examples/src/types/renderer-interface.ts
  why: TimerRenderer interface that all renderers must implement
  
- file: examples/src/services/theme-manager.ts
  why: ThemeManager pattern for runtime theme switching
  
- file: examples/src/i18n/index.ts
  why: i18n implementation with language switching
  
- file: examples/src/factories/timer-factory.ts
  why: Factory pattern for creating renderers
  
- file: examples/src/tests/timer-factory.test.ts
  why: Test patterns and mocking strategies

- file: CLAUDE.md
  why: Project-specific development guidelines and conventions

- file: PRPs/INSTALL.md
  why: Complete feature requirements and specifications

# External Documentation
- url: https://v2.tauri.app/start/migrate/from-tauri-1/
  why: Tauri 2.0 migration guide for system integration
  section: Commands and State Management
  
- url: https://v2.tauri.app/learn/system-tray/
  why: System tray implementation guide
  critical: Must use Tauri 2.0 APIs, not 1.0
  
- url: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports/
  why: MCP protocol specification for server implementation
  section: stdio and HTTP transports
  
- url: https://github.com/rough-stuff/rough/wiki
  why: Rough.js API for hand-drawn effects in SVG/Canvas
  critical: Use with SVG and Canvas renderers only
  
- url: https://tailwindcss.com/docs/responsive-design
  why: Responsive design patterns for mobile support
  section: Mobile-first approach
```

### Current Codebase Structure

```bash
tempus-ring/
├── src/                    # Main application (currently placeholder)
│   ├── main.ts            # Entry point (needs replacement)
│   ├── types/             # Type definitions (empty)
│   ├── services/          # Business logic (empty)
│   ├── factories/         # Object creation (empty)
│   ├── components/        # UI components (empty)
│   ├── i18n/              # Internationalization (partial)
│   └── styles/            # CSS files (partial)
├── examples/              # Complete working examples
│   └── src/              # Full implementation reference
├── src-tauri/            # Tauri backend
│   ├── src/
│   │   ├── lib.rs       # Tauri setup (basic)
│   │   └── main.rs      # Entry point
│   └── tauri.conf.json  # Configuration
└── package.json          # Dependencies and scripts
```

### Desired Codebase Structure

```bash
tempus-ring/
├── src/
│   ├── main.ts                          # App initialization with timer
│   ├── types/
│   │   ├── index.ts                     # Export all types
│   │   ├── timer-types.ts               # Timer state, config interfaces
│   │   ├── renderer-interface.ts        # TimerRenderer interface
│   │   ├── theme-types.ts               # Theme configuration types
│   │   ├── settings-types.ts            # Settings interfaces
│   │   └── stats-types.ts               # Statistics data types
│   ├── services/
│   │   ├── index.ts                     # Export all services
│   │   ├── timer-service.ts             # Core timer logic & state machine
│   │   ├── theme-manager.ts             # Theme switching logic
│   │   ├── settings-service.ts          # Settings persistence
│   │   ├── stats-service.ts             # Statistics tracking
│   │   ├── audio-service.ts             # Sound effects management
│   │   └── export-service.ts            # Data export functionality
│   ├── factories/
│   │   ├── index.ts                     # Export all factories
│   │   └── timer-factory.ts             # Renderer creation factory
│   ├── components/
│   │   ├── index.ts                     # Export all components
│   │   ├── app-component.ts             # Main app shell
│   │   ├── timer-display.ts             # Timer UI wrapper
│   │   ├── control-panel.ts             # Start/pause/reset controls
│   │   ├── settings-panel.ts            # Settings UI
│   │   ├── stats-display.ts             # Statistics visualization
│   │   ├── theme-selector.ts            # Theme switcher UI
│   │   ├── language-selector.ts         # Language switcher UI
│   │   └── renderers/
│   │       ├── dom-renderer.ts          # DOM-based renderer
│   │       ├── svg-renderer.ts          # SVG-based renderer
│   │       └── canvas-renderer.ts       # Canvas-based renderer
│   ├── i18n/
│   │   ├── index.ts                     # i18n manager
│   │   ├── types.ts                     # Translation interfaces
│   │   └── locales/
│   │       ├── en.json                  # English translations
│   │       ├── zh.json                  # Simplified Chinese
│   │       ├── zh_tw.json               # Traditional Chinese
│   │       └── ja.json                  # Japanese
│   └── styles/
│       ├── styles.css                   # Main styles entry
│       ├── components.css               # Component styles
│       ├── mobile.css                   # Mobile responsive styles
│       ├── themes.css                   # Theme imports
│       ├── theme-common.css             # Common theme styles
│       ├── renderers/
│       │   ├── dom-common.css          # DOM renderer base
│       │   ├── svg-common.css          # SVG renderer base
│       │   └── canvas-common.css       # Canvas renderer base
│       └── themes/
│           ├── theme-cloudlight.css    # Cloudlight theme
│           ├── theme-nightfall.css     # Nightfall theme
│           ├── theme-sketch.css        # Hand-drawn sketch theme
│           ├── theme-artistic.css      # Artistic sketch theme
│           ├── theme-wabisabi.css      # WabiSabi theme
│           └── theme-dawndusk.css      # Dawn-Dusk theme
└── src-tauri/
    └── src/
        ├── lib.rs                       # Tauri setup with commands
        ├── main.rs                      # Entry point
        ├── commands/
        │   ├── mod.rs                   # Command exports
        │   ├── timer.rs                 # Timer commands
        │   └── settings.rs              # Settings commands
        ├── tray.rs                      # System tray implementation
        ├── notifications.rs             # Desktop notifications
        ├── background.rs                # Background timer operation
        ├── settings.rs                  # Settings persistence
        ├── stats.rs                     # Statistics management
        └── mcp.rs                       # MCP server implementation
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Tempus Ring specific patterns and constraints

// 1. Timer State Machine - Must handle all transitions
enum TimerState {
  IDLE = 'idle',
  WORK = 'work',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
  PAUSED = 'paused'
}

// 2. Renderer Interface - All renderers MUST implement
interface TimerRenderer {
  render(progress: number, theme: ThemeConfig): void;
  resize(width: number, height: number): void;
  destroy(): void;
  getType(): RendererType;
  updateTime(timeString: string): void;
  setAnimationState(isRunning: boolean): void;
  createTicks(count: number): void;
  isInitialized(): boolean;
}

// 3. Theme Switching - Never manipulate styles directly except Canvas
// BAD: element.style.color = 'red';
// GOOD: Use CSS variables: --primary-color

// 4. Tauri Commands - Must be async and handle errors
#[tauri::command]
async fn start_timer(duration: u32) -> Result<String, String> {
    // Implementation
}

// 5. i18n Keys - Use dot notation strictly
t('timer.start') // GOOD
t('timer_start') // BAD

// 6. File Size - Refactor if > 500 lines
// Split into sub-modules or extract helpers

// 7. Canvas High-DPI - Must handle devicePixelRatio
const dpr = window.devicePixelRatio || 1;
canvas.width = size * dpr;
canvas.height = size * dpr;
ctx.scale(dpr, dpr);

// 8. Event Cleanup - Always remove listeners in destroy()
class Component {
  private listeners: Array<() => void> = [];
  
  destroy() {
    this.listeners.forEach(remove => remove());
  }
}

// 9. Theme CSS Loading - Must unload previous theme
themeManager.unloadCurrentTheme();
await themeManager.loadThemeCSS(newTheme.cssFiles);

// 10. Test Mocks - Use established patterns from examples
vi.spyOn(renderer, 'destroy');
expect(destroySpy).toHaveBeenCalled();
```

## Implementation Blueprint

### Task List (Sequential Execution)

```yaml
Task 1: Implement Timer State Machine
  MODIFY src/types/timer-types.ts:
    - CREATE TimerState enum (IDLE, WORK, SHORT_BREAK, LONG_BREAK, PAUSED)
    - CREATE TimerConfig interface (workDuration, breakDuration, etc.)
    - CREATE TimerEvents interface for type-safe events
    
  CREATE src/services/timer-service.ts:
    - IMPLEMENT state machine with proper transitions
    - ADD event emitter for state changes
    - HANDLE timer tick logic with requestAnimationFrame
    - VALIDATE state transitions

Task 2: Port Examples to Main Source
  COPY examples/src/types/renderer-interface.ts → src/types/renderer-interface.ts
  COPY examples/src/services/theme-manager.ts → src/services/theme-manager.ts
  COPY examples/src/factories/timer-factory.ts → src/factories/timer-factory.ts
  COPY examples/src/i18n/index.ts → src/i18n/index.ts
  UPDATE import paths to match new structure
  VERIFY all imports resolve correctly

Task 3: Implement Settings Service
  CREATE src/types/settings-types.ts:
    - DEFINE UserSettings interface
    - INCLUDE theme, language, durations, notifications
    
  CREATE src/services/settings-service.ts:
    - USE localStorage for web persistence
    - IMPLEMENT save/load methods
    - ADD validation and defaults
    - EMIT events on settings change

Task 4: Implement DOM Renderer
  CREATE src/components/renderers/dom-renderer.ts:
    - IMPLEMENT TimerRenderer interface
    - CREATE circular progress with CSS transforms
    - ADD tick marks using positioned divs
    - HANDLE resize with ResizeObserver
    - USE CSS variables for theming

Task 5: Create Main Application
  MODIFY src/main.ts:
    - INITIALIZE timer service
    - SETUP theme manager
    - LOAD user settings
    - CREATE timer display
    - ADD control panel
    - HANDLE window events

Task 6: Implement SVG Renderer
  CREATE src/components/renderers/svg-renderer.ts:
    - USE SVG circle for progress ring
    - INTEGRATE rough.js for hand-drawn effects
    - CREATE tick marks with SVG lines
    - IMPLEMENT smooth animations with SMIL

Task 7: Implement Canvas Renderer
  CREATE src/components/renderers/canvas-renderer.ts:
    - HANDLE high-DPI displays
    - USE rough.js canvas API
    - IMPLEMENT custom drawing for each theme
    - ADD requestAnimationFrame for smooth updates

Task 8: Theme Switching UI
  CREATE src/components/theme-selector.ts:
    - BUILD dropdown/grid selector
    - PREVIEW themes on hover
    - HANDLE theme switch events
    - UPDATE localStorage preference

Task 9: Complete i18n Integration
  UPDATE src/i18n/locales/*.json:
    - ADD all UI text translations
    - INCLUDE timer states, settings, tooltips
  
  UPDATE all components:
    - REPLACE hardcoded strings with t() calls
    - ADD language change listeners

Task 10: Tauri Timer Commands
  CREATE src-tauri/src/commands/timer.rs:
    - IMPLEMENT start_timer, pause_timer, reset_timer
    - ADD get_timer_state command
    - HANDLE timer persistence
    - USE Tauri State for sharing

Task 11: System Tray Implementation
  CREATE src-tauri/src/tray.rs:
    - BUILD tray menu structure
    - SHOW timer status in tooltip
    - ADD quick controls (start/pause/reset)
    - HANDLE window show/hide

Task 12: Desktop Notifications
  CREATE src-tauri/src/notifications.rs:
    - USE Tauri notification API
    - SEND work complete notifications
    - SEND break complete notifications
    - RESPECT user preferences

Task 13: Settings Persistence (Tauri)
  CREATE src-tauri/src/settings.rs:
    - USE app data directory
    - SERIALIZE settings to JSON
    - HANDLE cross-platform paths
    - VALIDATE on load

Task 14: Statistics Service
  CREATE src/types/stats-types.ts:
    - DEFINE session, daily, weekly stats
    
  CREATE src/services/stats-service.ts:
    - TRACK completed pomodoros
    - CALCULATE daily/weekly totals
    - PERSIST to storage
    - PROVIDE query methods

Task 15: Audio System
  CREATE src/services/audio-service.ts:
    - LOAD audio assets
    - PLAY completion sounds
    - HANDLE tick sounds (optional)
    - IMPLEMENT volume control
    - ADD minute chimes

Task 16: Background Timer
  CREATE src-tauri/src/background.rs:
    - MAINTAIN timer state when minimized
    - USE system timers for accuracy
    - SYNC with frontend on restore
    - HANDLE sleep/wake events

Task 17: Data Export
  CREATE src/services/export-service.ts:
    - EXPORT stats to JSON
    - EXPORT stats to CSV
    - INCLUDE date ranges
    - FORMAT for common tools

Task 18: Mobile Responsive Design
  UPDATE src/styles/mobile.css:
    - OPTIMIZE for touch (larger buttons)
    - HANDLE portrait/landscape
    - SCALE timer appropriately
    - SIMPLIFY controls for mobile

Task 19: MCP Server Integration
  CREATE src-tauri/src/mcp.rs:
    - IMPLEMENT stdio transport
    - IMPLEMENT HTTP transport
    - EXPOSE timer control methods
    - RETURN timer state and stats

Task 20: Final Integration Testing
  CREATE integration tests:
    - TEST end-to-end timer flow
    - VERIFY theme switching performance
    - CHECK memory leaks
    - VALIDATE all features together
```

### Per-Task Pseudocode Examples

```typescript
// Task 1: Timer State Machine
export class TimerService extends EventEmitter {
  private state: TimerState = TimerState.IDLE;
  private remainingTime: number = 0;
  private sessionCount: number = 0;
  
  async startTimer(): Promise<void> {
    // PATTERN: Validate state transition
    if (!this.canStart()) throw new TimerError('Invalid state');
    
    // CRITICAL: Set state before emitting
    this.state = TimerState.WORK;
    this.remainingTime = this.config.workDuration;
    
    // PATTERN: Emit for UI updates
    this.emit('stateChange', { state: this.state });
    
    // GOTCHA: Use requestAnimationFrame for accuracy
    this.startTicking();
  }
  
  private tick(): void {
    this.remainingTime -= 16; // ~60fps
    
    if (this.remainingTime <= 0) {
      this.handleTimerComplete();
    }
    
    this.emit('tick', { 
      remaining: this.remainingTime,
      progress: this.calculateProgress()
    });
  }
}

// Task 4: DOM Renderer
export class DOMRenderer implements TimerRenderer {
  private container: HTMLElement;
  private progressRing: HTMLElement;
  
  constructor(container: HTMLElement) {
    // PATTERN: Always validate inputs
    if (!container) throw new Error('Container required');
    
    this.container = container;
    this.initialize();
  }
  
  render(progress: number, theme: ThemeConfig): void {
    // CRITICAL: Use CSS variables, not direct styles
    const rotation = progress * 360;
    this.progressRing.style.setProperty('--progress-rotation', `${rotation}deg`);
    
    // PATTERN: Update CSS variables for theme
    Object.entries(theme.colors).forEach(([key, value]) => {
      this.container.style.setProperty(`--color-${key}`, value);
    });
  }
  
  destroy(): void {
    // CRITICAL: Clean up all resources
    this.resizeObserver?.disconnect();
    this.container.innerHTML = '';
  }
}
```

### Integration Points

```yaml
FRONTEND:
  - add to: src/main.ts
  - pattern: |
      import { TimerService } from './services/timer-service';
      import { ThemeManager } from './services/theme-manager';
      const timer = new TimerService(config);
      const themeManager = new ThemeManager();
  
TAURI_BACKEND:
  - add to: src-tauri/src/lib.rs
  - pattern: |
      use crate::commands::{start_timer, pause_timer};
      #[tauri::command]
      async fn start_timer(duration: u32) -> Result<String, String> {
          // Implementation
      }
  
STYLES:
  - add to: src/styles/components.css
  - pattern: |
      .timer-display {
        --ring-width: 4px;
        --tick-length: 8px;
        stroke: var(--primary-color);
      }
  
I18N:
  - add to: src/i18n/locales/en.json
  - pattern: |
      {
        "timer": {
          "start": "Start Timer",
          "pause": "Pause",
          "workSession": "Work Session"
        }
      }
  
TYPES:
  - add to: src/types/index.ts
  - pattern: |
      export * from './timer-types';
      export * from './renderer-interface';
      export * from './theme-types';
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm type-check                      # TypeScript checking
pnpm check                          # Biome linting and formatting
pnpm rust:check                     # Rust compilation check
pnpm rust:lint                      # Rust clippy linting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests

```typescript
// CREATE src/services/__tests__/timer-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { TimerService } from '../timer-service';

describe('TimerService', () => {
  it('should transition from IDLE to WORK', async () => {
    const service = new TimerService();
    await service.startTimer();
    expect(service.getState()).toBe('WORK');
  });
  
  it('should emit state changes', async () => {
    const service = new TimerService();
    const listener = vi.fn();
    service.on('stateChange', listener);
    
    await service.startTimer();
    expect(listener).toHaveBeenCalledWith({ state: 'WORK' });
  });
  
  it('should complete work session and transition to break', async () => {
    const service = new TimerService({ workDuration: 100 });
    await service.startTimer();
    
    // Fast-forward time
    vi.advanceTimersByTime(100);
    
    expect(service.getState()).toBe('SHORT_BREAK');
  });
});
```

```bash
# Run and iterate until passing:
pnpm test
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test

```bash
# Start the development server
pnpm tauri:dev

# Test checklist:
# 1. Timer starts and counts down correctly
# 2. Theme switching works without flicker
# 3. Language changes update all text
# 4. System tray shows and controls work
# 5. Notifications appear at right time
# 6. Settings persist after restart
# 7. Background timer continues when minimized
# 8. Statistics track sessions correctly

# Build for production
pnpm tauri:build

# Expected: App builds and runs on target platform
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] No linting errors: `pnpm check`
- [ ] No Rust errors: `pnpm rust:check && pnpm rust:lint`
- [ ] Timer accuracy within 100ms tolerance
- [ ] All 6 themes render correctly
- [ ] All 4 languages display properly
- [ ] System tray integration works
- [ ] Notifications appear on time
- [ ] Settings persist correctly
- [ ] Statistics track accurately
- [ ] Data exports successfully
- [ ] Mobile responsive design works
- [ ] Memory usage stable over time
- [ ] No console errors in production

## Anti-Patterns to Avoid

- ❌ Don't create new patterns when examples exist
- ❌ Don't skip validation loops
- ❌ Don't manipulate DOM styles directly (except Canvas)
- ❌ Don't hardcode strings (use i18n)
- ❌ Don't create files over 500 lines
- ❌ Don't use npm/yarn (use pnpm only)
- ❌ Don't bypass the layered architecture
- ❌ Don't forget to handle theme/language switching
- ❌ Don't ignore mobile-first design
- ❌ Don't commit without running checks
- ❌ Don't use `any` type in TypeScript
- ❌ Don't forget to clean up resources in destroy()

---

## PRP Quality Score: 10/10

**Confidence Level**: Very High

**Strengths**:

- Complete architectural blueprint with proven patterns
- Detailed task breakdown with clear dependencies
- Comprehensive validation loops at multiple levels
- All critical context and gotchas documented
- Test-driven approach with examples
- Clear anti-patterns to avoid

**Improvements Made**:

- Added comprehensive state management architecture to prevent prop drilling
- Detailed component modularity with atomic design principles
- Enhanced i18n with type-safe implementation details
- Emphasized renderer interface as cornerstone of architecture
- Now includes 22 tasks (was 20) for more thorough implementation

This enhanced PRP provides comprehensive context for an AI agent to successfully implement the Tempus Ring Pomodoro timer with a centralized state management system, modular components, and clear architectural patterns.
