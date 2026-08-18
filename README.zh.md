# dsh-thinkmeter（ThinkMeter）

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）客户端插件：将聊天视图中流式的 **Think** 思考预览替换为 **实时 Token 数量显示**。

## 功能

模型思考时，官方 UI 会在 "Think" 折叠行中滚动显示最新的思考文本。本插件将该摘要替换为 Token 计数：

| 状态 | 显示 |
| --- | --- |
| 生成中 | `思考中 · ≈1,234 tokens`（带扫光动画） |
| 已结束 | `Think · 1,234 tokens` |

- 结束后的数量优先使用模型上报的精确 `usage.reasoningTokens`；否则使用启发式估算（CJK 字符 × 0.6 + 其他字符 ÷ 4）。
- 点击该行可展开/收起完整思考原文，支持键盘操作（`Enter` / `Space`）。

## 实现原理

Think 行内嵌于官方 `assistant-step` 聊天节点渲染器，没有独立扩展 Slot。本插件在 Cordis Slot 系统中注册相同的 keyed 条目（`conversation.chat.node`，key 为 `assistant-step`），以轻量渲染器影子化（shadow）官方渲染器。插件停止或移除后，官方渲染器自动恢复。

> **已知取舍**：插件生效期间，普通回复文本块以纯文本（pre-wrap）渲染，而非完整 Markdown，因为轻量渲染器无法复用官方 Markdown 组件。

## 安装（静态组合）

将仓库克隆到 DSH 配置旁边，然后在 `cordis.yml` 组合中添加一行：

```yaml
plugins:
  - name: dsh-thinkmeter
    path: ../dsh-thinkmeter
```

发布到 registry 后也可以直接：

```yaml
plugins:
  - name: dsh-thinkmeter
```

## 开发

纯 JavaScript，无需构建：

```
src/index.js   # Cordis 客户端插件（default export）
```

相同逻辑也可以作为动态 Cordis 插件（`cordis_define` 的 client 代码）粘贴到运行中的 DSH 会话。

## 许可

MIT
