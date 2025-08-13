---
name: "Tempus Ring - Complete Pomodoro Timer Implementation"
description: "Comprehensive PRP for implementing a full-featured cross-platform Pomodoro timer with themes, i18n, system tray, and MCP integration"
confidence_score: 8.5/10
---

# PRP: Tempus Ring - Complete Pomodoro Timer Implementation

## Goal

Build a fully functional cross-platform Pomodoro timer application called "Tempus Ring" with multi-theme support (DOM/SVG/Canvas renderers), internationalization (4 languages), system tray integration, timer state management, notification system, and MCP server integration. The application should work on macOS, Linux, Windows with future mobile support.

## Why

- **Productivity Enhancement**: Provide users with a beautiful, customizable Pomodoro timer to improve focus and time management
- **Cross-platform Accessibility**: Desktop and future mobile support ensures users can track their productivity anywhere
- **Aesthetic Choice**: Multiple themes allow users to personalize their experience (WabiSabi, Cloudlight, Dawn-Dusk, etc.)
- **Language Inclusivity**: Support for Chinese (Simplified/Traditional), English, and Japanese
- **Developer Integration**: MCP server allows AI assistants and other tools to interact with the timer

## What

### User-Visible Features

- Circular timer with percentage/clock modes
- 6 themed renderers (DOM, SVG, Canvas implementations)
- Work/break cycle automation (25min work, 5min short break, 15-30min long break)
- Session tracking and statistics
- System notifications and sound alerts
- System tray integration with background running
- Runtime theme and language switching
- MCP server for external tool integration

### Success Criteria

- [ ] Timer accurately tracks 25-minute work sessions and breaks
- [ ] All 6 themes render correctly with their specified renderer types
- [ ] Language switching works without app restart
- [ ] System tray allows background operation
- [ ] Notifications trigger at session end
- [ ] MCP server exposes timer API
- [ ] All tests pass and code quality checks succeed

## All Needed Context

### Documentation & References

```yaml
# External Documentation
- url: https://v2.tauri.app/learn/system-tray/
  why: System tray implementation with menu and event handling in Tauri 2.0
  
- url: https://v2.tauri.app/develop/calling-rust/
  why: Tauri command patterns for frontend-backend communication
  
- url: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports
  why: MCP protocol stdio and Streamable HTTP transport specifications
  
- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: Official TypeScript SDK for MCP server implementation
  
- url: https://roughjs.com/
  why: Rough.js API for hand-drawn Canvas effects (WabiSabi, Hand-Drawn themes)
  
- url: https://tailwindcss.com/docs/upgrade-guide
  why: Tailwind CSS v4 migration and new features (@import syntax, performance)

# Project Files to Reference
- file: examples/src/usage-example.ts
  why: Complete timer implementation pattern with theme switching and i18n
  
- file: examples/src/types/renderer-interface.ts
  why: TimerRenderer interface that all renderers must implement
  
- file: examples/src/factories/timer-factory.ts
  why: Factory pattern for creating theme-specific renderers
  
- file: examples/src/services/theme-manager.ts
  why: Theme management and switching logic
  
- file: examples/src/i18n/index.ts
  why: Internationalization setup and language switching
  
- file: design/prototypes/WabiSabi.html
  why: WabiSabi theme visual reference with Canvas/Rough.js implementation
  
- file: CLAUDE.md
  why: Project-specific conventions and guidelines
  
- file: PRPs/templates/prp_base.md
  why: PRP template structure and validation requirements
```

### Current Codebase Structure

```bash
tempus-ring/
├── src/                      # Frontend TypeScript code
│   ├── main.ts              # Entry point (currently minimal)
│   ├── assets/              # Static assets
│   ├── components/          # UI components
│   │   └── renderers/       # Theme renderers (empty)
│   ├── factories/           # Object creation
│   ├── i18n/               # Internationalization
│   │   └── locales/        # Language files (empty)
│   ├── services/           # Business logic
│   ├── styles/             # CSS files
│   │   └── themes/         # Theme styles (empty)
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Utility functions
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs        # Entry point
│   │   └── lib.rs         # Tauri app setup
│   └── tauri.conf.json    # Tauri configuration
├── examples/               # Reference implementations
└── design/prototypes/      # HTML theme prototypes
```

### Desired Codebase Structure

