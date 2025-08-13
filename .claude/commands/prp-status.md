# Check PRP Status

Display the current execution status of a PRP file.

## PRP File: $ARGUMENTS

## Status Check Process

1. **Load PRP and State**
   - Read the specified PRP file
   - Load corresponding state file: `{prp-name}.state`
   - If no state file: Report "Not started"

2. **Display Status Information**
   - **Overall Progress**: X/Y tasks completed (Z% complete)
   - **Current Task**: Task number and description
   - **Completed Tasks**: List with timestamps and commit hashes
   - **Failed Tasks**: List with error descriptions
   - **Last Activity**: When was last task completed
   - **Git Status**: Current branch and last PRP-related commit

3. **Status Report Format**

```
PRP Status: tempus-ring-implementation.md
==========================================

Overall Progress: 4/20 tasks completed (20%)
Current Task: Task 5 - Create Main Application
Started: 2025-01-13 10:00:00
Last Updated: 2025-01-13 11:30:00

✅ Completed Tasks:
  [1] Implement Timer State Machine (10:15) - commit: abc123
  [2] Port Examples to Main Source (10:30) - commit: def456  
  [3] Implement Settings Service (10:45) - commit: ghi789
  [4] Implement DOM Renderer (11:15) - commit: jkl012

🔄 In Progress:
  [5] Create Main Application (started: 11:20)

❌ Failed Tasks: None

📊 Statistics:
  - Average time per task: 15 minutes
  - Estimated completion: 2025-01-13 15:00:00
  - Git commits: 4 task commits + 0 WIP commits

🔧 Git Status:
  - Branch: feature/tempus-ring-implementation  
  - Last commit: jkl012 "feat: task 4 - implement dom renderer"
  - Tags: prp-task-1, prp-task-2, prp-task-3, prp-task-4
```

4. **Validation Checks**
   - Verify state file consistency with Git history
   - Check if current codebase matches expected state
   - Report any inconsistencies or issues

5. **Action Recommendations**
   - If execution can be resumed: Suggest `/prp-resume`
   - If issues detected: Suggest recovery actions
   - If completed: Show final validation status

## Error Handling

- **No state file**: "PRP not started. Use `/execute-prp` to begin."
- **Corrupted state**: "State file corrupted. Recovery options: [list]"
- **Git mismatch**: "Git history inconsistent with state. Manual review needed."

## Quick Status Check

For a brief status without full details:

```bash
/prp-status PRPs/tempus-ring-implementation.md --brief
# Output: "4/20 tasks completed (20%) - Task 5 in progress"
```

Note: This command is read-only and does not modify any files or state.
