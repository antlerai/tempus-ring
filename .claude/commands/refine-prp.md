# Refine PRP

Refine an existing PRP based on human feedback and comments, with state management awareness.

## PRP File: $ARGUMENTS

## Refinement Process

1. **Load Existing PRP and Check State**
   - Read the specified PRP file that contains human feedback (e.g., comments, edits)
   - Check if PRP has an active state file
   - **CRITICAL**: If PRP is currently being executed, warn about potential conflicts

2. **State-Aware Analysis**
   - If PRP has active state:
     - Identify which tasks might be affected by changes
     - Warn if completed tasks need modification
     - Suggest whether to pause execution during refinement
   - If PRP is not started: Proceed with normal refinement

3. **Understand Feedback**
   - Carefully analyze the feedback provided by the human developer
   - Identify which parts of the PRP need to be changed, added, or removed
   - **NEW**: Check if changes affect task numbering or sequencing

4. **ULTRATHINK**
   - Think about how to best incorporate the feedback while preserving the integrity and valuable context of the original PRP
   - Create a plan to rewrite the necessary sections
   - **CRITICAL**: Ensure task numbering remains consistent for state tracking
   - Consider impact on any active execution

5. **Handle State Conflicts**

   **If PRP is actively executing**:
   - Option A: Pause execution, refine, then resume
   - Option B: Create refined version as new PRP file
   - Option C: Apply changes that don't affect completed tasks only

   **If PRP has completed tasks**:
   - Preserve completed task definitions
   - Only modify future tasks or add new ones
   - Update task numbering carefully

6. **Rewrite and Refine**
   - Rewrite the PRP file, applying the requested changes
   - Ensure the refined PRP is coherent, consistent, and still follows all best practices
   - **CRITICAL**: Maintain numbered task format for state compatibility
   - Preserve all context and validation requirements

7. **State File Updates**
   - If task structure changed: Update state file accordingly
   - If new tasks added: Extend state tracking
   - If tasks removed: Clean up state entries
   - Validate state consistency after changes

8. **Output and Recommendations**
   - Overwrite the original PRP file with the refined content
   - Update state file if necessary
   - Report completion with summary of changes
   - Provide recommendations for next steps

## Refinement Examples

```bash
# Basic refinement (no active state)
/refine-prp PRPs/feature.md

# Refinement with active execution
/refine-prp PRPs/active-feature.md
# Output: "Warning: PRP is actively executing. Recommend pausing first."

# Force refinement (advanced)
/refine-prp PRPs/feature.md --force
```

## Safety Measures

- **Backup**: Always create backup before refinement
- **Validation**: Validate refined PRP against original requirements
- **State Consistency**: Ensure state file remains valid after changes
- **Conflict Prevention**: Warn about potential execution conflicts

Note: This command now integrates with the state management system to prevent conflicts and maintain consistency.
