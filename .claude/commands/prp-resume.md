# Resume PRP Execution

Resume execution of a PRP from the last checkpoint with state management.

## PRP File: $ARGUMENTS

## Resume Process

1. **Load State & Validate**
   - Read the specified PRP file
   - **CRITICAL**: Load existing state file: `{prp-name}.state`
   - If no state file exists: Error - use `/execute-prp` for fresh start
   - Validate current codebase matches expected state
   - Check if last commit matches state file record

2. **Analyze Current State**
   - Review completed tasks from state file
   - Identify current task to resume from
   - Check for any failed tasks that need attention
   - Verify Git history matches state records
   - Report current progress to user

3. **Resume Execution**
   - Continue from `currentTask` in state file
   - Skip already completed tasks (marked in `completedTasks` array)
   - If last task was marked as failed:
     - Review the failure reason
     - Attempt to fix the issue
     - Mark as resolved before continuing
   - Follow same Git integration pattern as `/execute-prp`

4. **State Synchronization**
   - Update state file after each task completion
   - Maintain same commit and tagging strategy
   - Ensure state file stays synchronized with Git history
   - Handle any state inconsistencies gracefully

5. **Error Recovery**
   - If state file is corrupted: Offer to rebuild from Git history
   - If Git history doesn't match state: Offer manual reconciliation
   - If codebase is inconsistent: Suggest rollback to last known good state

## State File Validation

Before resuming, verify:

- State file exists and is valid JSON
- `currentTask` is within valid range
- `lastCommit` exists in Git history
- Completed tasks match actual implementation

## Resume Examples

```bash
# Normal resume
/prp-resume PRPs/tempus-ring-implementation.md
# Output: "Resuming from Task 5: Create Main Application"

# Resume after failure
/prp-resume PRPs/tempus-ring-implementation.md  
# Output: "Task 7 previously failed with: canvas renderer high-dpi issue"
# "Attempting to resolve and continue..."

# Resume with state mismatch
/prp-resume PRPs/tempus-ring-implementation.md
# Output: "State inconsistency detected. Last commit abc123 not found."
# "Options: 1) Rollback to task 4, 2) Rebuild state from Git history"
```

## Recovery Commands

If resume fails, offer these options:

- **Rollback**: `git reset --hard prp-task-{N}` to last good state
- **Rebuild State**: Reconstruct state file from Git tag history
- **Manual Fix**: Allow user to manually edit state file
- **Fresh Start**: Delete state file and use `/execute-prp`

## State File Recovery

If state file is missing or corrupted, attempt to rebuild from Git tags:

```bash
# Find PRP-related tags
git tag --list "prp-task-*" --sort=-version:refname

# Reconstruct completed tasks from tags
# Update state file with recovered information
```

Note: Always validate state consistency before resuming execution.