```bash
tempus-ring/
├── src/
│   ├── main.ts                    # Initialize app, theme, i18n, timer
│   ├── components/
│   │   ├── timer-display.ts       # Main timer UI component
│   │   ├── control-panel.ts       # Start/pause/reset controls
│   │   ├── settings-panel.ts      # Theme/language/duration settings
│   │   └── renderers/
│   │       ├── dom-renderer.ts    # DOM-based renderer
│   │       ├── svg-renderer.ts    # SVG-based renderer
│   │       └── canvas-renderer.ts # Canvas-based renderer
│   ├── services/
│   │   ├── timer-service.ts       # Core timer state machine
│   │   ├── theme-manager.ts       # Theme switching logic
│   │   ├── notification-service.ts # System notifications
│   │   ├── statistics-service.ts   # Session tracking
│   │   ├── mcp-server.ts          # MCP protocol server
│   │   └── storage-service.ts     # Data persistence
│   ├── factories/
│   │   └── timer-factory.ts       # Renderer creation factory
│   ├── i18n/
│   │   ├── index.ts               # i18n initialization
│   │   └── locales/
│   │       ├── en.json           # English translations
│   │       ├── ja.json           # Japanese translations
│   │       ├── zh-CN.json        # Simplified Chinese
│   │       └── zh-TW.json        # Traditional Chinese
│   ├── types/
│   │   ├── index.ts              # Export all types
│   │   ├── timer-types.ts        # Timer state, config interfaces
│   │   ├── theme-types.ts        # Theme configuration types
│   │   └── renderer-types.ts     # Renderer interface
│   ├── styles/
│   │   ├── global.css            # Global styles with Tailwind
│   │   ├── theme-common.css      # Common theme variables
│   │   └── themes/
│   │       ├── wabisabi.css      # WabiSabi theme styles
│   │       ├── cloudlight.css    # Cloudlight theme styles
│   │       ├── dawn-dusk.css     # Dawn-Dusk theme styles
│   │       ├── nightfall.css     # Nightfall theme styles
│   │       ├── artistic.css      # Artistic Sketch styles
│   │       └── hand-drawn.css    # Hand-drawn theme styles
│   └── utils/
│       ├── time-helpers.ts       # Time formatting utilities
│       └── rough-helpers.ts      # Rough.js canvas utilities
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   │   ├── mod.rs            # Command module exports
│   │   │   ├── timer.rs          # Timer-related commands
│   │   │   ├── settings.rs       # Settings commands
│   │   │   └── statistics.rs     # Statistics commands
│   │   ├── services/
│   │   │   ├── mod.rs            # Service module exports
│   │   │   ├── timer_state.rs    # Timer state management
│   │   │   └── storage.rs        # Data persistence
│   │   ├── tray.rs              # System tray implementation
│   │   ├── lib.rs               # Updated with commands and tray
│   │   └── main.rs              # Entry point
│   └── tauri.conf.json          # Updated configuration
└── tests/
    ├── timer-service.test.ts     # Timer logic tests
    ├── theme-manager.test.ts     # Theme switching tests
    └── mcp-server.test.ts        # MCP protocol tests
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Tempus Ring specific patterns and constraints

// 1. Rough.js Animation Issue
// Rough.js randomizes patterns each draw, causing jitter in animations
// Solution: Pre-generate drawable objects and reuse them
const clockFace = roughCanvas.generator.circle(x, y, diameter, options);
roughCanvas.draw(clockFace); // Reuse same object for stable animation

// 2. Tailwind CSS v4 Changes
// Use @import "tailwindcss" instead of @tailwind directives
// CSS-first configuration, no tailwind.config.js needed

// 3. Tauri 2.0 System Tray
// Use TrayIconBuilder, not the old SystemTray API
// tray-icon feature must be enabled in Cargo.toml

// 4. MCP Server Implementation
// Support both stdio (local) and Streamable HTTP (remote)
// Session management requires cryptographically secure IDs

// 5. File Size Constraint
// Keep all files under 500 lines - split if larger

// 6. CSS Variable Usage
// Never manipulate styles directly except in Canvas renderer
// Use CSS variables for all theme switching

// 7. Layered Architecture
// Strict dependency flow: types → services → factories → components
// Never bypass this hierarchy

// 8. i18n Key Format
// Use dot notation: "timer.start", "settings.theme"
// Never hardcode strings in components
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/types/timer-types.ts
export enum TimerState {
  IDLE = 'idle',
  WORK = 'work',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
  PAUSED = 'paused'
}

export interface TimerConfig {
  workDuration: number;      // seconds (default: 1500 = 25min)
  shortBreakDuration: number; // seconds (default: 300 = 5min)
  longBreakDuration: number;  // seconds (default: 900 = 15min)
  sessionsUntilLongBreak: number; // default: 4
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface TimerSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  type: TimerState;
  completed: boolean;
}

// src/types/renderer-types.ts
export interface TimerRenderer {
  render(progress: number, theme: ThemeConfig): void;
  resize(width: number, height: number): void;
  destroy(): void;
  getType(): RendererType;
  updateTime(timeString: string): void;
  setAnimationState(isRunning: boolean): void;
  createTicks(count: number): void;
  isInitialized(): boolean;
}
```

