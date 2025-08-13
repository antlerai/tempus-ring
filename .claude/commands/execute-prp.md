# Execute PRP with Enhanced State Management

Implement a feature using the PRP file with comprehensive state management and Git integration.

## PRP File: $ARGUMENTS

## State File Naming Convention

**State file location**: Same directory as PRP file
**Naming pattern**: `{prp-directory}/{prp-basename}.state`

**Examples**:

- PRP: `PRPs/tempus-ring-implementation.md` → State: `PRPs/tempus-ring-implementation.state`
- PRP: `PRPs/user-auth-system.md` → State: `PRPs/user-auth-system.state`
- PRP: `features/payment-gateway.md` → State: `features/payment-gateway.state`

## Execution Process

1. **Load PRP & Validate State**
   - Read and parse the specified PRP file
   - Extract and validate task list (must be numbered sequentially)
   - Check for existing state file using naming convention above
   - If state file exists: Validate format and resume from checkpoint
   - If no state file: Prepare for fresh execution
   - Understand all context and requirements from PRP
   - Do additional web searches and codebase exploration as needed

2. **Initialize Git & State Management**
   - This step runs only on fresh executions (when no `.state` file is found).
   - **Create and checkout feature branch**:
     - Derive branch name from the PRP filename (e.g., `PRPs/tempus-ring-implementation.md` -> `feature/tempus-ring-implementation`).
     - Execute `git checkout -b {branch-name}`.
   - **Create initial state file** with complete schema, including the new branch name:

     ```json
     {
       "prpFile": "tempus-ring-implementation.md",
       "version": "2.1.0",
       "startedAt": "2025-01-13T10:00:00.000Z",
       "lastUpdated": "2025-01-13T10:00:00.000Z",
       "status": "in_progress",
       "currentTask": 1,
       "totalTasks": 30,
       "completedTasks": [],
       "failedTasks": [],
       "skippedTasks": [],
       "lastCommit": null,
       "branch": "feature/tempus-ring-implementation",
       "taskStatus": {}
     }
     ```

3. **Execute Task Loop with State Tracking**
   For each task (starting from currentTask in state file):

     **a. Pre-task State Update**
     - Update state file: `taskStatus[N] = {status: 'in_progress', startedAt: timestamp}`
     - Save state file with updated `lastUpdated` timestamp
     - Log task start in console

     **b. Task Implementation**
     - Execute the current task implementation
     - Follow all patterns and requirements from PRP
     - Apply best practices and coding standards

     **c. Task Validation**
     - Run relevant validation commands for this specific task
     - If validation fails: proceed to error handling (step 4)
     - Fix any issues before proceeding to next step

     **d. Git Integration (Following Commitlint Rules)**
     - Stage changes: `git add .`
     - Commit with conventional format: `git commit -m "{type}: task {N} - {brief-description}"`
       - Use `feat:` for new features/components
       - Use `test:` for test implementations  
       - Use `docs:` for documentation updates
       - Use `style:` for CSS/styling changes
       - Use `refactor:` for code restructuring
       - Use `build:` for build system changes
       - Keep subject under 100 chars, lowercase, no period
     - Create checkpoint tag: `git tag "prp-task-{N}"`

     **e. Post-task State Update**
     - Add task number to `completedTasks` array
     - Update `taskStatus[N]` with completion details:

       ```json
       {
         "status": "completed",
         "startedAt": "2025-01-13T10:15:00.000Z",
         "completedAt": "2025-01-13T10:18:00.000Z",
         "commit": "abc123def",
         "duration": 180
       }
       ```

     - Increment `currentTask` number
     - Update `lastCommit` and `lastUpdated`
     - Save state file

