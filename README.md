# Tempus Ring

A beautiful, cross-platform Pomodoro timer built with Tauri 2.0. Features multiple themes, internationalization, system tray integration, and AI assistant support.

## ✨ Features

- **Pomodoro Timer**: 25-minute work sessions with automatic break transitions
- **6 Beautiful Themes**: WabiSabi, Cloudlight, Dawn-Dusk, Nightfall, Artistic Sketch, Hand-drawn
- **Multi-language**: English, Chinese (Simplified/Traditional), Japanese
- **System Integration**: Tray icon, notifications, keyboard shortcuts
- **Cross-platform**: macOS, Windows, Linux
- **AI Integration**: MCP server for assistant control

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/tempus-ring.git
cd tempus-ring
pnpm install

# Development
pnpm tauri dev

# Build
pnpm tauri build
```

**Requirements**: Node.js 18+, pnpm 8+, Rust 1.70+

## 🎨 Themes

- **WabiSabi**: Hand-drawn, imperfect beauty
- **Cloudlight**: Clean, modern, cloud-inspired  
- **Dawn-Dusk**: Gradient transitions, time-aware
- **Nightfall**: Dark theme with constellation effects
- **Artistic Sketch**: Artistic, sketch-like appearance
- **Hand-drawn**: Hand-drawn aesthetic with smooth SVG

## 🏗️ Architecture

Built with layered architecture: TypeScript frontend + Rust backend via Tauri.

- **Frontend**: Components, services, theme renderers, i18n
- **Backend**: Timer state, system tray, storage, notifications
- **Design**: Event-driven, dependency injection, pluggable themes

## 🛠️ Development

```bash
# Development
pnpm tauri dev        # Start development
pnpm test             # Run tests
pnpm check:all        # Run all checks
```

**Guidelines**: TypeScript strict mode, conventional commits, <500 lines per file

## 🌍 Languages

Supports English, 中文（简体）, 中文（繁體）, 日本語 with runtime switching.

## 🔌 AI Integration

MCP server for AI assistant control:

```typescript
await mcp.call('timer.start', { duration: 1500 });
await mcp.call('timer.pause');
await mcp.call('theme.switch', { name: 'WabiSabi' });
```

## 📊 Performance

- **Bundle**: ~250KB total
- **Memory**: ~30-35MB
- **Timer accuracy**: ±50ms
- **Theme switching**: <100ms

## 🤝 Contributing

1. Fork and create feature branch
2. Follow TypeScript strict mode and conventional commits
3. Write tests and ensure `pnpm check:all` passes
4. Submit pull request

## 📄 License

GPL v3 License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Tauri 2.0, TypeScript, and modern web technologies.**
