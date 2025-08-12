# Tempus Ring Examples

这个文件夹包含了多主题多渲染器架构的示例代码，用于指导AI编程助手理解项目的设计模式和最佳实践。

## 文件结构说明

### 核心架构组织

- `types/renderer-interface.ts` - 渲染器抽象接口定义和实现类
- `services/theme-manager.ts` - 主题管理器，负责主题切换和配置
- `factories/timer-factory.ts` - 计时器工厂，根据主题创建对应渲染器

### 文件夹职责

- **types/** - 接口定义、类型声明和抽象类实现
- **services/** - 业务逻辑管理、状态管理和配置服务
- **factories/** - 对象创建模式、实例化逻辑
- **i18n/** - 国际化文件、语言包、翻译配置

## 核心架构

### 主题设计 (6种)

- **DOM**: Cloudlight Minimal、Nightfall (简洁风格)
- **SVG**: Hand-Drawn Sketch、Artistic Sketch (矢量图形)  
- **Canvas**: WabiSabi、Dawn and Dusk (手绘效果、复杂动画)

### 样式管理

- **结构样式**: `*-common.css` - 布局、尺寸、动画
- **主题样式**: CSS变量 - 颜色、字体、特效
- **Canvas配置**: TypeScript对象 - 支持Rough.js手绘效果

### 关键特性

- 统一的 `TimerRenderer` 接口
- 100个刻度标记 (每10个为主刻度)
- 按需加载CSS和JavaScript库
- 响应式设计和动态效果

## 使用示例

```typescript
// 导入模块
import { TimerFactory } from './factories/timer-factory';
import { ThemeManager } from './services/theme-manager';
import { i18n } from './i18n';

// 初始化国际化
await i18n.init();

// 创建计时器
const themeManager = new ThemeManager();
const factory = new TimerFactory(themeManager);
const container = document.getElementById('timer-container');
const renderer = factory.createRenderer(container, 'main-timer');

// 切换主题
await factory.switchTheme('wabi-sabi', container, 'main-timer');

// 渲染进度
const themeConfig = {
  name: 'wabi-sabi',
  colors: { primary: '#374151', secondary: '#9ca3af', accent: '#ef4444', /* ... */ },
  sizes: { clockSize: 256, ringWidth: 4, tickLength: 8, /* ... */ },
  effects: { shadow: true, glow: false, animation: 'smooth' }
};
renderer.render(0.5, themeConfig); // 50% 进度

// 更新时间显示
renderer.updateTime('12:30');

// 设置动画状态
renderer.setAnimationState(true);

// 切换语言
await i18n.switchLanguage('zh');
console.log(i18n.t('timer.start')); // "开始计时"
```

## 测试

```bash
# 运行测试
pnpm test

# 运行特定测试文件
pnpm test timer-factory.test.ts
pnpm test theme-manager.test.ts
```

## 代码质量特性

- ✅ **完整的 TypeScript 类型定义**：严格的类型检查和接口定义
- ✅ **错误处理**：完善的错误处理和验证机制
- ✅ **国际化支持**：完整的 i18n 实现，支持多语言
- ✅ **单元测试**：使用 Vitest 的完整测试覆盖
- ✅ **JSDoc 注释**：详细的中英文文档注释
- ✅ **资源管理**：正确的内存管理和资源清理
- ✅ **缓存机制**：渲染器缓存和性能优化
- ✅ **高 DPI 支持**：Canvas 渲染器支持高分辨率显示
- ✅ **事件系统**：主题切换和语言切换事件监听

这些示例文件展示了如何实现可扩展、可维护、类型安全的多主题多渲染器架构。
