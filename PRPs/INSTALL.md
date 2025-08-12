# Tempus Ring

## FEATURE

### 核心番茄钟功能

- Cross-platform Pomodoro timer supporting macOS, Linux, Windows, with future Android and iOS mobile support.
- **番茄钟周期管理**: 完整的工作-休息周期自动切换系统
  - 工作时间结束后自动进入休息时间
  - 短休息后自动返回工作状态
  - 长休息后重新开始新的番茄钟会话
- **周期计数与统计**:
  - 实时显示当前会话中完成的番茄钟数量
  - 每日/每周完成的番茄钟统计数据
  - 历史记录查看和数据导出功能
- **智能时间设置**:
  - 可自定义番茄钟工作时间（默认25分钟）
  - 可调整短休息时间（默认5分钟）
  - 可配置长休息时间（默认15-30分钟）
  - 灵活的会话大小设置（每个会话包含的番茄钟数量）

### 用户界面与体验

- Window resolution optimized for mobile-first design.
- **国际化支持 (i18n)**:
  - 默认支持四种语言：简体中文、繁体中文、英语、日语
  - 运行时语言切换，无需重启应用
  - 自动检测系统语言并设置为默认语言
  - 支持扩展更多语言包
- **多主题支持**:
  - 三种渲染方法：DOM、SVG 和 Canvas
  - 运行时主题切换功能，无需重启应用
  - 6种预设主题风格（WabiSabi、Cloudlight、Dawn-Dusk等），未来可能会添加更多主题
- **圆形计时器设计**:
  - 百分比模式：100个刻度标记，每个番茄钟/休息完成一圈
  - 时钟模式：时/分/秒指针像真实时钟一样移动，每个周期后重置到0位置
- **时钟指针旋转设置**:
  - 正向旋转（顺时针）：指针从12点位置开始，按顺时针方向移动
  - 逆向旋转（逆时针）：指针从结束位置开始，按逆时针方向向后移动
  - 用户可在设置中自由切换旋转方向，适应不同的视觉偏好

### 通知与提醒系统

- **多层次通知提醒**:
  - 系统桌面通知（番茄钟/休息结束时触发OS通知）
  - 完成提示音（番茄钟/休息结束时播放音效）
  - 可选的秒针滴答声（模拟真实秒表）
  - 分钟报时功能（每分钟响铃提醒）

### 后台运行与系统集成

- **后台运行模式**:
  - 计时器在后台运行，无需显示时钟界面
  - 通过系统通知或音频提醒计时器完成
- **系统托盘集成**:
  - 最小化到系统托盘功能
  - 托盘菜单显示后台计时器状态
  - 从托盘快速访问设置菜单
  - 托盘菜单中直接控制MCP服务器启停

### 数据管理与持久化

- **数据持久化**:
  - 用户设置和偏好自动保存
  - 番茄钟统计数据本地存储
  - 支持数据备份和恢复功能
  - 跨设备数据同步（未来功能）

### MCP服务器集成

- **MCP (Model Context Protocol) 服务器集成**:
  - 支持 stdio 和 Streamable HTTP 两种协议实现
  - 设置中直接复制JSON配置
  - 提供API接口：获取番茄钟记录、启动计时器、提前完成、显示计时器界面

## EXAMPLES

`examples/` 文件夹包含了完整的多主题多渲染器架构示例代码，展示了项目的核心设计模式和最佳实践：

### 核心示例文件

- **`examples/src/usage-example.ts`** - 完整的使用示例，演示如何：
  - 初始化计时器应用和国际化系统
  - 创建主题管理器和计时器工厂
  - 实现主题切换和语言切换功能
  - 构建控制面板和计时器演示

- **`examples/src/README.md`** - 详细的架构说明文档，包含：
  - 6种主题的渲染方式（DOM/SVG/Canvas）
  - 统一的 `TimerRenderer` 接口设计
  - CSS变量和样式管理策略
  - 完整的代码质量特性清单

### 架构演示

示例代码展示了如何实现：

- **类型安全**：完整的 TypeScript 接口定义
- **主题系统**：DOM、SVG、Canvas 三种渲染方式
- **国际化**：支持中文、英语、日语的 i18n 系统
- **工厂模式**：动态创建和切换渲染器
- **事件系统**：主题和语言切换的响应式更新

### 快速开始

```bash
# 查看示例代码
cd examples/src
cat usage-example.ts

# 运行测试
pnpm test
```

这些示例为 AI 编程助手和开发者提供了清晰的实现指南，确保代码的可扩展性和可维护性。

## DOCUMENTATION

- Model Context Protocol (MCP) 两种协议 stdio 和 Streamable HTTP 的介绍：<https://modelcontextprotocol.io/specification/2025-06-18/basic/transports/>
- Upgrade from Tauri 1.0 to Tauri 2.0：<https://v2.tauri.app/start/migrate/from-tauri-1/>
- Tauri System Tray: <https://v2.tauri.app/learn/system-tray/>
- Tauri 命令行接口 (CLI), 可能对实现 stadio 方式的 MCP 有用：<https://v2.tauri.app/zh-cn/plugin/cli/>
- Upgrading your Tailwind CSS projects from v3 to v4: <https://tailwindcss.com/docs/upgrade-guide>
- Tailwind Responsive design: <https://tailwindcss.com/docs/responsive-design>
- Tailwind theme: <https://tailwindcss.com/docs/theme>
- Rough.js API: <https://github.com/rough-stuff/rough/wiki>
- Tauri App Icons 应用程序图标: <https://v2.tauri.app/zh-cn/develop/icons/>
- Tauri 插件和对应的功能列表：<https://v2.tauri.app/plugin/>

## OTHER CONSIDERATIONS

- Include the project structure in the README.
- 使用 Tailwind 的 @apply 指令复用样式；通过 CSS 变量 (`--primary-color`, `--secondary-color`) 实现主题色彩切换；在 HTML 根元素上切换主题类名
- 实现统一的渲染器接口 `TimerRenderer`，支持DOM、SVG、Canvas三种渲染方式；每种主题对应一种渲染方式；DOM/SVG渲染器通过CSS变量切换主题；Canvas渲染器通过JavaScript配置对象管理样式
- 基础结构样式（尺寸、布局、动画）放入公共CSS文件：`theme-common.css`；不同渲染器的基础样式分别管理：`dom-common.css`、`svg-common.css`、`canvas-common.css`；主题相关的颜色和视觉效果通过CSS变量和独立文件管理：`theme-{name}.css`
- **确保CSS样式不发生覆盖**，TypeScript代码中除Canvas渲染器外避免直接操作style属性
