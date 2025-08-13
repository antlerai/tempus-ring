# 上下文工程模板 V2.1

一个全面的模板，帮助你开始使用上下文工程 - 这是为 AI 编程助手设计上下文的学科，使它们拥有端到端完成工作所需的信息。这个 V2.1 版本集成了**人机协作审查**、**迭代修正**、**Git 工作流**和**状态管理系统**。

## 🆕 V2.1 新特性

- **状态持久化**：PRP 执行进度自动保存，支持断点续传
- **任务级跟踪**：每个任务完成状态独立记录和管理
- **自动Git集成**：遵循 commitlint 规范的自动提交和标签
- **智能恢复**：中断后可精确恢复到任意检查点
- **进度可视化**：实时查看执行状态和完成进度

## 🚀 增强型开发流程（V2.1）

```bash
# 1. 构思功能
# 编辑 PRPs/INSTALL.md (或新建文件) 来描述你的功能需求。

# 2. 生成实施计划 (PRP)
# 这会自动创建一个新的 git feature 分支，并生成带编号任务的 PRP。
/generate-prp PRPs/INSTALL.md

# 3. 【人类审查】审查并优化 PRP
# AI 生成的 PRP.md 文件需要你的审查。
# 如果不完美，可以在文件中添加评论或直接修改。
# 然后运行：
/refine-prp PRPs/tempus-ring-implementation.md

# 4. 执行实施计划（带状态管理）
# 一旦你对 PRP 满意，让 AI 开始编码。
# 系统会自动创建 .state 文件跟踪进度，每个任务完成后自动提交。
/execute-prp PRPs/tempus-ring-implementation.md

# 4a. 【可选】监控执行进度
# 随时查看当前执行状态和进度
/prp-status PRPs/tempus-ring-implementation.md

# 4b. 【中断恢复】从断点继续
# 如果执行被中断，可以精确恢复到上次的检查点
/prp-resume PRPs/tempus-ring-implementation.md

# 5. 【人类审查】审查代码并进行迭代修正
# AI 完成后，审查实现的代码。对于小调整，使用 /refine 命令。
# 例如:
/refine "将主按钮的背景色改为蓝色"

# 6. 完成
# 在 git 中审查你的 feature 分支，然后通过 Pull Request 合并。
# 所有任务都有对应的提交记录和标签，便于代码审查。
```

## 🔄 状态管理工作流

```bash
# 查看执行状态
/prp-status PRPs/feature.md
# 输出: "4/20 tasks completed (20%) - Task 5 in progress"

# 从中断点恢复
/prp-resume PRPs/feature.md
# 输出: "Resuming from Task 5: Create Main Application"

# 重置执行状态（如果需要重新开始）
/prp-reset PRPs/feature.md
# 提供多种重置选项：软重置、硬重置、回滚重置
```

## 什么是上下文工程？

上下文工程代表了从传统提示工程的范式转变：

### 提示工程 vs 上下文工程

**提示工程：**

- 专注于巧妙的措辞和特定的表达
- 局限于你如何表达任务
- 就像给某人一张便利贴

**上下文工程：**

- 提供全面上下文的完整系统
- 包括文档、示例、规则、模式和验证
- 就像编写一个包含所有细节的完整剧本

### 为什么上下文工程很重要

1. **减少 AI 失败**：大多数智能体失败不是模型失败 - 而是上下文失败
2. **确保一致性**：AI 遵循你的项目模式和约定
3. **支持复杂功能**：AI 可以通过适当的上下文处理多步骤实现
4. **自我纠正与迭代**：验证循环和修正命令允许 AI 修复自己的错误并进行迭代改进。

## 分步指南

### 1. 设置全局规则 (`CLAUDE.md`)

`CLAUDE.md` 文件包含 AI 助手在每次对话中都会遵循的项目范围规则。确保它与你的工作流程保持同步。

### 2. 创建初始功能请求 (`PRPs/INSTALL.md`)

清晰地描述你想要构建的功能、需求、并提供相关示例和文档链接。

### 3. 生成并审查 PRP

运行 `/generate-prp` 命令。这会启动两个过程：

1. **Git 分支**: 创建一个 `feature/...` 分支来隔离本次开发。
2. **PRP 生成**: AI 会研究代码库和外部文档，生成一个详尽的 `.md` 实施计划。

