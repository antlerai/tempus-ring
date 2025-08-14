# End-to-End Tests for Tempus Ring

This directory contains comprehensive end-to-end tests for the Tempus Ring Pomodoro timer application using Playwright.

## Test Coverage

### 1. Timer Functionality (`timer.spec.ts`)
- Initial timer state display
- Start/pause/resume/reset operations
- Progress tracking
- Session counting
- Timer state persistence

### 2. Theme Switching (`themes.spec.ts`)
- Settings panel navigation
- Theme selection and switching
- Theme persistence across sessions
- Theme changes during timer operation
- Cancel/save functionality

### 3. Internationalization (`i18n.spec.ts`)
- Language selection (English, Simplified Chinese, Traditional Chinese, Japanese)
- UI text translation verification
- Language persistence
- Language switching during timer operation
- Graceful handling of missing translations

### 4. Notification System (`notifications.spec.ts`)
- Notification permission handling
- Settings toggle for desktop notifications and sound
- Test notification sending
- Settings persistence
- Notification behavior with disabled settings

## Running the Tests

### Prerequisites
```bash
# Install dependencies (including Playwright)
pnpm install

# Install Playwright browsers
npx playwright install
```

### Test Commands

```bash
# Run all e2e tests (headless)
pnpm test:e2e

# Run tests with browser UI visible
pnpm test:e2e:headed

# Run tests with Playwright UI
pnpm test:e2e:ui

# Run specific test file
npx playwright test timer.spec.ts

# Run tests in debug mode
npx playwright test --debug
```

## Test Configuration

The tests are configured in `playwright.config.ts` with:
- **Viewport Size**: 400x600 (matching Tauri window size)
- **Base URL**: http://localhost:1420
- **Browser Support**: Chromium and WebKit
- **Auto-start**: Tauri dev server starts automatically before tests
- **Screenshots**: Captured on test failures
- **Traces**: Recorded on retry for debugging

## Test Environment

The tests expect:
1. The Tauri development server to be running on `http://localhost:1420`
2. The application to load within 2 minutes (for CI environments)
3. Notification permissions to be grantable
4. The UI to be in Chinese by default (based on current implementation)

## Key Testing Patterns

### Page Object Model
While not fully implemented, the tests use reusable selectors and patterns:
```typescript
// Settings panel interaction
await page.getByRole('button', { name: '⚙️' }).click();
await expect(page.locator('text=设置')).toBeVisible();
```

### Timer State Verification
```typescript
// Check timer is running
await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
await expect(page.locator('text=工作')).toBeVisible();
```

### Language Testing
```typescript
// Verify language switch
await languageSelect.selectOption('en');
await expect(page.locator('text=Work')).toBeVisible();
```

## Debugging Tests

1. **Visual Debugging**: Use `pnpm test:e2e:headed` to see tests run in browser
2. **Playwright Inspector**: Use `npx playwright test --debug` for step-by-step debugging
3. **Screenshots**: Check `test-results/` folder for failure screenshots
4. **Traces**: Use `npx playwright show-trace` to view recorded traces

## CI/CD Integration

The tests are designed to run in CI environments with:
- Retry logic for flaky tests
- Optimized parallel execution
- Comprehensive error reporting
- Screenshot capture on failures

## Known Limitations

1. **Full Timer Sessions**: Tests don't wait for complete 25-minute sessions due to time constraints
2. **Tauri Storage**: Some tests may fall back to localStorage due to Tauri API availability in test environment
3. **Sound Testing**: Audio playback testing is limited in headless environments
4. **Visual Theme Verification**: Tests verify theme selection but not visual rendering differences

## Contributing

When adding new tests:
1. Follow the existing naming convention (`feature.spec.ts`)
2. Include proper test descriptions
3. Use appropriate waiting strategies (`waitForTimeout`, `toBeVisible`)
4. Test both success and error cases
5. Verify state persistence where applicable