#!/bin/bash

echo "🔍 检查移动端开发环境..."

# 检查 Android 环境
echo ""
echo "📱 Android 环境检查:"
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME 环境变量未设置"
    echo "💡 请安装 Android Studio 并设置环境变量:"
    echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
else
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
    if [ -d "$ANDROID_HOME" ]; then
        echo "✅ Android SDK 目录存在"
    else
        echo "❌ Android SDK 目录不存在"
    fi
fi

# 检查 iOS 环境 (仅限 macOS)
echo ""
echo "🍎 iOS 环境检查:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # 检查 Xcode
    if command -v xcodebuild &> /dev/null; then
        echo "✅ Xcode 已安装: $(xcodebuild -version | head -n1)"
    else
        echo "❌ Xcode 未安装"
        echo "💡 请从 App Store 安装 Xcode"
    fi
    
    # 检查 CocoaPods
    if command -v pod &> /dev/null; then
        echo "✅ CocoaPods 已安装: $(pod --version)"
    else
        echo "❌ CocoaPods 未安装"
        echo "💡 安装 CocoaPods:"
        echo "   sudo gem install cocoapods"
    fi
else
    echo "ℹ️  iOS 开发仅支持 macOS"
fi

# 检查 Rust 工具链
echo ""
echo "🦀 Rust 环境检查:"
if command -v rustc &> /dev/null; then
    echo "✅ Rust 已安装: $(rustc --version)"
else
    echo "❌ Rust 未安装"
fi

if command -v cargo &> /dev/null; then
    echo "✅ Cargo 已安装: $(cargo --version)"
else
    echo "❌ Cargo 未安装"
fi

# 检查 Tauri CLI
echo ""
echo "⚡ Tauri CLI 检查:"
if command -v tauri &> /dev/null; then
    echo "✅ Tauri CLI 已安装: $(tauri --version)"
else
    echo "❌ Tauri CLI 未安装"
    echo "💡 安装 Tauri CLI: pnpm install"
fi

echo ""
echo "🎯 环境检查完成！"