**这是第一个关键的人类介入点**。你必须审查这个计划。如果计划有偏差，使用 `/refine-prp` 命令让 AI 根据你的反馈进行修正，直到计划完美为止。

### 4. 执行 PRP（增强版）

在你确认计划无误后，运行 `/execute-prp`。AI 将会：

1. **创建状态文件**：自动生成 `.state` 文件跟踪执行进度
2. **任务级执行**：按编号顺序执行每个任务
3. **自动提交**：每完成一个任务自动创建符合 commitlint 规范的提交
4. **创建检查点**：为每个任务创建 Git 标签（`prp-task-N`）
5. **状态更新**：实时更新执行状态和进度信息
6. **错误处理**：失败任务会被标记，可单独修复后继续

**自动Git提交示例**：

```bash
feat: task 1 - implement timer state machine
test: task 2 - add timer service unit tests  
style: task 9 - add theme css files and variables
```

### 5. 审查并迭代修正

**这是第二个关键的人类介入点**。当 AI 完成任务后，审查实现的代码。对于那些在 PRP 中难以描述的细微调整（比如UI的"感觉"），使用新的 `/refine` 命令进行快速迭代。

这个命令非常适合小范围、目标明确的修改，避免了重新生成和执行整个 PRP 的沉重开销。

### 6. 合并代码

所有开发都在独立的 feature 分支上进行。当你对最终结果满意时，遵循标准的开发实践，通过创建一个 Pull Request (PR) 来审查和合并你的代码。

## 命令参考

### 核心命令

- **`/generate-prp`**: 生成带编号任务的 PRP 实施计划
- **`/execute-prp`**: 执行 PRP 并自动管理状态和 Git 提交
- **`/refine-prp`**: 根据你的反馈和评论，优化一个已存在的 PRP 文件
- **`/refine`**: 在编码完成后，根据你的自然语言指令，进行小范围、迭代式的代码修正

### 状态管理命令（V2.1 新增）

- **`/prp-status`**: 查看 PRP 执行状态和进度
- **`/prp-resume`**: 从中断点恢复 PRP 执行
- **`/prp-reset`**: 重置 PRP 执行状态（支持多种重置选项）

### 质量管理命令（V2.1 增强）

- **`/prp-check`**: 检查 PRP 质量和执行准备度
- **`/prp-validate`**: 验证状态文件与 Git 历史的一致性
- **`/prp-list`**: 列出所有 PRP 及其状态概览

### 使用示例

```bash
# 完整工作流（增强版）
/generate-prp PRPs/INSTALL.md        # 生成PRP
/prp-check PRPs/feature.md           # 质量检查
/prp-status PRPs/feature.md          # 检查状态
/execute-prp PRPs/feature.md         # 开始执行
# ... 如果中断 ...
/prp-validate PRPs/feature.md        # 验证一致性
/prp-resume PRPs/feature.md          # 恢复执行
/prp-status PRPs/feature.md          # 查看最终状态

# 项目管理工作流
/prp-list                            # 查看所有PRP概览
/prp-list --active                   # 查看活跃的PRP
/prp-validate PRPs/feature.md --fix  # 修复状态问题
```

## 核心价值主张

上下文工程 V2.1 通过以下方式革命性地改进了 AI 辅助开发：

- **消除进度丢失**：状态持久化确保任何中断都不会丢失工作
- **提高开发效率**：任务级跟踪和自动化 Git 集成
- **降低项目风险**：多层次的错误恢复和回滚机制
- **标准化流程**：自动遵循最佳实践和代码规范

## 状态管理系统详解

### 状态文件结构

每个 PRP 执行都会创建对应的 `.state` 文件：

```json
{
  "prpFile": "tempus-ring-implementation.md",
  "startedAt": "2025-01-13T10:00:00Z",
  "lastUpdated": "2025-01-13T11:30:00Z",
  "currentTask": 5,
  "completedTasks": [1, 2, 3, 4],
  "failedTasks": [],
  "lastCommit": "abc123def",
  "taskStatus": {
    "1": {
      "status": "completed",
      "completedAt": "2025-01-13T10:15:00Z",
      "commit": "abc123"
    }
  }
}
```

### Git 集成特性

- **自动提交**：遵循 commitlint 规范，每个任务完成后自动提交
- **检查点标签**：`prp-task-1`, `prp-task-2` 等，便于回滚
- **完成标签**：`prp-complete-{timestamp}` 标记整个 PRP 完成
- **历史追踪**：完整的任务级提交历史，便于代码审查

