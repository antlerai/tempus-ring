# Release

Release a new version of the code using the following process:

1. Review changes since the last release with git
2. Update CHANGELOG.md with your changes under [Unreleased] section
3. Run checks: `pnpm check:all` (fix any issues)
4. Update version: `pnpm version patch|minor|major`.
5. Update CHANGELOG.md to move [Unreleased] changes to the new version with date
6. Commit changes: `git commit -a -m "Update changelog and build for vX.X.X"`
7. Push changes: `git push && git push --tags`

## Changelog Management

- All notable changes must be documented in CHANGELOG.md
- Add new entries under the [Unreleased] section as you work
- Focus on functional changes that affect users
- Categorize changes as Added, Changed, Fixed, or Removed
- Move [Unreleased] changes to appropriate version section during release
