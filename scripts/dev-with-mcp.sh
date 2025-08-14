#!/bin/bash

# Tempus Ring 开发环境启动脚本 (带 MCP 支持)
# 自动清理可能存在的旧 socket 文件

echo "🧹 清理旧的 MCP socket 文件..."
rm -f /tmp/tempus-ring-mcp.sock

echo "🚀 启动 Tempus Ring 开发环境 (启用 MCP 支持)..."
pnpm tauri:dev:mcp