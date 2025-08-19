# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

- `pnpm tauri dev` - Start desktop app development
- `pnpm dev` - Start web-only development
- `pnpm tauri build` - Build desktop application

### Testing & Quality

- `pnpm test` - Run unit tests (Vitest)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run e2e tests (Playwright)
- `pnpm check:all` - Run all quality checks (lint, format, typecheck, Rust)
- `pnpm type-check` - TypeScript type checking
- `pnpm format` - Format code with Biome
- `pnpm fix` - Auto-fix linting issues

### Mobile Development

- `pnpm mobile:init` - Initialize mobile development
- `pnpm tauri:android` - Start Android development
- `pnpm tauri:ios` - Start iOS development

## Architecture Overview

Tempus Ring is a cross-platform Pomodoro timer built with:

- **Frontend**: TypeScript (strict) + Vite + Tailwind CSS v4
- **Backend**: Rust + Tauri 2.0
- **Communication**: Tauri commands for Rust↔TypeScript

### Layer Structure

**Frontend (TypeScript)**:

- `types/` - TypeScript interfaces and enums (base layer)
- `services/` - Business logic services (timer, theme, storage, statistics, notifications)
- `factories/` - Object creation and dependency injection
- `components/` - UI components including theme renderers
- `i18n/` - Internationalization support (en, zh-CN, zh-TW, ja)

**Backend (Rust)**:

- `commands/` - Tauri commands exposed to frontend
- `services/` - Core business logic (timer state, storage)
- System tray integration and native notifications

### Theme System

6 visual themes with pluggable renderer architecture:

- **Renderers**: DOM, SVG, Canvas-based with different visual styles
- **Themes**: WabiSabi (hand-drawn), Cloudlight (minimal), Dawn-Dusk (gradients), Nightfall (dark), Artistic (sketch), Hand-drawn (SVG)
- **Configuration**: Theme switching via `ThemeManager` service

### Renderer Implementation Patterns

- **DOM Renderer**: Uses CSS transforms and transitions, suitable for clean themes like Cloudlight
- **SVG Renderer**: Vector-based with precise control, ideal for geometric themes like Hand-drawn
- **Canvas Renderer**: Pixel-based with Rough.js integration, required for WabiSabi and Artistic themes
- **Interface**: All renderers implement `TimerRenderer` with methods: `render()`, `resize()`, `destroy()`, `setAnimationState()`
- **Factory Pattern**: `TimerFactory` maps themes to appropriate renderer types

### State Management

- **Timer Service**: Manages Pomodoro state machine (idle/work/break/paused)
- **Event-driven**: Services communicate via typed events
- **Persistence**: Settings and statistics stored via Tauri storage plugin

### Key Architectural Patterns

- **Tauri Commands**: Backend functions exposed via `#[tauri::command]` (see `src-tauri/src/commands/`)
- **Service Events**: TypeScript services emit typed events for loose coupling
- **Theme Renderers**: Pluggable rendering system with DOM/SVG/Canvas implementations
- **Dependency Injection**: Services passed through factories, avoiding global state
- **Type Safety**: Strict TypeScript with shared types between frontend/backend

### MCP Integration

- **MCP Server**: Model Context Protocol server for AI assistant integration
- **Dual Transport**: Supports both stdio (local) and Streamable HTTP (remote)
- **Timer API**: Exposes timer control via MCP commands (`timer.start`, `timer.pause`, `theme.switch`)
- **Session Management**: Cryptographically secure session IDs
- **SDK**: Uses @modelcontextprotocol/sdk TypeScript package

## Core Principles

- **Incremental progress**: Make small, compilable changes that pass tests
- **Learn before implementing**: Study existing code patterns before adding new features
- **Simplicity over cleverness**: Choose direct solutions over complex abstractions
- **Single responsibility**: Each function/class handles one concern
- **Package Manager**: Use `pnpm` for all commands
- **Development**: Use `pnpm dev` (web) and `pnpm tauri dev` (desktop)
- **File size limit**: Keep files under 500 lines, refactor if larger

