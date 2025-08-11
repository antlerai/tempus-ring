# 移动端开发环境设置指南

## 🎯 当前状态

✅ **已完成**：
- 项目已配置移动端支持
- 平台检测功能已实现
- 响应式设计已添加
- 桌面端正常工作

⚠️ **需要设置**：
- Android 开发环境
- iOS 开发环境（仅限 macOS）

## 📱 Android 开发环境设置

### 1. 安装 Android Studio
下载并安装 [Android Studio](https://developer.android.com/studio)

### 2. 设置环境变量
在你的 shell 配置文件中添加（`~/.zshrc` 或 `~/.bash_profile`）：

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### 3. 重新加载环境变量
```bash
source ~/.zshrc
```

### 4. 验证安装
```bash
pnpm mobile:check
```

### 5. 初始化 Android 项目
```bash
tauri android init
```

### 6. 运行 Android 开发
```bash
pnpm tauri:android
```

## 🍎 iOS 开发环境设置（仅限 macOS）

### 1. 安装 Xcode
从 App Store 安装 Xcode

### 2. 安装 CocoaPods
```bash
sudo gem install cocoapods
```

### 3. 初始化 iOS 项目
```bash
tauri ios init
```

### 4. 运行 iOS 开发
```bash
pnpm tauri:ios
```

## 🚀 快速测试（桌面端）

如果你想先测试平台检测功能，可以在桌面端运行：

```bash
pnpm tauri:dev
```

应用会显示：
- 当前运行平台（macOS/Windows/Linux）
- 设备类型（桌面端）
- 可用功能列表

## 📋 可用脚本

```bash
# 检查移动端环境
pnpm mobile:check

# 初始化移动端项目（需要先设置环境）
pnpm mobile:init

# 桌面端开发
pnpm tauri:dev

# Android 开发（需要先设置环境）
pnpm tauri:android

# iOS 开发（需要先设置环境，仅限 macOS）
pnpm tauri:ios

# 构建
pnpm tauri:build              # 桌面端
pnpm tauri:android:build      # Android
pnpm tauri:ios:build          # iOS
```

## 🔧 项目特性

### 平台检测
```typescript
import { getCurrentPlatform, isMobile } from './src/utils/platform';

const platform = await getCurrentPlatform();
const mobile = await isMobile();
```

### 响应式设计
- 自动适配移动端和桌面端
- 触摸友好的按钮尺寸
- iOS 安全区域支持

### 条件功能
- 桌面端独有功能自动在移动端禁用
- 平台特定的 UI 组件

## 🛠 故障排除

### 常见问题

1. **ANDROID_HOME 未设置**
   - 确保安装了 Android Studio
   - 正确设置环境变量
   - 重启终端

2. **CocoaPods 安装失败**
   - 使用 `sudo gem install cocoapods`
   - 或使用 Homebrew: `brew install cocoapods`

3. **Xcode 命令行工具问题**
   - 运行 `xcode-select --install`
   - 确保 Xcode 已完全安装

### 获取帮助

- [Tauri 移动端文档](https://tauri.app/develop/mobile/)
- [Android 开发指南](https://tauri.app/develop/mobile/android/)
- [iOS 开发指南](https://tauri.app/develop/mobile/ios/)

---

**注意**：移动端开发需要额外的环境配置。如果你只需要桌面端功能，可以直接使用 `pnpm tauri:dev` 开始开发。