import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should display all available languages', async ({ page }) => {
    // Open settings
    await page.locator('button[id="settings-button"]').click();
    
    // Check language dropdown options
    const languageSelect = page.locator('#language-select');
    await expect(languageSelect).toBeVisible();
    
    // Check for all languages
    await expect(languageSelect.locator('option[value="en"]')).toContainText('English');
    await expect(languageSelect.locator('option[value="zh-CN"]')).toContainText('简体中文');
    await expect(languageSelect.locator('option[value="zh-TW"]')).toContainText('繁體中文');
    await expect(languageSelect.locator('option[value="ja"]')).toContainText('日本語');
  });

  test('should switch from Chinese to English', async ({ page }) => {
    // Initially should be in Chinese
    await expect(page.locator('text=工作')).toBeVisible();
    await expect(page.locator('text=已完成: 0')).toBeVisible();
    
    // Open settings
    await page.locator('button[id="settings-button"]').click();
    await expect(page.locator('text=设置')).toBeVisible();
    
    // Switch to English
    const languageSelect = page.locator('#language-select');
    await languageSelect.selectOption('en');
    await expect(languageSelect).toHaveValue('en');
    
    // Save settings
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify English text appears
    await expect(page.locator('text=Work')).toBeVisible();
    await expect(page.locator('text=Completed: 0')).toBeVisible();
    
    // Verify settings button text changed
    await page.locator('button[id="settings-button"]').click();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should switch to Traditional Chinese', async ({ page }) => {
    // Open settings (assuming we start in Simplified Chinese)
    await page.locator('button[id="settings-button"]').click();
    
    // Switch to Traditional Chinese
    const languageSelect = page.locator('#language-select');
    await languageSelect.selectOption('zh-TW');
    await expect(languageSelect).toHaveValue('zh-TW');
    
    // Save settings
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Note: Traditional Chinese translations might be the same for basic terms
    // but the language selection should persist
    await page.locator('button[id="settings-button"]').click();
    await expect(languageSelect).toHaveValue('zh-TW');
  });

  test('should switch to Japanese', async ({ page }) => {
    // Open settings
    await page.locator('button[id="settings-button"]').click();
    
    // Switch to Japanese
    const languageSelect = page.locator('#language-select');
    await languageSelect.selectOption('ja');
    await expect(languageSelect).toHaveValue('ja');
    
    // Save settings
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify language selection persisted
    await page.locator('button[id="settings-button"]').click();
    await expect(languageSelect).toHaveValue('ja');
  });

  test('should maintain language during timer operation', async ({ page }) => {
    // Start with Chinese, start timer
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('text=工作')).toBeVisible();
    
    // Switch language while timer is running
    await page.locator('button[id="settings-button"]').click();
    const languageSelect = page.locator('#language-select');
    await languageSelect.selectOption('en');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify timer still running but in English
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await expect(page.locator('text=Work')).toBeVisible();
    
    // Verify language persisted
    await page.locator('button[id="settings-button"]').click();
    await expect(languageSelect).toHaveValue('en');
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should cancel language changes', async ({ page }) => {
    // Open settings and note initial language
    await page.locator('button[id="settings-button"]').click();
    const languageSelect = page.locator('#language-select');
    const initialLanguage = await languageSelect.inputValue();
    
    // Change language but cancel
    await languageSelect.selectOption('en');
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify settings panel closed
    await expect(page.locator('text=设置')).not.toBeVisible();
    
    // Reopen and verify language didn't change
    await page.locator('button[id="settings-button"]').click();
    await expect(languageSelect).toHaveValue(initialLanguage);
  });

  test('should handle missing translations gracefully', async ({ page }) => {
    // Some theme names show as keys like "themes.dawn-dusk"
    await page.locator('button[id="settings-button"]').click();
    
    // Check that missing translation keys are displayed as fallback
    const themeSelect = page.locator('#theme-select');
    await expect(themeSelect.locator('option').getByText('themes.dawn-dusk')).toBeVisible();
    await expect(themeSelect.locator('option').getByText('themes.hand-drawn')).toBeVisible();
  });
});