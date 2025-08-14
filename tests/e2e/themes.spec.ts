import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should open and close settings panel', async ({ page }) => {
    // Open settings
    await page.getByRole('button', { name: '⚙️' }).click();
    await expect(page.locator('text=设置')).toBeVisible();
    
    // Close settings with X button
    await page.getByRole('button', { name: '×' }).click();
    await expect(page.locator('text=设置')).not.toBeVisible();
  });

  test('should display all available themes', async ({ page }) => {
    // Open settings
    await page.getByRole('button', { name: '⚙️' }).click();
    
    // Check theme dropdown options
    const themeSelect = page.locator('#theme-select');
    await expect(themeSelect).toBeVisible();
    
    // Check for all themes
    await expect(themeSelect.locator('option[value="wabisabi"]')).toContainText('Wabi-Sabi');
    await expect(themeSelect.locator('option[value="cloudlight"]')).toContainText('Cloudlight');
    await expect(themeSelect.locator('option[value="dawn-dusk"]')).toContainText('themes.dawn-dusk');
    await expect(themeSelect.locator('option[value="nightfall"]')).toContainText('Nightfall');
    await expect(themeSelect.locator('option[value="artistic"]')).toContainText('Artistic Sketch');
    await expect(themeSelect.locator('option[value="hand-drawn"]')).toContainText('themes.hand-drawn');
  });

  test('should switch theme from Cloudlight to Wabi-Sabi', async ({ page }) => {
    // Open settings
    await page.getByRole('button', { name: '⚙️' }).click();
    
    // Verify current theme is Cloudlight
    const themeSelect = page.locator('#theme-select');
    await expect(themeSelect).toHaveValue('cloudlight');
    
    // Switch to Wabi-Sabi
    await themeSelect.selectOption('wabisabi');
    await expect(themeSelect).toHaveValue('wabisabi');
    
    // Save settings
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify settings panel closed
    await expect(page.locator('text=设置')).not.toBeVisible();
    
    // Reopen settings to verify theme persisted
    await page.getByRole('button', { name: '⚙️' }).click();
    await expect(themeSelect).toHaveValue('wabisabi');
  });

  test('should switch theme to Nightfall', async ({ page }) => {
    // Open settings
    await page.getByRole('button', { name: '⚙️' }).click();
    
    // Switch to Nightfall theme
    const themeSelect = page.locator('#theme-select');
    await themeSelect.selectOption('nightfall');
    await expect(themeSelect).toHaveValue('nightfall');
    
    // Save settings
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify theme persisted
    await page.getByRole('button', { name: '⚙️' }).click();
    await expect(themeSelect).toHaveValue('nightfall');
  });

  test('should cancel theme changes', async ({ page }) => {
    // Open settings and note initial theme
    await page.getByRole('button', { name: '⚙️' }).click();
    const themeSelect = page.locator('#theme-select');
    const initialTheme = await themeSelect.inputValue();
    
    // Change theme but cancel
    await themeSelect.selectOption('artistic');
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify settings panel closed
    await expect(page.locator('text=设置')).not.toBeVisible();
    
    // Reopen and verify theme didn't change
    await page.getByRole('button', { name: '⚙️' }).click();
    await expect(themeSelect).toHaveValue(initialTheme);
  });

  test('should apply theme changes during timer operation', async ({ page }) => {
    // Start timer first
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(2000);
    
    // Open settings while timer is running
    await page.getByRole('button', { name: '⚙️' }).click();
    
    // Change theme
    const themeSelect = page.locator('#theme-select');
    await themeSelect.selectOption('artistic');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify timer is still running
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await expect(page.locator('text=工作')).toBeVisible();
    
    // Verify theme change persisted
    await page.getByRole('button', { name: '⚙️' }).click();
    await expect(themeSelect).toHaveValue('artistic');
  });
});