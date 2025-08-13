# Refine Code

Make a small, targeted code change based on a natural language request. This is for iterative fixes after an initial implementation.

## Refinement Request: $ARGUMENTS

## Refinement Process

1. **Understand Request**:
    * Analyze the user's request to understand the specific change needed (e.g., "change button color", "adjust padding", "rename a variable").

2. **Codebase Analysis**:
    * Search the codebase to identify the relevant file(s) and code block(s) that need to be modified. Use `search_file_content` and `glob` extensively.

3. **Plan the Change**:
    * Formulate a precise plan for the code modification. This might involve using the `replace` tool for a targeted change.

4. **Execute the Change**:
    * Apply the code change.

5. **Validate**:
    * Run relevant validation commands (`pnpm check:all`, `pnpm test`) to ensure the change did not introduce any regressions.
    * If validation fails, analyze the error and attempt to fix it.

6. **Complete**:
    * Report the file(s) that have been changed and confirm that validation passed.