## Problem-Solving Protocol

When stuck after 3 attempts, STOP and:

1. **Document failures**: What was tried, specific errors, suspected causes
2. **Research alternatives**: Find 2-3 similar implementations in the codebase
3. **Question assumptions**: Is this the right abstraction level? Can it be simpler?
4. **Try different approaches**: Different libraries, patterns, or remove abstractions

## Technology Stack

- **Desktop**: Tauri 2 (Rust backend)
- **Frontend**: TypeScript (strict mode) + Vite + ESM
- **Styling**: Tailwind CSS v4 (avoid custom CSS)
- **Icons**: Lucide icons only (never emojis)
- **Quality**: Biome formatter/linter
- **Testing**: Vitest for unit tests
- **Package Manager**: pnpm exclusively

## Architecture

- **Layered structure**: `types` → `services` → `factories` → `components`
- **Dependency injection**: Use composition over inheritance
- **Event-driven**: Services communicate via events
- **State management**: Simple state machines in services (idle/running/paused)
- **Never disable tests**: Fix them instead

## Code Style

### Naming Conventions

- **Files**: `kebab-case` (timer-component.ts)
- **Classes/Interfaces**: `PascalCase` (TimerRenderer)
- **Functions/Variables**: `camelCase` (startTimer)
- **Constants**: `UPPER_SNAKE_CASE` (DEFAULT_DURATION)

### TypeScript Rules

- **Strict mode**: No `any` types (except tests)
- **Use instead**: `unknown`, generics, union types, interfaces
- **Loops**: Prefer `for...of` over `forEach`
- **Errors**: Custom Error classes for domain errors
- **Format**: Use Biome (`pnpm format`)

### Rust/Tauri Rules

- **Naming**: `snake_case` conventions
- **Commands**: `#[tauri::command]` for frontend-callable functions
- **State**: `tauri::State<T>` for shared state
- **Events**: `app.emit_all("event-name", payload)` for async updates
- **Errors**: `Result<T, E>` for all fallible operations

## Documentation & Quality

### JSDoc Requirements

Comment all public functions/classes with "why" explanations:

```typescript
/**
 * Manages theme switching and configuration.
 * @param themeName The name of the theme to switch to.
 * @returns A promise that resolves when the theme is loaded.
 */
async switchTheme(themeName: string): Promise<void> { /* ... */ }
```

### Commit Standards

Format: `<type>: <what> to <why>` (English only, max 100 chars)

Examples:

- `feat: add theme validation to prevent runtime crashes`
- `fix: resolve memory leak in timer cleanup to improve performance`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

### Quality Gates

Every commit must:

- Compile successfully
- Pass all existing tests
- Include tests for new features
- Follow formatting/linting rules
- Have clear commit message explaining WHY

### Error Handling

- Fail fast with descriptive messages
- Include debugging context
- Handle errors at appropriate layer
- Never silently ignore exceptions

## Testing Strategy

### Unit Tests (Vitest)

- **Location**: `tests/` directory for unit tests, `src/` directory for component tests
- **Framework**: Vitest with jsdom environment
- **Target**: Services, utilities, and business logic
- **Run**: `pnpm test` (single run) or `pnpm test:watch` (watch mode)

### E2E Tests (Playwright)

- **Location**: `tests/e2e/` directory
- **Framework**: Playwright with Chromium/WebKit
- **Target**: Full application workflows (timer operations, theme switching, i18n)
- **Run**: `pnpm test:e2e` (starts Tauri dev server automatically)
- **Viewport**: Configured to match Tauri window size (400x600)

### Rust Tests

- **Location**: `src-tauri/tests/` and inline `#[cfg(test)]` modules  
- **Framework**: Built-in Rust testing
- **Run**: `cd src-tauri && cargo test`