4. **Error Handling & Recovery**
   - If task fails during implementation or validation:
     - Create WIP commit: `git commit -m "wip: task {N} partial - {error-summary}"`
     - Update state file:
       - Add task number to `failedTasks` array
       - Update `taskStatus[N]` with failure details:

         ```json
         {
           "status": "failed",
           "startedAt": "2025-01-13T10:15:00.000Z",
           "failedAt": "2025-01-13T10:20:00.000Z",
           "error": "TypeScript compilation error in timer-service.ts",
           "commit": "def456ghi"
         }
         ```

       - Update `lastUpdated` timestamp
     - **STOP execution** and report failure point with detailed error
     - Provide recovery instructions: "Fix the issue and run `/prp-resume {PRP-FILE}`"

5. **Final Validation & Completion**
   - When all tasks are completed, run complete validation suite from PRP
   - Fix any integration issues that arise
   - Create final commit: `git commit -m "feat: complete prp implementation - {prp-basename}"`
   - Create completion tag: `git tag "prp-complete-{timestamp}"`
   - Update state file:
     - Set `status` to "completed"
     - Set `completedAt` timestamp
     - Update `lastUpdated`
   - Generate and report completion summary with statistics

## State File Schema Reference

The state file uses the following complete schema for tracking execution:

```json
{
  "prpFile": "tempus-ring-implementation.md",
  "version": "2.1.0",
  "startedAt": "2025-01-13T10:00:00.000Z",
  "lastUpdated": "2025-01-13T11:30:00.000Z",
  "completedAt": "2025-01-13T14:45:00.000Z",
  "status": "completed",
  "currentTask": 28,
  "totalTasks": 30,
  "completedTasks": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  "failedTasks": [],
  "skippedTasks": [],
  "lastCommit": "xyz789abc",
  "branch": "feature/tempus-ring-implementation",
  "taskStatus": {
    "1": {
      "status": "completed",
      "startedAt": "2025-01-13T10:15:00.000Z",
      "completedAt": "2025-01-13T10:18:00.000Z",
      "commit": "abc123def",
      "duration": 180
    },
    "2": {
      "status": "completed", 
      "startedAt": "2025-01-13T10:20:00.000Z",
      "completedAt": "2025-01-13T10:25:00.000Z",
      "commit": "def456ghi",
      "duration": 300
    }
  }
}
```

### State Field Definitions

- **prpFile**: Complete filename of the PRP file including extension (e.g., "tempus-ring-implementation.md"). This is the filename only, not the full path.
- **version**: State file format version (currently "2.1.0")
- **status**: Overall execution status (`in_progress` | `completed` | `failed` | `paused`)
- **currentTask**: Next task to execute (1-based indexing)
- **totalTasks**: Total number of tasks extracted from PRP
- **completedTasks**: Array of completed task numbers
- **failedTasks**: Array of failed task numbers  
- **skippedTasks**: Array of manually skipped task numbers
- **lastCommit**: Most recent commit hash from task execution
- **branch**: Git branch name for this PRP execution
- **taskStatus**: Detailed status for each task with timing and commit info

## Git Commit Message Examples (Commitlint Compliant)

```bash
# Feature implementations
git commit -m "feat: task 1 - implement timer state machine"
git commit -m "feat: task 4 - add dom renderer with theme support"
git commit -m "feat: task 8 - create theme switching ui"

# Test implementations  
git commit -m "test: task 2 - add timer service unit tests"
git commit -m "test: task 6 - implement svg renderer tests"

# Styling/CSS changes
git commit -m "style: task 9 - add theme css files and variables"
git commit -m "style: task 18 - implement mobile responsive design"

# Documentation
git commit -m "docs: task 20 - update readme with project structure"

# Refactoring
git commit -m "refactor: task 15 - extract audio service from timer"

# Build/Configuration
git commit -m "build: task 11 - configure tauri system tray"

# Work in progress (failures)
git commit -m "wip: task 7 partial - canvas renderer high-dpi issue"
```

## Recovery Instructions

If execution is interrupted:

1. Check state file: `cat PRPs/{prp-name}.state`
2. Review last commit: `git log --oneline -5`
3. Resume execution: `/prp-resume PRPs/{prp-name}.md`

Note: Always follow commitlint rules - lowercase subjects, no periods, under 100 chars, proper type prefixes.
