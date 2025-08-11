# 移动端支持设置指南

本项目现已支持 Android 和 iOS 平台。以下是设置和使用指南：

## 🚀 快速开始

### 1. 初始化移动端环境

```bash
pnpm mobile:init
```

### 2. 开发模式

**Android 开发:**

```bash
pnpm tauri:android
```

**iOS 开发 (仅限 macOS):**

```bash
pnpm tauri:ios
```

### 3. 构建应用

**Android APK:**

```bash
pnpm tauri:android:build
```

**iOS IPA:**

```bash
pnpm tauri:ios:build
```

## 📋 前置要求

### Android 开发

- Android Studio
- Android SDK (API 24+)
- Java 17+

### iOS 开发 (仅限 macOS)

- Xcode 14+
- iOS 13.0+ 目标版本

## 🔧 项目特性

### 平台检测

项目包含了平台检测工具，可以在运行时识别当前平台：

```typescript
import { getCurrentPlatform, isMobile, isDesktop } from './src/utils/platform';

// 获取当前平台
const platform = await getCurrentPlatform(); // 'android' | 'ios' | 'windows' | 'macos' | 'linux'

// 检测设备类型
const mobile = await isMobile(); // boolean
const desktop = await isDesktop(); // boolean
```

### 平台特定功能

- 桌面端独有功能会自动在移动端禁用
- 移动端优化的 UI 和交互
- 响应式设计适配不同屏幕尺寸

### 样式适配

- 移动端友好的触摸目标尺寸
- iOS 安全区域适配
- 响应式布局

## 📱 移动端限制

某些功能在移动端不可用或受限：

- 文件系统访问受限
- 不支持多窗口
- 不支持系统托盘
- 某些插件可能不兼容

## 🛠 故障排除

### Android 常见问题

1. **SDK 路径问题**: 确保 `ANDROID_HOME` 环境变量正确设置
2. **权限问题**: 检查 `src-tauri/gen/android/app/src/main/AndroidManifest.xml`
3. **构建失败**: 尝试清理构建缓存 `./gradlew clean`

### iOS 常见问题

1. **签名问题**: 在 Xcode 中配置开发者账户和证书
2. **模拟器问题**: 确保 iOS 模拟器正在运行
3. **权限问题**: 检查 `src-tauri/gen/ios/Sources/[app-name]/Info.plist`

## 📚 更多资源

- [Tauri 移动端文档](https://tauri.app/develop/mobile/)
- [Android 开发指南](https://tauri.app/develop/mobile/android/)
- [iOS 开发指南](https://tauri.app/develop/mobile/ios/)
