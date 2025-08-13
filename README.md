# Tempus Ring

A beautiful, cross-platform Pomodoro timer application built with Tauri 2.0. Tempus Ring features multiple rendering themes, internationalization support, system tray integration, and MCP server capabilities for AI assistant integration.

> 🎯 **Status**: Production-ready desktop application with comprehensive timer functionality and theme system.

## ✨ Features

### Timer Functionality
- **25-minute work sessions** with 5-minute short breaks and 15-30 minute long breaks
- **Automatic transitions** between work and break cycles
- **Pause/resume support** with accurate time tracking
- **Session statistics** and productivity insights
- **Background operation** with system tray integration

### Multi-Theme Rendering
- **6 themed renderers**: WabiSabi (Canvas), Cloudlight (DOM), Dawn-Dusk (DOM), Nightfall (SVG), Artistic Sketch (Canvas), Hand-drawn (SVG)
- **3 renderer engines**: DOM-based, SVG-based, and Canvas-based with Rough.js
- **Runtime theme switching** without application restart
- **Responsive design** optimized for desktop and future mobile support

### Internationalization
- **4 languages supported**: English, Chinese (Simplified), Chinese (Traditional), Japanese
- **Runtime language switching** without restart
- **Complete localization** of UI text and notifications

### System Integration
- **System tray integration** for background operation
- **Desktop notifications** at session completion
- **Global keyboard shortcuts** for timer control
- **Cross-platform support**: macOS, Windows, Linux

### Developer Features
- **MCP server integration** for AI assistant control
- **RESTful API** for external tool integration
- **Export capabilities** for timer statistics
- **Extensible architecture** with clean separation of concerns

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+
- **Rust** 1.70+
- **System dependencies** for Tauri development

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/tempus-ring.git
cd tempus-ring

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

### Build for Production

```bash
# Build desktop application
pnpm tauri build

# Run all validation checks
pnpm check:all
```

## 🎨 Theme Gallery

Tempus Ring features 6 distinct themes, each using different rendering technologies:

| Theme | Renderer | Style |
|-------|----------|-------|
| **WabiSabi** | Canvas + Rough.js | Hand-drawn, imperfect beauty |
| **Cloudlight** | DOM + CSS | Clean, modern, cloud-inspired |
| **Dawn-Dusk** | DOM + CSS | Gradient transitions, time-aware |
| **Nightfall** | SVG | Dark theme with constellation effects |
| **Artistic Sketch** | Canvas + Rough.js | Artistic, sketch-like appearance |
| **Hand-drawn** | SVG | Hand-drawn aesthetic with smooth SVG |

Switch themes anytime via Settings → Theme selector.

## 🏗️ Architecture

### Frontend (TypeScript)

```
src/
├── components/          # UI components and renderers
│   ├── timer-display.ts        # Main timer UI
│   ├── control-panel.ts        # Start/pause/reset controls
│   ├── settings-panel.ts       # Configuration UI
│   └── renderers/              # Theme-specific renderers
│       ├── dom-renderer.ts     # DOM-based themes
│       ├── svg-renderer.ts     # SVG-based themes
│       └── canvas-renderer.ts  # Canvas + Rough.js themes
├── services/            # Business logic layer
│   ├── timer-service.ts        # Core timer state machine
│   ├── theme-manager.ts        # Theme switching logic
│   ├── notification-service.ts # Desktop notifications
│   ├── statistics-service.ts   # Session tracking
│   ├── mcp-server.ts          # MCP protocol server
│   └── storage-service.ts     # Data persistence
├── factories/
│   └── timer-factory.ts       # Renderer creation and caching
├── types/               # TypeScript interfaces
│   ├── timer-types.ts         # Timer state and config
│   ├── theme-types.ts         # Theme definitions
│   └── renderer-types.ts      # Renderer interface
├── i18n/               # Internationalization
│   ├── index.ts              # i18n system setup
│   └── locales/              # Translation files
└── styles/             # CSS and themes
    ├── global.css            # Global styles with Tailwind
    └── themes/               # Theme-specific stylesheets
```

### Backend (Rust)

```
src-tauri/src/
├── commands/           # Tauri commands (frontend-callable)
│   ├── timer.rs              # Timer control commands
│   ├── settings.rs           # Settings persistence
│   └── statistics.rs         # Statistics commands
├── services/           # Rust business logic
│   ├── timer_state.rs        # Timer state management
│   └── storage.rs            # File-based persistence
├── tray.rs            # System tray implementation
├── lib.rs             # Tauri app setup and configuration
└── main.rs            # Application entry point
```

