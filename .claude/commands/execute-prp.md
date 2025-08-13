# Execute BASE PRP

Implement a feature using the PRP file with state management and Git integration.

## PRP File: $ARGUMENTS

## Execution Process

1. **Load PRP & Check State**
   - Read the specified PRP file (e.g., `PRPs/tempus-ring-implementation.md`)
   - Check for existing state file: `{prp-name}.state` (e.g., `PRPs/tempus-ring-implementation.state`)
   - If state file exists: Resume from last checkpoint
   - If no state file: Start fresh execution
   - Understand all context and requirements from PRP
   - Do additional web searches and codebase exploration as needed

2. **ULTRATHINK & Plan**
   - Think hard before executing the plan
   - Create comprehensive plan addressing all requirements
   - Break down complex tasks into smaller, manageable steps
   - Use TodoWrite tool to create and track implementation plan
   - Identify implementation patterns from existing code to follow
   - **Create initial state file** if starting fresh:

     ```json
     {
       "prpFile": "{prp-name}.md",
       "startedAt": "{current-timestamp}",
       "currentTask": 1,
       "completedTasks": [],
       "failedTasks": [],
       "lastCommit": null,
       "taskStatus": {}
     }
     ```

3. **Execute with Git Integration**
   - For each task in the PRP task list:

     **a. Implement Task**
     - Execute the current task implementation
     - Follow all patterns and requirements from PRP

     **b. Validate Task**
     - Run relevant validation commands for this task
     - Fix any failures before proceeding

     **c. Auto-Commit (Following Commitlint Rules)**
     - Stage changes: `git add .`
     - Commit with conventional format: `git commit -m "{type}: task {N} - {brief-description}"`
       - Use `feat:` for new features/components
       - Use `test:` for test implementations  
       - Use `docs:` for documentation updates
       - Use `style:` for CSS/styling changes
       - Use `refactor:` for code restructuring
       - Keep subject under 100 chars, lowercase, no period
     - Create checkpoint tag: `git tag "prp-task-{N}"`

     **d. Update State File**
     - Mark task as completed
     - Update current task number
     - Record commit hash and timestamp
     - Save state file: `{prp-name}.state`

4. **Error Handling & Recovery**
   - If task fails:
     - Create WIP commit: `git commit -m "wip: task {N} partial - {error-summary}"`
     - Mark task as failed in state file
     - Record error details for debugging
     - **STOP execution** and report failure point
     - User can fix issues and resume with `/prp-resume`

5. **Final Validation & Completion**
   - Run complete validation suite from PRP
   - Fix any integration issues
   - Create final commit: `git commit -m "feat: complete prp implementation - {prp-name}"`
   - Create completion tag: `git tag "prp-complete-{timestamp}"`
   - Mark PRP as completed in state file
   - Report completion status with summary

6. **State File Management**
   - **State file location**: Same directory as PRP file
   - **State file format**:

     ```json
     {
       "prpFile": "tempus-ring-implementation.md",
       "startedAt": "2025-01-13T10:00:00Z",
       "lastUpdated": "2025-01-13T11:30:00Z", 
       "currentTask": 5,
       "completedTasks": [1, 2, 3, 4],
       "failedTasks": [],
       "lastCommit": "abc123def",
       "taskStatus": {
         "1": {"status": "completed", "completedAt": "2025-01-13T10:15:00Z", "commit": "abc123"},
         "2": {"status": "completed", "completedAt": "2025-01-13T10:30:00Z", "commit": "def456"},
         "5": {"status": "in_progress", "startedAt": "2025-01-13T11:20:00Z"}
       }
     }
     ```

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
