import { test, expect } from '@playwright/test';

test.describe('Timer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should display initial timer state', async ({ page }) => {
    // Check timer display
    await expect(page.locator('text=25:00').first()).toBeVisible();
    await expect(page.locator('text=工作')).toBeVisible();
    await expect(page.locator('text=已完成: 0')).toBeVisible();
    await expect(page.locator('text=剩余: 4')).toBeVisible();

    // Check button states
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  test('should start timer correctly', async ({ page }) => {
    // Start timer
    await page.getByRole('button', { name: 'Start' }).click();

    // Check state changes
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeEnabled();
    
    // Check timer is counting down (wait for a few seconds)
    await page.waitForTimeout(3000);
    const timeText = await page.locator('text=/^24:5[0-9]$/').textContent();
    expect(timeText).toMatch(/^24:5[0-9]$/);
  });

  test('should pause and resume timer', async ({ page }) => {
    // Start timer
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(2000);

    // Pause timer
    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.locator('text=Pause')).toBeVisible();
    
    // Should show both Start and Resume buttons
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();

    const pausedTime = await page.locator('text=/^24:5[0-9]$/').textContent();
    
    // Wait a bit and ensure time doesn't change when paused
    await page.waitForTimeout(2000);
    const stillPausedTime = await page.locator('text=/^24:5[0-9]$/').textContent();
    expect(stillPausedTime).toBe(pausedTime);

    // Resume timer
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await expect(page.locator('text=工作')).toBeVisible();
  });

  test('should reset timer correctly', async ({ page }) => {
    // Start timer
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(3000);

    // Reset timer
    await page.getByRole('button', { name: 'Reset' }).click();

    // Check reset state
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeDisabled();
    await expect(page.locator('text=工作')).toBeVisible();
  });

  test('should show progress correctly', async ({ page }) => {
    // Start timer
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(5000);

    // Check progress is visible and reasonable
    const progressText = await page.locator('text=/\d+% complete/').textContent();
    expect(progressText).toMatch(/[1-9]\d*% complete/); // Should be more than 0%
  });

  test('should maintain session counts', async ({ page }) => {
    // Check initial session counts
    await expect(page.locator('text=已完成: 0')).toBeVisible();
    await expect(page.locator('text=剩余: 4')).toBeVisible();

    // Start and reset timer (incomplete session)
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Reset' }).click();

    // Session counts should remain the same for incomplete sessions
    await expect(page.locator('text=已完成: 0')).toBeVisible();
    await expect(page.locator('text=剩余: 4')).toBeVisible();
  });
});