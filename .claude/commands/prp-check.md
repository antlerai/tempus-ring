# Check PRP Quality

Analyze a PRP file for completeness, quality, and execution readiness.

## PRP File: $ARGUMENTS

## Quality Check Process

1. **Structure Validation**
   - Verify all required sections are present
   - Check task numbering is sequential and complete
   - Validate YAML frontmatter format
   - Ensure proper markdown structure

2. **Content Analysis**

   **Context Completeness**:
   - All referenced files exist and are accessible
   - External URLs are valid and reachable
   - Code examples are syntactically correct
   - Documentation links are current

   **Task Quality**:
   - Each task has clear, actionable steps
   - Tasks are properly sequenced
   - Dependencies between tasks are clear
   - Test tasks are included for each feature

   **Implementation Readiness**:
   - All necessary context is provided
   - Validation commands are executable
   - Success criteria are measurable
   - Anti-patterns are clearly defined

3. **Quality Scoring**

```
PRP Quality Report: tempus-ring-implementation.md
===============================================

📊 Overall Score: 8.5/10 (High Quality)

✅ Structure (10/10):
- All required sections present
- Sequential task numbering (1-20)
- Proper markdown formatting
- Valid YAML frontmatter

✅ Context (9/10):
- All referenced files exist
- External URLs accessible
- Code examples valid
⚠️  Minor: One documentation link outdated

✅ Tasks (8/10):
- Clear, actionable steps
- Proper sequencing
- Test tasks included
⚠️  Issue: Task 15 lacks specific validation

⚠️  Implementation (7/10):
- Most context provided
- Validation commands present
❌ Missing: Error handling patterns for Canvas renderer
❌ Missing: Performance benchmarks for theme switching

🎯 Success Criteria (9/10):
- Measurable criteria defined
- Clear validation gates
⚠️  Minor: Could add more specific metrics
```

4. **Detailed Issues Report**

```
Critical Issues (Must Fix):
- Task 15: Missing validation steps for audio service
- Missing error handling patterns for Canvas renderer

Warnings (Should Fix):
- Documentation link outdated: https://old-docs.example.com
- Task 8: Could be more specific about theme switching performance

Suggestions (Nice to Have):
- Add performance benchmarks section
- Include more code examples for complex tasks
- Consider splitting Task 12 into smaller subtasks
```

5. **Automated Fixes**

   **Safe Fixes** (auto-applied):
   - Fix markdown formatting issues
   - Update task numbering if gaps found
   - Validate and fix YAML frontmatter

   **Suggested Fixes** (require approval):
   - Add missing test tasks
   - Update outdated documentation links
   - Enhance task descriptions

6. **Execution Readiness Assessment**

```
Execution Readiness: 85% Ready
==============================

✅ Can Start Execution:
- All dependencies identified
- Task sequence is logical
- Basic validation present

⚠️  Risks to Address:
- Missing error patterns may cause task failures
- Outdated docs might lead to wrong implementations

🚀 Recommendations:
1. Fix critical issues before execution
2. Update documentation links
3. Add missing validation steps
4. Consider /prp-validate after fixes
```

7. **Integration Checks**
   - Verify compatibility with existing codebase
   - Check for conflicts with other active PRPs
   - Validate against project coding standards
   - Ensure all tools and dependencies are available

## Usage Examples

```bash
# Basic quality check
/prp-check PRPs/tempus-ring-implementation.md

# Detailed analysis with auto-fix
/prp-check PRPs/feature.md --fix --detailed

# Quick readiness check
/prp-check PRPs/feature.md --readiness-only

# Batch check all PRPs
/prp-check PRPs/*.md --summary
```

## Quality Metrics

- **Structure Score**: Markdown format, sections, task numbering
- **Context Score**: References, examples, documentation
- **Task Score**: Clarity, sequencing, completeness
- **Implementation Score**: Patterns, validation, error handling
- **Success Criteria Score**: Measurability, clarity

## Integration with Workflow

- **Before Execution**: Run quality check to ensure readiness
- **After Refinement**: Validate that changes maintain quality
- **Periodic Review**: Check quality of long-running PRPs

Note: This command ensures PRPs meet quality standards before execution, reducing failure rates and improving success.
