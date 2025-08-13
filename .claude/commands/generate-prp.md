# Create PRP

## Feature file: $ARGUMENTS

Generate a complete PRP for general feature implementation with thorough research. Ensure context is passed to the AI agent to enable self-validation and iterative refinement. Read the feature file first to understand what needs to be created, how the examples provided help, and any other considerations.

The AI agent only gets the context you are appending to the PRP and training data. Assuma the AI agent has access to the codebase and the same knowledge cutoff as you, so its important that your research findings are included or referenced in the PRP. The Agent has Websearch capabilities, so pass urls to documentation and examples.



## Research Process

1. **Codebase Analysis**
   * Search for similar features/patterns in the codebase
   * Identify files to reference in PRP
   * Note existing conventions to follow
   * Check test patterns for validation approach

2. **External Research**
   * Search for similar features/patterns online
   * Library documentation (include specific URLs)
   * Implementation examples (GitHub/StackOverflow/blogs)
   * Best practices and common pitfalls

3. **User Clarification** (if needed)
   * Specific patterns to mirror and where to find them?
   * Integration requirements and where to find them?

## PRP Generation

Using PRPs/templates/prp_base.md as template:

### Critical Context to Include and pass to the AI agent as part of the PRP

* **Documentation**: URLs with specific sections
* **Code Examples**: Real snippets from codebase
* **Gotchas**: Library quirks, version issues
* **Patterns**: Existing approaches to follow

### Implementation Blueprint

* Start with pseudocode showing approach
* Reference real files for patterns
* Include error handling strategy
* **CRITICAL: Create numbered task list for state tracking compatibility**
* List tasks to be completed to fulfill the PRP in the order they should be completed
* **CRITICAL: For every feature, service, or component added, a corresponding task to write unit/integration tests MUST be included in the task list. (e.g., after creating `timer-service.ts`, add a task for `timer-service.test.ts`).**

### Task List Format (Required for State Management)

Tasks MUST be formatted as numbered list for `/execute-prp` state tracking:

```yaml
Task 1: [Brief Description]
  [Detailed implementation steps]
  
Task 2: [Brief Description]  
  [Detailed implementation steps]
  
Task N: [Brief Description]
  [Detailed implementation steps]
```

**Example Task Format:**

```yaml
Task 1: Implement Timer State Machine
  CREATE src/types/timer-types.ts:
    - CREATE TimerState enum (IDLE, WORK, SHORT_BREAK, LONG_BREAK, PAUSED)
    - CREATE TimerConfig interface (workDuration, breakDuration, etc.)
  
  CREATE src/services/timer-service.ts:
    - IMPLEMENT state machine with proper transitions
    - ADD event emitter for state changes
    - HANDLE timer tick logic with requestAnimationFrame

Task 2: Write Timer Service Tests
  CREATE src/services/__tests__/timer-service.test.ts:
    - TEST state transitions
    - TEST event emissions
    - TEST timer accuracy
```

### Validation Gates (Must be Executable) for Tauri2 + TypeScript

```bash
# Code Quality & Formatting
pnpm check:all

# Unit Tests (Frontend)
pnpm test

# Build Validation
pnpm build
```

***CRITICAL AFTER YOU ARE DONE RESEARCHING AND EXPLORING THE CODEBASE BEFORE YOU START WRITING THE PRP***

***ULTRATHINK ABOUT THE PRP AND PLAN YOUR APPROACH THEN START WRITING THE PRP***

## Output

Save as: `PRPs/{feature-name}.md`

## Quality Checklist

* [ ] All necessary context included
* [ ] Validation gates are executable by AI
* [ ] References existing patterns
* [ ] Clear implementation path
* [ ] Error handling documented

Score the PRP on a scale of 1-10 (confidence level to succeed in one-pass implementation using claude codes)

Remember: The goal is one-pass implementation success through comprehensive context.
