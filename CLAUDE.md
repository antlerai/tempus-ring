# CLAUDE.md

Development guidance for Tempus Ring - a cross-platform Pomodoro timer built with TypeScript + Tauri 2.0.

## Quick Commands

**Development**: `pnpm tauri dev` (desktop) | `pnpm dev` (web) | `pnpm tauri build` (production)
**Testing**: `pnpm test` | `pnpm test:e2e` | `pnpm check:all` (all quality checks)
**Mobile**: `pnpm tauri:android` | `pnpm tauri:ios`

## Architecture

**Stack**: TypeScript (strict) + Vite + Tailwind CSS v4 + Rust + Tauri 2.0

**Layer Flow**: `types` → `services` → `factories` → `components`

**Frontend Structure**:

- `types/` - Interfaces and enums (base layer)  
- `services/` - Business logic (timer, theme, storage, statistics, notifications)
- `factories/` - Dependency injection
- `components/` - UI components and theme renderers
- `i18n/` - Internationalization (en, zh-CN, zh-TW, ja)

**Backend Structure**:

- `commands/` - Tauri commands exposed to frontend
- `services/` - Core business logic (timer state, storage)
- System tray and native notifications

**Theme System**: 6 themes (WabiSabi, Cloudlight, Dawn-Dusk, Nightfall, Artistic, Hand-drawn) with pluggable renderers (DOM, SVG, Canvas)

**State Management**: Event-driven services with Pomodoro state machine (idle/work/break/paused)

**Key Patterns**: Tauri commands, dependency injection, type safety, theme renderers

## Development Rules

- **Incremental**: Small, compilable changes that pass tests
- **Learn first**: Study existing patterns before implementing
- **Simplicity**: Direct solutions over complex abstractions  
- **File limit**: 500 lines max, refactor if larger
- **Package manager**: pnpm only
- **Testing**: Never disable tests, fix them
- **Problem solving**: Stop after 3 attempts, document failures, find alternatives

## Code Style

**Naming**: Files `kebab-case` | Classes `PascalCase` | Functions `camelCase` | Constants `UPPER_SNAKE_CASE`

**TypeScript**: Strict mode, no `any` types, prefer `for...of`, custom Error classes, format with Biome

**Rust**: `snake_case`, `#[tauri::command]` for frontend calls, `Result<T, E>` for errors

## Quality Standards

**JSDoc**: Comment public functions with "why" explanations
**Commits**: `<type>: <what> to <why>` (max 100 chars) - must compile, pass tests, include new tests
**Error Handling**: Fail fast with context, handle at appropriate layer, never ignore silently

## Testing

**Unit**: Vitest (`tests/` and `src/`) - services, utilities, logic - `pnpm test`
**E2E**: Playwright (`tests/e2e/`) - full workflows - `pnpm test:e2e`  
**Rust**: Built-in testing (`src-tauri/tests/`) - `cd src-tauri && cargo test`

## Other

**i18n**: JSON in `src/i18n/locales/`, dot notation keys, `t()` function, English fallback
**Cross-platform**: `#[cfg(target_os)]` in Rust, Tauri `os` module in TypeScript
**Decision priority**: Testability → Readability → Consistency → Simplicity → Reversibility

## Styling Architecture Rules

**CSS-First Development**: All static styles must be defined in CSS files, not TypeScript
**Dynamic Effects**: Use CSS custom properties (variables) for dynamic values, never direct style manipulation
**State Control**: Use data attributes (`data-state`, `data-progress`) to trigger CSS rules
**File Structure**: Follow layered architecture: `base/` → `layout/` → `components/` → `themes/`

### ✅ Correct Styling Patterns

```typescript
// ✅ CSS variables + data attributes
this.container.style.setProperty('--progress', progress.toString());
this.container.style.setProperty('--intensity', intensity.toString());
this.element.dataset.animationState = isRunning ? 'running' : 'paused';
this.element.classList.toggle('timer-intensity-effects', hasEffects);
```

```css
/* ✅ CSS-driven dynamic effects */
.timer-hand.dynamic {
  transform: translateX(-50%) rotate(var(--rotation, 0deg));
}
[data-animation-state="running"] .timer-hand {
  animation: rotate-clockwise var(--animation-duration) linear infinite;
}
```

### ❌ Forbidden Styling Patterns

```typescript
// ❌ Direct style manipulation - NEVER DO THIS
this.hand.style.background = handColor;
this.hand.style.transform = `rotate(${rotation}deg)`;
this.element.style.opacity = '0.5';
```

**Theme Configuration**: Each theme must have corresponding CSS files in `src/styles/themes/`
**Performance**: Use `will-change`, `contain`, and `transform: translateZ(0)` for animation elements
**Responsive**: Define breakpoints in CSS, not JavaScript

## Library Quirks & Critical Rules

**Rough.js**: Pre-generate drawable objects to avoid animation jitter
**Tailwind v4**: Use `@import "tailwindcss"` (not `@tailwind`)
**Tauri 2.0**: Use `TrayIconBuilder` API, enable `tray-icon` feature

**NEVER**: Bypass tests, commit broken code, manipulate DOM styles directly, recreate Rough.js objects each frame, skip layered architecture, use `element.style.property = value`
**ALWAYS**: Study existing code first, commit incrementally, use CSS variables for themes, pre-generate Canvas drawables, follow CSS-first development

## Validation Checklist

**Before commit**: `pnpm check:all` (includes type-check, format, lint, Rust checks)
**Manual testing**: Timer functions, theme switching, i18n, system tray, notifications, settings persistence
**Production**: `pnpm tauri:build` and verify all features work
