# 智能 Git 提交

我将分析你的代码变更并创建符合项目规范的提交信息。

**提交前质量检查:**
在提交前，我会先格式化代码，然后运行项目配置的检查：

1. **自动格式化**: `pnpm format` - 自动修复代码格式问题
2. **TypeScript 类型检查**: `pnpm type-check` - 验证类型正确性
3. **Biome 代码检查**: `pnpm check` - 代码质量和风格检查
4. **Rust 代码格式检查**: `pnpm rust:fmt:check` - Rust 代码格式验证
5. **Rust Clippy 检查**: `pnpm rust:lint` - Rust 代码质量检查

首先检查 Git 仓库状态和变更：

```bash
# 验证是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "错误: 不是 git 仓库"
    echo "此命令需要 git 版本控制"
    exit 1
fi

# 检查是否有变更需要提交
if ! git diff --cached --quiet || ! git diff --quiet; then
    echo "检测到变更:"
    git status --short
else
    echo "没有变更需要提交"
    exit 0
fi

# 显示详细变更
git diff --cached --stat
git diff --stat
```

我会分析变更以确定：

1. 修改了哪些文件
2. 变更的性质（功能、修复、重构等）
3. 影响的范围/组件

如果分析或提交遇到错误：

- 我会解释出了什么问题
- 建议如何解决
- 确保不会发生部分提交

```bash
# 如果没有暂存文件，我会暂存已修改的文件（不包括未跟踪的）
if git diff --cached --quiet; then
    echo "没有暂存文件。正在暂存已修改的文件..."
    git add -u
fi

# 显示将要提交的内容
git diff --cached --name-status
```

基于分析，我会创建符合 Conventional Commits 规范的提交信息：

**提交类型** (按重要性排序):

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档变更
- `style`: 代码样式变更（格式化、缺少分号等）
- `refactor`: 代码重构（不改变功能）
- `perf`: 性能改进
- `test`: 添加或更新测试
- `build`: 构建系统变更（webpack、vite 等）
- `ci`: CI 配置变更
- `chore`: 维护任务（依赖更新等）
- `revert`: 回滚之前的提交

**提交格式**:

```bash
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**项目特定的作用域示例**:

- `ui`: 用户界面组件
- `timer`: 番茄钟核心功能
- `settings`: 设置相关
- `tauri`: Tauri 后端相关
- `mobile`: 移动端相关
- `i18n`: 国际化
- `build`: 构建配置

**规则约束**:

- 标题最大长度: 100 字符
- 主题使用小写
- 主题不以句号结尾
- 正文和脚注每行最大 100 字符

```bash
# 我会使用分析的信息创建提交
# 示例: git commit -m "feat(timer): add pomodoro session tracking"
```

**提交信息语言要求**:

- **所有 Git 提交信息必须使用英文**
- 主题、正文和脚注都必须是英文
- 遵循国际化开发的最佳实践
- 确保团队协作和开源项目的可读性

提交信息将简洁、有意义，并严格遵循项目的 commitlint 配置。

**重要**: 我绝不会：

- 添加 "Co-authored-by" 或任何 Claude 签名
- 包含 "Generated with Claude Code" 或类似信息
- 修改 git 配置或用户凭据
- 添加任何 AI/助手归属到提交中
- 在提交、PR 或 git 相关内容中使用表情符号
- **使用中文或其他非英文语言编写提交信息**

提交将仅使用你现有的 git 用户配置，保持提交的完全所有权和真实性。