### Task List for Implementation

```yaml
Task 1: Create Core Type Definitions
  CREATE src/types/timer-types.ts:
    - Define TimerState enum (IDLE, WORK, SHORT_BREAK, LONG_BREAK, PAUSED)
    - Define TimerConfig interface with duration settings
    - Define TimerSession interface for tracking
    - Define TimerEvents type for event emitter
    
  CREATE src/types/theme-types.ts:
    - Copy ThemeConfig interface from examples
    - Define ThemeDefinition with renderer mapping
    - Add theme name constants
    
  CREATE src/types/renderer-types.ts:
    - Copy TimerRenderer interface from examples
    - Define RendererType union ('dom' | 'svg' | 'canvas')
    - Add animation style types

Task 2: Implement Timer State Machine Service
  CREATE src/services/timer-service.ts:
    - Implement state machine with proper transitions
    - Add timer tick logic using setInterval
    - Emit events for state changes
    - Handle pause/resume functionality
    - Calculate remaining time and progress
    - Auto-transition between work/break states

Task 3: Write Timer Service Tests
  CREATE tests/timer-service.test.ts:
    - Test state transitions (IDLE → WORK → SHORT_BREAK)
    - Test pause/resume functionality
    - Test auto-transition settings
    - Test time calculation accuracy
    - Test event emissions

Task 4: Setup Internationalization System
  CREATE src/i18n/locales/en.json:
    - Add timer control texts (start, pause, reset)
    - Add settings labels (theme, language, durations)
    - Add notification messages
    
  CREATE src/i18n/locales/zh-CN.json:
    - Chinese translations for all keys
    
  CREATE src/i18n/locales/zh-TW.json:
    - Traditional Chinese translations
    
  CREATE src/i18n/locales/ja.json:
    - Japanese translations
    
  UPDATE src/i18n/index.ts:
    - Implement language detection
    - Add switchLanguage function
    - Setup translation function t()

Task 5: Create Theme Manager Service
  CREATE src/services/theme-manager.ts:
    - Copy and adapt from examples
    - Map themes to renderer types
    - Handle CSS variable switching
    - Emit theme change events
    - Load theme stylesheets dynamically

Task 6: Implement DOM Renderer
  CREATE src/components/renderers/dom-renderer.ts:
    - Implement TimerRenderer interface
    - Create circular progress ring with CSS
    - Add tick marks (100 for percentage mode)
    - Update time display
    - Handle animations with CSS transitions

Task 7: Implement SVG Renderer
  CREATE src/components/renderers/svg-renderer.ts:
    - Implement TimerRenderer interface
    - Create SVG circle and path elements
    - Add tick marks as SVG lines
    - Implement clock hands for time mode
    - Use SVG animations for smooth transitions

Task 8: Implement Canvas Renderer with Rough.js
  CREATE src/components/renderers/canvas-renderer.ts:
    - Implement TimerRenderer interface
    - Setup Rough.js canvas
    - Pre-generate drawable objects to avoid jitter
    - Implement hand-drawn circle and ticks
    - Add artistic/sketch effects for themes
    
  CREATE src/utils/rough-helpers.ts:
    - Helper functions for Rough.js shapes
    - Caching logic for stable animations

Task 9: Write Renderer Tests
  CREATE tests/renderers.test.ts:
    - Test DOM renderer initialization
    - Test SVG renderer tick generation
    - Test Canvas renderer with mock Rough.js
    - Test renderer switching

Task 10: Create Timer Factory
  UPDATE src/factories/timer-factory.ts:
    - Copy and adapt from examples
    - Add renderer caching
    - Handle theme-to-renderer mapping
    - Implement renderer switching logic

Task 11: Build Control Panel Component
  CREATE src/components/control-panel.ts:
    - Start/pause/reset buttons
    - Connect to timer service
    - Update button states based on timer
    - Use i18n for button labels

Task 12: Build Settings Panel Component
  CREATE src/components/settings-panel.ts:
    - Theme selector dropdown
    - Language selector dropdown
    - Duration input fields
    - Sound toggle switches
    - Save settings to storage

Task 13: Create Timer Display Component
  CREATE src/components/timer-display.ts:
    - Container for renderer
    - Time text display
    - Session counter
    - Progress indicators

Task 14: Implement Notification Service
  CREATE src/services/notification-service.ts:
    - Request notification permissions
    - Send desktop notifications
    - Play sound alerts
    - Handle notification clicks

Task 15: Write Notification Service Tests
  CREATE tests/notification-service.test.ts:
    - Test permission requests
    - Test notification display
    - Test sound playback
    - Mock browser APIs

Task 16: Setup Rust Backend Timer Commands
  CREATE src-tauri/src/commands/timer.rs:
    - start_timer command
    - pause_timer command
    - reset_timer command
    - get_timer_state command
    
  CREATE src-tauri/src/commands/mod.rs:
    - Export all command modules

Task 17: Implement System Tray in Rust
  CREATE src-tauri/src/tray.rs:
    - Create tray icon with menu
    - Add Start/Pause item
    - Add Settings item
    - Add Quit item
    - Handle menu events
    
  UPDATE src-tauri/Cargo.toml:
    - Add tray-icon feature
    
  UPDATE src-tauri/src/lib.rs:
    - Initialize tray in setup
    - Register menu event handlers

Task 18: Write Rust Backend Tests
  CREATE src-tauri/tests/commands.rs:
    - Test timer commands
    - Test state management
    - Test error handling

Task 19: Create Storage Service
  CREATE src/services/storage-service.ts:
    - Save/load user preferences
    - Store timer statistics
    - Handle localStorage/Tauri store
    
  CREATE src-tauri/src/services/storage.rs:
    - Implement file-based storage
    - Handle preferences persistence

Task 20: Implement Statistics Service  
  CREATE src/services/statistics-service.ts:
    - Track completed pomodoros
    - Calculate daily/weekly stats
    - Generate reports
    - Export data functionality

Task 21: Write Statistics Service Tests
  CREATE tests/statistics-service.test.ts:
    - Test session tracking
    - Test statistics calculations
    - Test data export

Task 22: Setup MCP Server Implementation
  CREATE src/services/mcp-server.ts:
    - Initialize MCP server with TypeScript SDK
    - Implement stdio transport
    - Implement Streamable HTTP transport
    - Expose timer control methods
    - Handle session management

Task 23: Write MCP Server Tests
  CREATE tests/mcp-server.test.ts:
    - Test server initialization
    - Test command handling
    - Test transport protocols
    - Mock MCP SDK

Task 24: Create Theme Stylesheets
  CREATE src/styles/theme-common.css:
    - Common CSS variables
    - Base layout styles
    - Shared animations
    
  CREATE src/styles/themes/wabisabi.css:
    - WabiSabi theme variables
    - Canvas-specific styles
    
  CREATE src/styles/themes/cloudlight.css:
    - Cloudlight theme variables
    - DOM renderer styles
    
  CREATE src/styles/themes/dawn-dusk.css:
    - Dawn-Dusk theme variables
    - Gradient effects
    
  CREATE src/styles/themes/nightfall.css:
    - Dark theme variables
    - Night sky effects
    
  CREATE src/styles/themes/artistic.css:
    - Artistic sketch variables
    
  CREATE src/styles/themes/hand-drawn.css:
    - Hand-drawn SVG styles

Task 25: Update Main Application Entry
  UPDATE src/main.ts:
    - Initialize i18n system
    - Create theme manager
    - Initialize timer service
    - Setup timer factory
    - Mount components
    - Connect event handlers
    - Initialize MCP server

Task 26: Update Tauri Configuration
  UPDATE src-tauri/tauri.conf.json:
    - Set app name to "Tempus Ring"
    - Configure window size for mobile-first
    - Add system tray configuration
    - Update bundle identifier

Task 27: Setup Global Styles with Tailwind v4
  UPDATE src/styles/global.css:
    - Add @import "tailwindcss"
    - Setup responsive breakpoints
    - Configure base styles

Task 28: Integration Testing
  CREATE tests/integration/app.test.ts:
    - Test full timer cycle
    - Test theme switching during timer
    - Test language switching
    - Test persistence across restart

Task 29: Update Build Configuration
  UPDATE vite.config.ts:
    - Add Tailwind CSS v4 plugin
    - Configure build optimization
    
  UPDATE tsconfig.json:
    - Ensure strict mode
    - Configure paths

Task 30: Create README Documentation
  UPDATE README.md:
    - Project overview
    - Installation instructions
    - Usage guide
    - Architecture overview
    - Contributing guidelines
```