## Internationalization (i18n)

- **Files**: JSON in `src/i18n/locales/` (en.json, zh-CN.json, etc.)
- **Keys**: Dot notation (`timer.start`)
- **Usage**: `t('key', { dynamicValue })` function
- **Fallback**: English for missing translations

## Cross-Platform Support

- **Rust**: Use `#[cfg(target_os = "macos")]` for OS-specific logic
- **TypeScript**: Use Tauri `os` module when needed

## Decision Framework (Priority Order)

1. **Testability**: Can it be easily tested?
2. **Readability**: Will it be clear in 6 months?
3. **Consistency**: Does it match project patterns?
4. **Simplicity**: Is it the simplest viable solution?
5. **Reversibility**: How hard is it to change?

## Learning the Codebase

Before implementing:

- Find 3 similar implementations in the project
- Follow existing patterns and conventions
- Use same libraries and utilities
- Match existing test patterns

## Known Issues and Library Quirks

### Rough.js Animation (Canvas Renderer)

- **Problem**: Rough.js randomizes patterns each draw, causing jitter in animations
- **Solution**: Pre-generate drawable objects and reuse them

```typescript
const clockFace = roughCanvas.generator.circle(x, y, diameter, options);
roughCanvas.draw(clockFace); // Reuse same object for stable animation
```

### Tailwind CSS v4 Changes

- Use `@import "tailwindcss"` instead of `@tailwind` directives
- CSS-first configuration, no `tailwind.config.js` needed

### Tauri 2.0 System Tray

- Use `TrayIconBuilder`, not the old `SystemTray` API
- `tray-icon` feature must be enabled in `Cargo.toml`

### File Size Constraint

- Keep all files under 500 lines - split into modules if larger
- Particularly important for renderers and service files

### CSS Theme Switching

- Never manipulate styles directly except in Canvas renderer
- Use CSS variables for all theme switching
- Let CSS handle transitions and animations

### Layered Architecture Dependency Flow

- Strict flow: `types` → `services` → `factories` → `components`
- Never bypass this hierarchy or create circular dependencies

## Critical Rules

**NEVER**:

- Bypass hooks or disable tests
- Commit broken code
- Add new tools without justification
- Assume without verification
- Manipulate DOM styles directly (use CSS variables)
- Recreate Rough.js objects each frame (causes jitter)
- Hardcode strings (use i18n system)
- Skip the layered architecture

**ALWAYS**:

- Study existing code first
- Commit incrementally
- Stop after 3 failed attempts
- Include tests with new features
- Pre-generate Canvas drawables for stable animations
- Use CSS variables for theme changes

## Validation Workflow

### Level 1: Syntax & Style (Run First)

```bash
pnpm type-check      # TypeScript checking
pnpm check          # Biome linting and formatting
pnpm rust:check     # Rust compilation check  
pnpm rust:lint      # Rust clippy linting
```

### Level 2: Unit Tests

```bash
pnpm test           # Run all unit tests
pnpm test:watch     # Watch mode for development
```

### Level 3: Integration Testing

```bash
pnpm tauri:dev      # Start development server
```

Manual verification checklist:

- Timer starts and counts down correctly
- Pause/resume works properly
- Auto-transition to breaks functions
- All 6 themes render correctly
- Language switching without restart
- System tray integration works
- Notifications appear at session end
- Settings persist after restart

### Level 4: Production Build

```bash
pnpm tauri:build    # Production build
```

Verify all features work in production build

## Anti-Patterns to Avoid

- ❌ Don't use old Tauri v1 APIs (use v2 patterns)
- ❌ Don't use `@tailwind` directives (use `@import "tailwindcss"`)
- ❌ Don't use npm/yarn (use pnpm only)
- ❌ Don't implement without tests
- ❌ Don't forget to handle mobile responsiveness
- ❌ Don't skip i18n key validation