### 错误恢复机制

1. **任务级恢复**：失败的任务可以单独修复和重试
2. **检查点回滚**：可以回滚到任意已完成的任务
3. **状态重建**：从 Git 标签历史重建丢失的状态文件
4. **多种重置选项**：软重置、硬重置、回滚重置

## 最佳实践

### 开发流程建议

1. **小步快跑**：将大功能拆分为多个小 PRP，降低复杂性
2. **及时检查**：定期使用 `/prp-status` 监控进度
3. **保存检查点**：重要节点手动创建额外的 Git 标签
4. **测试驱动**：确保每个功能都有对应的测试任务

### 故障处理策略

1. **状态不一致**：使用 `/prp-reset --rollback=N` 回到已知良好状态
2. **执行中断**：使用 `/prp-resume` 从断点继续，而不是重新开始
3. **任务失败**：查看状态文件中的错误信息，修复后继续
4. **Git 冲突**：手动解决冲突后更新状态文件

## 实际使用场景

### 场景1：大型功能开发

```bash
# 开始一个复杂的20任务PRP
/execute-prp PRPs/complex-feature.md

# 执行到第8个任务时需要暂停去开会
# 系统自动保存状态到 complex-feature.state

# 2小时后回来继续
/prp-status PRPs/complex-feature.md
# 输出: "8/20 tasks completed (40%) - Ready to resume"

/prp-resume PRPs/complex-feature.md
# 从第9个任务继续执行
```

### 场景2：任务执行失败

```bash
# 执行过程中第12个任务失败
/prp-status PRPs/feature.md
# 输出: "11/20 completed, Task 12 failed: TypeScript compilation error"

# 手动修复代码问题
# 然后恢复执行
/prp-resume PRPs/feature.md
# AI会重新尝试第12个任务
```

### 场景3：需要回滚到之前状态

```bash
# 发现第15个任务的实现有问题，需要回滚到第12个任务
/prp-reset PRPs/feature.md --rollback=12

# 系统回滚到第12个任务的状态
# 可以重新从第13个任务开始
/prp-resume PRPs/feature.md
```

## V2.1 升级指南

### 从 V2.0 升级到 V2.1

如果你已经在使用 V2.0 版本，升级到 V2.1 很简单：

1. **更新命令文件**：新的 `/execute-prp`, `/prp-status`, `/prp-resume`, `/prp-reset` 命令
2. **现有PRP兼容**：V2.0 的 PRP 文件完全兼容，只需要确保任务是编号格式
3. **Git历史保留**：所有现有的 Git 提交和分支都会保留

### 迁移现有项目

```bash
# 对于正在进行的项目，可以手动创建状态文件
/prp-status PRPs/existing-feature.md
# 如果没有状态文件，系统会提示创建

# 或者重置并重新开始（推荐）
/prp-reset PRPs/existing-feature.md --soft
/execute-prp PRPs/existing-feature.md
```

## 结论（V2.1 增强版）

通过这个集成了"人机协作审查"、"迭代修正"和"状态管理"的增强流程，你将获得：

### 核心优势

- **可靠性**：执行进度持久化，不再因中断丢失工作
- **可追溯性**：完整的任务级 Git 历史和状态记录
- **可恢复性**：任意检查点的精确恢复能力
- **可视化**：实时进度监控和状态查看
- **标准化**：自动遵循 commitlint 规范的提交信息

### 适用场景

- **大型功能开发**：20+ 任务的复杂 PRP 实施
- **团队协作**：多人可以查看和接手 PRP 执行状态
- **长期项目**：跨天、跨周的开发项目
- **实验性开发**：需要频繁回滚和重试的探索性开发

### 与传统开发的对比

| 传统开发 | 上下文工程 V2.1 |
|---------|----------------|
| 手动任务跟踪 | 自动状态管理 |
| 容易丢失进度 | 断点续传 |
| 提交信息不规范 | 自动 commitlint 规范 |
| 难以回滚到特定状态 | 任务级检查点 |
| 缺少执行可视化 | 实时进度监控 |

这创建了一个既高效又稳健的 AI 辅助开发模式，特别适合大型、复杂的功能开发项目。V2.1 版本解决了 V2.0 中进度丢失的关键问题，使得上下文工程真正成为可靠的企业级开发流程。
