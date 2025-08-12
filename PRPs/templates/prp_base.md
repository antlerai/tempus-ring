---
name: "Tempus Ring PRP Template"
description: "Template for generating comprehensive PRPs for Tempus Ring cross-platform Pomodoro timer development"
---

# PRP Template

## Purpose

Template optimized for AI agents to implement Tempus Ring features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal

[What needs to be built - be specific about the end state and desires]

## Why

- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What

[User-visible behavior and technical requirements]

### Success Criteria

- [ ] [Specific measurable outcomes]

## All Needed Context

### Documentation & References (list all context needed to implement the feature)

```yaml
# MUST READ - Include these in your context window
- url: [Official API docs URL]
  why: [Specific sections/methods you'll need]
  
- file: [path/to/example.ts]
  why: [Pattern to follow, gotchas to avoid]
  
- doc: [Library documentation URL] 
  section: [Specific section about common pitfalls]
  critical: [Key insight that prevents common errors]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs that the user has pasted in to the project]

# Project-specific references
- file: examples/src/usage-example.ts
  why: Complete implementation patterns for timer, themes, i18n
  
- file: examples/src/README.md
  why: Architecture overview and design patterns
  
- file: CLAUDE.md
  why: Project-specific development guidelines
  
- file: CLAUDE_Global.md
  why: General development best practices
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash

```

### Desired Codebase tree with files to be added and responsibility of file

```bash

```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Tempus Ring specific patterns and constraints
// Example: Use unified TimerRenderer interface for DOM/SVG/Canvas
// Example: CSS variables for theme switching, avoid direct style manipulation
// Example: Tauri commands must be async and use #[tauri::command]
// Example: i18n keys use dot notation (timer.start, settings.theme)
// Example: Files must be under 500 lines - refactor if larger
// Example: Use pnpm for all package management
// Example: Biome for formatting/linting, not ESLint/Prettier
```

## Implementation Blueprint

### Data models and structure

Create the core data models and interfaces, ensuring type safety and consistency.

```typescript
// Examples: 
// - TimerRenderer interface
// - Theme configuration types
// - i18n locale interfaces
// - Tauri command types
// - Timer state enums
```

### list of tasks to be completed to fullfill the PRP in the order they should be completed

```yaml
Task 1:
MODIFY src/existing_module.ts:
  - FIND pattern: "export class ExistingClass"
  - INJECT after line containing "constructor"
  - PRESERVE existing method signatures

CREATE src/new_feature.ts:
  - MIRROR pattern from: examples/src/similar_feature.ts
  - MODIFY class name and core logic
  - KEEP error handling pattern identical
  - FOLLOW layered architecture: types → services → factories → components

...(...)

Task N:
...
```

### Per task pseudocode as needed added to each task

```typescript
// Task 1
// Pseudocode with CRITICAL details dont write entire code
export class NewFeature implements FeatureInterface {
    // PATTERN: Always use dependency injection (see examples/)
    constructor(private themeManager: ThemeManager) {}
    
    // GOTCHA: Tauri commands must be async
    async startTimer(duration: number): Promise<TimerResult> {
        // PATTERN: Validate input first
        if (duration <= 0) throw new Error('Invalid duration');
        
        // CRITICAL: Use existing state management pattern
        this.state = TimerState.RUNNING;
        
        // PATTERN: Emit events for UI updates
        this.emit('timer:started', { duration });
        
        return { success: true, id: generateId() };
    }
}
```

### Integration Points

```yaml
FRONTEND:
  - add to: src/main.ts
  - pattern: "import { NewFeature } from './features/new-feature'"
  
TAURI_BACKEND:
  - add to: src-tauri/src/lib.rs
  - pattern: "#[tauri::command] async fn new_command() -> Result<String, String>"
  
STYLES:
  - add to: src/styles/components.css
  - pattern: "Use CSS variables for theming: var(--primary-color)"
  
I18N:
  - add to: src/i18n/locales/en.json
  - pattern: "{ 'feature': { 'action': 'Action Text' } }"
  
TYPES:
  - add to: src/types/index.ts
  - pattern: "export interface NewFeatureConfig { ... }"
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

### Level 2: Unit Tests each new feature/file/function use existing test patterns

```typescript
// CREATE test/new-feature.test.ts with these test cases:
import { describe, it, expect } from 'vitest';
import { NewFeature } from '../src/features/new-feature';

describe('NewFeature', () => {
    it('should handle happy path', () => {
        const feature = new Feature();
        const result = feature.process('valid_input');
        expect(result.success).toBe(true);
    });

    it('should validate input', () => {
        const feature = new Feature();
        expect(() => feature.process('')).toThrow('Invalid input');
    });

    it('should handle theme changes', () => {
        const feature = new Feature();
        feature.setTheme('dark');
        expect(feature.currentTheme).toBe('dark');
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

# Test the feature manually:
# 1. Open the app
# 2. Navigate to the new feature
# 3. Test basic functionality
# 4. Test theme switching
# 5. Test language switching
# 6. Verify responsive design

# Expected: Feature works as designed
# If error: Check browser console and Tauri logs
```

## Final validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] No linting errors: `pnpm check`
- [ ] No Rust errors: `pnpm rust:check && pnpm rust:lint`
- [ ] Manual test successful in development mode
- [ ] Feature works across different themes
- [ ] Feature works in multiple languages
- [ ] Responsive design verified
- [ ] Error cases handled gracefully
- [ ] Documentation updated if needed

---

## Anti-Patterns to Avoid

- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"  
- ❌ Don't ignore failing tests - fix them
- ❌ Don't manipulate DOM styles directly (use CSS variables)
- ❌ Don't hardcode strings (use i18n system)
- ❌ Don't create files over 500 lines
- ❌ Don't use npm/yarn (use pnpm)
- ❌ Don't bypass the layered architecture
- ❌ Don't forget to handle theme and language switching
- ❌ Don't ignore mobile-first responsive design