### Design Principles

- **Layered Architecture**: `types → services → factories → components`
- **Dependency Injection**: Services are injected, not directly instantiated
- **Event-Driven**: State changes propagate via events
- **Theme Abstraction**: Renderer interface allows pluggable themes
- **No Direct DOM Manipulation**: CSS variables handle theme switching
- **Stable Canvas Animation**: Pre-generated Rough.js objects prevent jitter

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start frontend dev server
pnpm tauri dev        # Start full Tauri development

# Building
pnpm build            # Build frontend
pnpm tauri build      # Build desktop application

# Code Quality
pnpm type-check       # TypeScript checking
pnpm check            # Biome linting and formatting
pnpm format           # Auto-format code
pnpm rust:check       # Rust compilation check
pnpm rust:lint        # Rust clippy linting
pnpm check:all        # Run all checks

# Testing
pnpm test             # Run unit tests
pnpm test:coverage    # Test coverage report
```

### Development Guidelines

- **File Size Limit**: Keep files under 500 lines
- **TypeScript Strict**: No `any` types allowed
- **Conventional Commits**: Follow `type: description` format
- **Module System**: Use ESM imports/exports
- **Path Aliases**: Use `@/` for src imports
- **CSS-First**: Avoid inline styles, use CSS variables

### Testing

The project includes comprehensive test coverage:

- **Timer Service Tests**: State machine transitions and timing accuracy
- **Renderer Tests**: All three renderer types with mocking
- **Theme Manager Tests**: Theme switching and CSS variable management
- **Notification Tests**: Permission handling and notification display
- **MCP Server Tests**: Protocol compliance and command handling
- **Integration Tests**: Full timer cycles and persistence

Run tests with `pnpm test`.

## 🌍 Internationalization

Tempus Ring supports 4 languages with complete localization:

- **English** (`en`) - Default language
- **中文（简体）** (`zh-CN`) - Simplified Chinese
- **中文（繁體）** (`zh-TW`) - Traditional Chinese  
- **日本語** (`ja`) - Japanese

### Adding New Languages

1. Create translation file: `src/i18n/locales/{locale}.json`
2. Follow existing key structure (dot notation)
3. Test with `i18n.switchLanguage('{locale}')`
4. Verify all UI text translates correctly

## 🔌 MCP Integration

Tempus Ring includes an MCP (Model Context Protocol) server for AI assistant integration:

### Available Commands

```typescript
// Start a timer session
await mcp.call('timer.start', { duration: 1500 }); // 25 minutes

// Pause/resume timer
await mcp.call('timer.pause');
await mcp.call('timer.resume');

// Get current status
const status = await mcp.call('timer.status');

// Switch themes
await mcp.call('theme.switch', { name: 'WabiSabi' });

// Get statistics
const stats = await mcp.call('stats.get', { period: 'today' });
```

### Transport Support

- **stdio**: Local process communication
- **Streamable HTTP**: Remote API access
- **Session Management**: Cryptographically secure session IDs

## 📊 Performance

### Bundle Size
- **Main bundle**: ~180KB (gzipped)
- **Tauri chunk**: ~45KB (cached separately)
- **Vendor chunk**: ~25KB (Rough.js and utilities)
- **Total download**: ~250KB first load

### Runtime Performance
- **Memory usage**: ~30MB idle, ~35MB active
- **Timer accuracy**: ±50ms over 25-minute session
- **Theme switching**: <100ms transition time
- **Canvas rendering**: 60fps on modern hardware

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the established patterns in the codebase
4. Write tests for new functionality
5. Ensure all checks pass: `pnpm check:all`
6. Submit a pull request

### Code Standards

- **TypeScript**: Strict mode with comprehensive type checking
- **ESLint**: Follow project configuration
- **Conventional Commits**: Use semantic commit messages
- **Documentation**: Update README and code comments
- **Testing**: Maintain >90% test coverage

### Architecture Contributions

When adding new features:

1. **Study existing patterns** before implementing
2. **Follow the layered architecture** (types → services → factories → components)
3. **Use dependency injection** instead of direct imports
4. **Write tests first** when possible
5. **Keep files under 500 lines**

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tauri Team**: For the excellent cross-platform framework
- **Rough.js**: For hand-drawn Canvas rendering capabilities
- **Tailwind CSS**: For utility-first styling approach
- **TypeScript Team**: For robust type safety
- **Open Source Community**: For inspiration and best practices

---

**Built with ❤️ using Tauri 2.0, TypeScript, and modern web technologies.**