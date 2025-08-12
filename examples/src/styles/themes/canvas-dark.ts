// Canvas渲染器 - 深色主题配置
// Canvas渲染器通过JavaScript配置对象管理样式

export const canvasDarkTheme = {
  colors: {
    primary: '#60a5fa', // 蓝色主色调
    secondary: '#94a3b8', // 灰色次要色
    accent: '#fbbf24', // 黄色强调色
    background: '#1f2937', // 深色背景
    surface: '#374151', // 表面颜色
    text: '#f9fafb', // 文本颜色
    textSecondary: '#d1d5db', // 次要文本
    border: '#4b5563', // 边框颜色
    success: '#34d399', // 成功状态
    warning: '#fbbf24', // 警告状态
    error: '#f87171', // 错误状态
  },

  sizes: {
    ringWidth: 6, // 进度环宽度
    tickLength: 12, // 刻度长度
    majorTickLength: 20, // 主要刻度长度
    fontSize: 24, // 字体大小
    centerDotRadius: 4, // 中心点半径
    handWidth: {
      hour: 4, // 时针宽度
      minute: 3, // 分针宽度
      second: 1, // 秒针宽度
    },
    handLength: {
      hour: 60, // 时针长度
      minute: 80, // 分针长度
      second: 90, // 秒针长度
    },
  },

  animation: {
    duration: 1500000, // 动画时长(毫秒) - 25分钟
    easing: 'linear', // 缓动函数
    tickInterval: 1000, // 刻度更新间隔
  },

  effects: {
    shadow: {
      color: 'rgba(0, 0, 0, 0.3)',
      blur: 4,
      offsetX: 2,
      offsetY: 2,
    },
    glow: {
      color: '#60a5fa',
      blur: 8,
    },
  },
} as const;

export type CanvasThemeConfig = typeof canvasDarkTheme;
