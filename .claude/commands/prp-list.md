# List All PRPs

Display overview of all PRP files and their execution status.

## Arguments: None (scans PRPs/ directory)

## List Process

1. **Scan PRP Directory**
   - Find all .md files in PRPs/ directory
   - Exclude template files and documentation
   - Load corresponding .state files if they exist

2. **Categorize PRPs**

   **Active PRPs** (have state files):
   - Currently executing
   - Paused/interrupted
   - Failed with recoverable errors

   **Completed PRPs**:
   - Successfully finished
   - All tasks completed

   **Draft PRPs**:
   - No state file (never executed)
   - Ready for execution

3. **Display Overview**

```txt
PRP Overview
============

📊 Summary:
- Total PRPs: 5
- Active: 2
- Completed: 1  
- Draft: 2

🔄 Active PRPs:
┌─────────────────────────────────┬──────────┬─────────────┬──────────────┐
│ PRP File                        │ Progress │ Current Task│ Last Updated │
├─────────────────────────────────┼──────────┼─────────────┼──────────────┤
│ tempus-ring-implementation.md   │ 4/20     │ Task 5      │ 2h ago       │
│ user-auth-system.md             │ 8/12     │ Task 9      │ 1d ago       │
└─────────────────────────────────┴──────────┴─────────────┴──────────────┘

✅ Completed PRPs:
- mobile-responsive-ui.md (completed 3d ago)

📝 Draft PRPs:
- payment-integration.md
- notification-system.md
```

4. **Detailed View Options**

```bash
# Basic list
/prp-list

# Show only active PRPs
/prp-list --active

# Show detailed status for all
/prp-list --detailed

# Show PRPs with issues
/prp-list --issues
```

5. **Batch Operations**

   **Validation**:

   ```bash
   # Validate all active PRPs
   /prp-list --validate-all
   ```

   **Cleanup**:

   ```bash
   # Clean up old completed PRPs
   /prp-list --cleanup-completed
   ```

6. **Quick Actions**

   From the list view, suggest quick actions:
   - Resume interrupted PRPs
   - Validate PRPs with issues
   - Archive completed PRPs

## Integration Features

- **Git Branch Status**: Show which PRPs have active feature branches
- **Conflict Detection**: Identify PRPs that might conflict with each other
- **Resource Usage**: Show which PRPs are using similar files/components

## Usage Examples

```bash
# Daily workflow check
/prp-list --active

# Weekly cleanup
/prp-list --cleanup-completed --archive

# Health check
/prp-list --validate-all --fix-issues
```

Note: This command provides project-wide PRP management and oversight.
