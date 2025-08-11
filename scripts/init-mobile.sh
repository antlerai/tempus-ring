#!/bin/bash

echo "🚀 初始化移动端开发环境..."

# 检查是否安装了 Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "❌ Tauri CLI 未安装，请先运行: pnpm install"
    exit 1
fi

echo "📱 初始化 Android 开发环境..."
tauri android init

echo "🍎 初始化 iOS 开发环境..."
tauri ios init

echo "✅ 移动端环境初始化完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. Android 开发:"
echo "   - 确保安装了 Android Studio 和 SDK"
echo "   - 运行: pnpm tauri:android"
echo ""
echo "2. iOS 开发 (仅限 macOS):"
echo "   - 确保安装了 Xcode"
echo "   - 运行: pnpm tauri:ios"
echo ""
echo "3. 构建应用:"
echo "   - Android: pnpm tauri:android:build"
echo "   - iOS: pnpm tauri:ios:build"