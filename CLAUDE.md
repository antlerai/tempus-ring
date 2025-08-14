# Development Guidelines

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

## Testing Rules

- **Framework**: Vitest for all unit tests
- **Focus**: Test behavior, not implementation
- **Structure**: One assertion per test, clear descriptive names
- **Reliability**: Use existing utilities, ensure deterministic results

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

## Critical Rules

**NEVER**:

- Bypass hooks or disable tests
- Commit broken code
- Add new tools without justification
- Assume without verification

**ALWAYS**:

- Study existing code first
- Commit incrementally
- Stop after 3 failed attempts
- Include tests with new features
