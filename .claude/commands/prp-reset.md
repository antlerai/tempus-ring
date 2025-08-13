# Reset PRP State

Reset the execution state of a PRP, allowing fresh start while preserving Git history.

## PRP File: $ARGUMENTS

## Reset Process

1. **Confirm Reset Action**
   - Display current PRP status
   - Show what will be reset
   - **CRITICAL**: Require explicit confirmation before proceeding
   - Warn about potential data loss

2. **Backup Current State**
   - Create backup of current state file: `{prp-name}.state.backup.{timestamp}`
   - Record current Git commit for potential rollback
   - Save current branch state

3. **Reset State File**
   - Delete current state file: `{prp-name}.state`
   - Remove PRP-related Git tags (optional, ask user)
   - **DO NOT** reset Git commits - preserve implementation history

4. **Reset Options**

   **Option A: Soft Reset (Recommended)**
   - Delete state file only
   - Keep all Git commits and tags
   - Allow `/execute-prp` to start fresh but skip already implemented code

   **Option B: Hard Reset (Destructive)**
   - Delete state file
   - Remove PRP-related Git tags: `prp-task-*`, `prp-complete-*`
   - **WARNING**: This makes it harder to track previous implementation attempts

   **Option C: Rollback Reset**
   - Reset to specific task checkpoint
   - `git reset --hard prp-task-{N}`
   - Update state file to reflect rollback point
   - Remove subsequent tags and state entries

5. **Post-Reset Actions**
   - Confirm state file deletion
   - Display reset summary
   - Provide next steps: "Use `/execute-prp` to start fresh implementation"

## Reset Confirmation Dialog

```
PRP Reset Confirmation
=====================

PRP File: tempus-ring-implementation.md
Current Status: 4/20 tasks completed (20%)
Last Activity: 2025-01-13 11:30:00

⚠️  WARNING: This will reset PRP execution state

What will be reset:
✓ State file (.state) will be deleted
✓ Progress tracking will be lost
✓ Task completion records will be removed

What will be preserved:
✓ All Git commits and code changes
✓ Current branch and working directory
✓ PRP file content

Reset Options:
[1] Soft Reset - Delete state only (Recommended)
[2] Hard Reset - Delete state + remove PRP tags  
[3] Rollback Reset - Reset to specific task
[4] Cancel

Choose option [1-4]:
```

## Rollback Reset Details

If user chooses rollback reset:

```
Available Rollback Points:
=========================

[1] Task 4: Implement DOM Renderer (commit: jkl012)
[2] Task 3: Implement Settings Service (commit: ghi789)  
[3] Task 2: Port Examples to Main Source (commit: def456)
[4] Task 1: Implement Timer State Machine (commit: abc123)
[5] Initial state (before PRP execution)

Choose rollback point [1-5]:
```

## Safety Measures

- Always create backup before reset
- Require explicit user confirmation
- Provide clear warnings about data loss
- Offer multiple reset options
- Show exactly what will be affected

## Usage Examples

```bash
# Basic reset
/prp-reset PRPs/tempus-ring-implementation.md

# Reset with specific option (if supported)
/prp-reset PRPs/tempus-ring-implementation.md --soft

# Reset and rollback to task 3
/prp-reset PRPs/tempus-ring-implementation.md --rollback=3
```

Note: This is a destructive operation. Always backup important state before resetting.
