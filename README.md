# Tempus Ring

A beautiful, cross-platform Pomodoro timer built with Tauri 2.0. Features multiple themes, internationalization, system tray integration, and AI assistant support.

## 🎯 Objectives

Tempus Ring aims to enhance productivity and focus through:

- **Focus Enhancement**: Provide users with a scientifically-backed Pomodoro technique implementation to improve concentration and time management
- **Aesthetic Personalization**: Offer multiple visual themes to create a pleasant, personalized workspace that matches individual preferences
- **Cross-platform Accessibility**: Deliver consistent experience across desktop platforms (macOS, Windows, Linux) with future mobile support
- **Language Inclusivity**: Support multiple languages (English, Chinese Simplified/Traditional, Japanese) to serve diverse user communities
- **Developer Integration**: Enable AI assistants and development tools to interact with the timer through MCP (Model Context Protocol)
- **Seamless Workflow Integration**: Provide system-level integration (tray, notifications) for minimal workflow disruption

## ✨ Features

### Core Timer Functionality

- **Pomodoro Cycles**: 25-minute work sessions with automatic break transitions (5-minute short breaks, 15-30 minute long breaks)
- **Session Tracking**: Complete session history and productivity statistics
- **Flexible Configuration**: Customizable work/break durations and automation settings

### Visual & User Experience

- **6 Beautiful Themes**: Each with unique rendering approaches
  - **WabiSabi**: Hand-drawn, imperfect beauty (Canvas/Rough.js)
  - **Cloudlight**: Clean, modern, cloud-inspired (DOM)
  - **Dawn-Dusk**: Gradient transitions, time-aware colors (DOM)
  - **Nightfall**: Dark theme with constellation effects (DOM)
  - **Artistic Sketch**: Artistic, sketch-like appearance (Canvas)
  - **Hand-drawn**: Hand-drawn aesthetic with smooth SVG (SVG)
- **Runtime Theme Switching**: Change themes without restarting the application
- **Responsive Design**: Optimized for desktop with mobile-ready foundation

### System Integration

- **System Tray**: Background operation with quick controls
- **Native Notifications**: Desktop notifications at session completion
- **Cross-platform**: Native performance on macOS, Windows, Linux
- **Keyboard Shortcuts**: Quick timer control without mouse interaction

### Internationalization & AI

- **Multi-language**: English, 中文（简体）, 中文（繁體）, 日本語 with runtime switching
- **MCP Server**: AI assistant integration for voice control and automation
- **External Tool Integration**: API for productivity apps and development tools

## 🛠️ Technology Stack

### Frontend

- **TypeScript (Strict Mode)**: Type-safe development with comprehensive error checking
- **Vite**: Fast build tooling and hot module replacement
- **Tailwind CSS v4**: Modern utility-first CSS framework with CSS-first configuration
- **Lucide Icons**: Consistent, scalable icon system

### Backend & Desktop

- **Rust**: Memory-safe systems programming language
- **Tauri 2.0**: Secure, fast desktop application framework
- **System APIs**: Native system tray, notifications, and file system access

### Rendering Engines

- **DOM Renderer**: CSS transforms and transitions for clean themes
- **SVG Renderer**: Vector-based rendering with precise control
- **Canvas Renderer**: Pixel-perfect rendering with Rough.js for artistic themes
- **Rough.js**: Hand-drawn, sketchy graphics library

### Testing & Quality

- **Vitest**: Fast unit testing framework with ES modules support  
- **Playwright**: Reliable end-to-end testing across browsers
- **Biome**: Unified formatter, linter, and code quality tool
- **TypeScript Compiler**: Static type checking and validation

### Internationalization & Integration

- **Custom i18n System**: JSON-based translations with runtime switching
- **Model Context Protocol (MCP)**: AI assistant integration protocol
- **@modelcontextprotocol/sdk**: Official TypeScript SDK for MCP servers

### Architecture Patterns

- **Layered Architecture**: Strict dependency flow (types → services → factories → components)
- **Event-Driven Design**: Loose coupling through typed event emission
- **Factory Pattern**: Theme-to-renderer mapping and object creation
- **Dependency Injection**: Service composition without global state

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

## 🛠️ Development

```bash
# Development
pnpm tauri dev        # Start development
pnpm test             # Run tests
pnpm check:all        # Run all checks
```

**Guidelines**: TypeScript strict mode, conventional commits, <500 lines per file

## 🔌 MCP Server Integration

AI assistant control via Model Context Protocol:

```typescript
await mcp.call('timer.start', { duration: 1500 });
await mcp.call('timer.pause');
await mcp.call('theme.switch', { name: 'WabiSabi' });
```

Supports both stdio (local) and Streamable HTTP (remote) transports.

## 🏗️ Architecture

Built with a **layered architecture** approach:

- **Types Layer**: Shared TypeScript interfaces and enums
- **Services Layer**: Business logic (timer, theme, notifications, statistics)
- **Factories Layer**: Object creation and dependency injection
- **Components Layer**: UI components with pluggable theme renderers

**Key Design Patterns**: Event-driven services, pluggable renderers, strict dependency injection, type-safe Tauri commands.

## 📱 Platform Support

- **Desktop**: macOS, Windows, Linux (production ready)
- **Mobile**: Android, iOS (development ready via `pnpm tauri:android` / `pnpm tauri:ios`)
- **Web**: Browser support for development and testing

## 📊 Performance Metrics

- **Bundle Size**: ~250KB total
- **Memory Usage**: ~30-35MB runtime
- **Timer Accuracy**: ±50ms precision
- **Theme Switching**: <100ms transition time

## 🤝 Contributing

1. Fork and create feature branch
2. Follow TypeScript strict mode and conventional commits
3. Write tests and ensure `pnpm check:all` passes
4. Submit pull request

## 📄 License

GPL v3 License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Tauri 2.0, TypeScript, and modern web technologies.**