### Integration Points

```yaml
FRONTEND:
  add to: src/main.ts
  pattern: |
    import { TimerService } from './services/timer-service';
    import { ThemeManager } from './services/theme-manager';
    import { i18n } from './i18n';
    
    async function initializeApp() {
      await i18n.init();
      const themeManager = new ThemeManager();
      const timerService = new TimerService();
      // ... mount components
    }

TAURI_BACKEND:
  add to: src-tauri/src/lib.rs
  pattern: |
    use crate::commands::{start_timer, pause_timer, reset_timer};
    use crate::tray::create_tray;
    
    tauri::Builder::default()
      .setup(|app| {
        create_tray(app)?;
        Ok(())
      })
      .invoke_handler(tauri::generate_handler![
        start_timer,
        pause_timer,
        reset_timer
      ])

STYLES:
  add to: src/styles/global.css
  pattern: |
    @import "tailwindcss";
    @import "./theme-common.css";
    
    :root {
      --primary-color: theme('colors.gray.700');
      --background-color: theme('colors.white');
    }

I18N:
  add to: src/i18n/locales/en.json
  pattern: |
    {
      "timer": {
        "start": "Start",
        "pause": "Pause",
        "reset": "Reset"
      },
      "settings": {
        "theme": "Theme",
        "language": "Language"
      }
    }
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm type-check                    # TypeScript checking
pnpm check                         # Biome linting and formatting
pnpm rust:check                    # Rust compilation check
pnpm rust:lint                     # Rust clippy linting

# Expected: No errors. If errors, READ and fix.
```

