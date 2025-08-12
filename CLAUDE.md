# AI Development Guidelines

## 1. Core Principles

- **Project Context:** Always read `PLANNING.md` and `TASK.md` before starting.
- **Package Manager:** Use `pnpm` for all commands.
- **Development:** Use `pnpm dev` (web) and `pnpm tauri dev` (desktop).

- **Modularity:** Keep files under 500 lines. Refactor if larger.
- **Clarity:** Ask for clarification if requirements are unclear.

## 2. Code Architecture & Style

- **Layered Structure:** `types` → `services` → `factories` → `components`.
- **Dependency Flow:** High-level modules depend on abstractions in `types`.

### Project Structure

```txt
src/
├── types/         # Interfaces, type declarations, abstract classes
├── services/      # Business logic, state management (e.g., ThemeManager)
├── factories/     # Object creation & instantiation (e.g., TimerFactory)
├── components/    # UI components and renderers
├── utils/         # Pure, reusable helper functions
├── i18n/          # Internationalization (locales, config)
└── styles/        # Global styles, themes, component-specific styles
```

### Naming Conventions

- **Files:** `kebab-case` (e.g., `timer-component.ts`)
- **Classes/Interfaces:** `PascalCase` (e.g., `TimerRenderer`)
- **Functions/Variables:** `camelCase` (e.g., `startTimer`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `DEFAULT_DURATION`)

### Frontend (TypeScript)

- **Language:** Use TypeScript with strict checking and modern ES features (ESM).
- **Domain Errors:** Use custom Error classes for domain-specific errors.
- **Formatting:** Use Biome (`pnpm format`).
- **Styling:** Use Tailwind CSS primarily; avoid custom CSS where possible.
- **State Management:** Use a simple state machine pattern in `services` for core logic (e.g., timer states: `idle`, `running`, `paused`).

### Backend (Rust/Tauri)

- **Conventions:** Follow standard Rust conventions (`snake_case`).
- **Commands:** Use `#[tauri::command]` for functions callable from the frontend.
- **State Management:** Use `tauri::State<T>` to manage and share state across commands.
- **Events:** Use `app.emit_all("event-name", payload)` to send events from backend to frontend for asynchronous updates (e.g., timer ticks).
- **Error Handling:** Use `Result<T, E>` for all fallible operations.

### Documentation

- **JSDoc:** Comment all public functions/classes. For complex logic, add comments explaining the "why".

  ```typescript
  /**
   * Manages theme switching and configuration.
   * @param themeName The name of the theme to switch to.
   * @returns A promise that resolves when the theme is loaded.
   */
  async switchTheme(themeName: string): Promise<void> { /* ... */ }
  ```

## 3. Advanced Concepts

### Cross-Platform Compatibility

- **Backend:** Use conditional compilation (`#[cfg(target_os = "macos")]`) in Rust for OS-specific logic.
- **Frontend:** Use the Tauri `os` module for platform-specific TypeScript code when necessary.

## 4. Testing & Internationalization

### Testing

- **Framework:** Use Vitest for all unit tests.

### Internationalization (i18n)

- **Structure:** Keys are nested in JSON files (e.g., `src/i18n/locales/en.json`).
- **Keys:** Use dot notation for clarity (e.g., `timer.start`).
- **Integration:** Use the `t('key', { dynamicValue })` function in components.
- **Fallback:** English is the default language for missing translations.
