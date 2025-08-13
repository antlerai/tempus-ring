# Validate PRP State

Validate the consistency between PRP state file and actual Git history.

## PRP File: $ARGUMENTS

## Validation Process

1. **Load State and Git History**
   - Read PRP file and corresponding state file
   - Load Git commit history and tags
   - Compare state records with actual Git state

2. **Consistency Checks**

   **State File Validation**:
   - Verify JSON format is valid
   - Check all required fields are present
   - Validate task numbers are sequential
   - Ensure timestamps are reasonable

   **Git History Validation**:
   - Verify all completed tasks have corresponding commits
   - Check that commit hashes in state file exist in Git
   - Validate PRP tags match completed tasks
   - Ensure commit messages follow commitlint format

   **Cross-Validation**:
   - Match state file task completion with Git tags
   - Verify currentTask aligns with latest commit
   - Check for orphaned commits or missing state entries

3. **Report Validation Results**

```
PRP Validation Report: tempus-ring-implementation.md
==================================================

✅ State File: Valid JSON format
✅ Task Sequence: Sequential numbering (1-20)
✅ Git History: All commits exist
✅ Commit Messages: Commitlint compliant
⚠️  Warning: Task 5 commit hash mismatch
❌ Error: Missing tag for completed task 3

Detailed Issues:
- Task 5: State shows commit abc123, but Git shows def456
- Task 3: Marked complete but no prp-task-3 tag found

Recommendations:
1. Update state file task 5 commit hash
2. Create missing tag: git tag prp-task-3 ghi789
3. Run /prp-status to verify fixes
```

4. **Auto-Fix Options**

   **Safe Fixes** (automatically applied):
   - Update commit hashes in state file
   - Create missing PRP tags
   - Fix timestamp formatting

   **Manual Fixes** (require confirmation):
   - Remove orphaned state entries
   - Reset inconsistent task status
   - Rebuild state from Git history

5. **Recovery Suggestions**

   **Minor Issues**:
   - Suggest specific commands to fix
   - Provide exact Git commands needed

   **Major Issues**:
   - Recommend `/prp-reset` with rollback
   - Suggest manual state file editing
   - Offer to rebuild state from scratch

## Validation Examples

```bash
# Basic validation
/prp-validate PRPs/tempus-ring-implementation.md

# Validation with auto-fix
/prp-validate PRPs/tempus-ring-implementation.md --fix

# Detailed validation report
/prp-validate PRPs/tempus-ring-implementation.md --verbose
```

## Integration with Other Commands

- **Before Resume**: `/prp-resume` should call validation first
- **After Reset**: `/prp-reset` should validate the result
- **Status Check**: `/prp-status` can show validation warnings

Note: This command helps maintain state consistency and prevents corruption issues.