### Level 2: Unit Tests

```bash
# Run unit tests
pnpm test

# Expected test files:
# - tests/timer-service.test.ts
# - tests/renderers.test.ts
# - tests/notification-service.test.ts
# - tests/statistics-service.test.ts
# - tests/mcp-server.test.ts

# If failing: Read error, fix code, re-run
```

### Level 3: Integration Test

```bash
# Start development server
pnpm tauri:dev

# Manual testing checklist:
# 1. Timer starts and counts down correctly
# 2. Pause/resume works
# 3. Auto-transition to break works
# 4. All 6 themes render correctly
# 5. Language switching works without restart
# 6. System tray shows and menu works
# 7. Notifications appear at session end
# 8. Settings persist after restart
# 9. Window resizes responsively

# Check browser console and Tauri logs for errors
```

### Level 4: Build Validation

```bash
# Production build
pnpm tauri:build

# Test built application
# Verify all features work in production build
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] No linting errors: `pnpm check`
- [ ] No Rust errors: `pnpm rust:check && pnpm rust:lint`
- [ ] Timer accurately tracks time
- [ ] All 6 themes render correctly
- [ ] Theme switching works smoothly
- [ ] All 4 languages display correctly
- [ ] System tray integration works
- [ ] Notifications trigger properly
- [ ] MCP server responds to commands
- [ ] Settings persist between sessions
- [ ] Mobile-responsive design works
- [ ] Production build runs without errors

## Anti-Patterns to Avoid

- ❌ Don't manipulate DOM styles directly (use CSS variables)
- ❌ Don't recreate Rough.js objects each frame (causes jitter)
- ❌ Don't hardcode strings (use i18n system)
- ❌ Don't create files over 500 lines (split into modules)
- ❌ Don't use npm/yarn (use pnpm only)
- ❌ Don't skip the layered architecture
- ❌ Don't use old Tauri v1 APIs (use v2 patterns)
- ❌ Don't use @tailwind directives (use @import "tailwindcss")
- ❌ Don't forget to pre-generate Canvas drawables
- ❌ Don't implement without tests

## Confidence Score: 8.5/10

**Rationale**: High confidence due to comprehensive research, clear examples in codebase, and detailed implementation plan. Slight uncertainty around MCP server complexity and potential Rough.js animation performance issues, but mitigation strategies are documented.

---

**Ready for Implementation**: This PRP provides sufficient context for one-pass implementation with validation loops to ensure success.
