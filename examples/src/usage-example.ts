/**
 * 使用示例
 * Usage example demonstrating the timer factory and theme manager
 */

import { TimerFactory } from './factories/timer-factory';
import { i18n } from './i18n';
import { ThemeManager } from './services/theme-manager';
import type { TimerRenderer } from './types/renderer-interface';

/**
 * 初始化计时器应用
 * Initialize timer application
 */
async function initializeTimerApp(): Promise<void> {
  try {
    // 1. 初始化国际化
    await i18n.init();
    console.log('i18n initialized with language:', i18n.getCurrentLanguage());

    // 2. 创建主题管理器和工厂
    const themeManager = new ThemeManager();
    const timerFactory = new TimerFactory(themeManager);

    // 3. 获取容器元素
    const container = document.getElementById('timer-container');
    if (!container) {
      throw new Error('Timer container not found');
    }

    // 4. 创建初始渲染器
    const currentRenderer = timerFactory.createRenderer(container, 'main-timer');
    console.log(`Created ${currentRenderer.getType()} renderer`);

    // 5. 设置主题切换监听器
    themeManager.addThemeChangeListener((themeName) => {
      console.log(`Theme changed to: ${themeName}`);
      updateUI();
    });

    // 6. 创建控制界面
    createControlPanel(timerFactory, container);

    // 7. 启动计时器演示
    startTimerDemo(currentRenderer, themeManager);
  } catch (error) {
    console.error('Failed to initialize timer app:', error);
  }
}

/**
 * 创建控制面板
 * Create control panel for theme switching and settings
 */
function createControlPanel(factory: TimerFactory, container: HTMLElement): void {
  const controlPanel = document.createElement('div');
  controlPanel.className = 'control-panel';
  controlPanel.innerHTML = `
    <div class="settings-panel">
      <h3>${i18n.t('settings.theme')}</h3>
      <select id="theme-selector">
        ${factory
          .getThemeManager()
          .getAvailableThemes()
          .map(
            (theme) => `<option value="${theme.name}">${i18n.t(`themes.${theme.name}`)}</option>`
          )
          .join('')}
      </select>
      
      <h3>${i18n.t('settings.language')}</h3>
      <select id="language-selector">
        ${i18n
          .getSupportedLanguages()
          .map(
            (lang) =>
              `<option value="${lang}" ${lang === i18n.getCurrentLanguage() ? 'selected' : ''}>${lang.toUpperCase()}</option>`
          )
          .join('')}
      </select>
      
      <div class="control-group">
        <button id="start-btn" class="timer-button">${i18n.t('timer.start')}</button>
        <button id="pause-btn" class="timer-button">${i18n.t('timer.pause')}</button>
        <button id="reset-btn" class="timer-button">${i18n.t('timer.reset')}</button>
      </div>
    </div>
  `;

  // 添加事件监听器
  const themeSelector = controlPanel.querySelector('#theme-selector') as HTMLSelectElement;
  const languageSelector = controlPanel.querySelector('#language-selector') as HTMLSelectElement;

  themeSelector.addEventListener('change', async (e) => {
    const themeName = (e.target as HTMLSelectElement).value;
    try {
      await factory.switchTheme(themeName, container, 'main-timer');
      console.log(`Switched to theme: ${themeName}`);
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  });

  languageSelector.addEventListener('change', async (e) => {
    const language = (e.target as HTMLSelectElement).value;
    try {
      await i18n.switchLanguage(language);
      updateControlPanelText(controlPanel);
      console.log(`Switched to language: ${language}`);
    } catch (error) {
      console.error('Failed to switch language:', error);
    }
  });

  // 添加到页面
  document.body.appendChild(controlPanel);
}

/**
 * 更新控制面板文本
 * Update control panel text after language change
 */
function updateControlPanelText(controlPanel: HTMLElement): void {
  const elements = {
    'h3:nth-of-type(1)': i18n.t('settings.theme'),
    'h3:nth-of-type(2)': i18n.t('settings.language'),
    '#start-btn': i18n.t('timer.start'),
    '#pause-btn': i18n.t('timer.pause'),
    '#reset-btn': i18n.t('timer.reset'),
  };

  for (const [selector, text] of Object.entries(elements)) {
    const element = controlPanel.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
  }
}

/**
 * 启动计时器演示
 * Start timer demonstration
 */
function startTimerDemo(renderer: TimerRenderer, themeManager: ThemeManager): void {
  let progress = 0;
  let isRunning = false;
  let intervalId: number | null = null;

  const updateTimer = () => {
    if (!isRunning) return;

    progress += 0.001; // 每次增加0.1%
    if (progress >= 1) {
      progress = 0;
      console.log(i18n.t('timer.completed'));
    }

    // 更新渲染器
    const currentTheme = themeManager.getCurrentTheme();
    const themeConfig = {
      name: currentTheme.name,
      colors: {
        primary: '#374151',
        secondary: '#9ca3af',
        background: '#ffffff',
        accent: '#ef4444',
        text: '#1f2937',
        surface: '#f9fafb',
      },
      sizes: {
        clockSize: 256,
        ringWidth: 4,
        tickLength: 8,
        majorTickLength: 12,
        handWidth: 2,
        fontSize: 24,
        centerDotSize: 8,
      },
      effects: {
        shadow: true,
        glow: false,
        animation: 'smooth' as const,
      },
    };

    renderer.render(progress, themeConfig);

    // 更新时间显示
    const remainingMinutes = Math.ceil((1 - progress) * 25);
    const timeString = `${remainingMinutes}:00`;
    renderer.updateTime(timeString);
  };

  // 控制按钮事件
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.id === 'start-btn') {
      isRunning = true;
      renderer.setAnimationState(true);
      if (!intervalId) {
        intervalId = window.setInterval(updateTimer, 100);
      }
    } else if (target.id === 'pause-btn') {
      isRunning = false;
      renderer.setAnimationState(false);
    } else if (target.id === 'reset-btn') {
      isRunning = false;
      progress = 0;
      renderer.setAnimationState(false);
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      renderer.updateTime('25:00');
    }
  });

  // 初始渲染
  updateTimer();
}

/**
 * 更新UI文本
 * Update UI text after language change
 */
function updateUI(): void {
  // 这里可以添加更多UI更新逻辑
  console.log('UI updated for theme/language change');
}

// 页面加载完成后初始化
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeTimerApp);
}

// 导出供其他模块使用
export { initializeTimerApp };
