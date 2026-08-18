# dsh-thinkmeter (ThinkMeter)

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) client plugin that replaces the streaming **Think** reasoning preview in the chat view with a **live token-count display**.

## What it does

While the model is thinking, the shipped UI streams the latest line of the reasoning text in the "Think" disclosure row. This plugin replaces that summary with a token counter:

| State | Display |
| --- | --- |
| Running | `Thinking ≈1,234 tokens` (with sweep animation) |
| Settled | `Think · 1,234 tokens` |

- Settled counts use the exact `usage.reasoningTokens` reported by the model when available; otherwise a heuristic estimate (CJK chars × 0.6 + other chars ÷ 4).
- Click the row to expand/collapse the full reasoning text.
- Keyboard accessible (`Enter` / `Space` toggles).

## How it works

The package is a proper DSH profile bundle:

- `cordis.patch.yml` — bundle patch inserting the `thinkmeter` plugin row (`dsh.bundle.patch` in package.json), so `dsh plugin add` reconciles it into the profile's layer list automatically.
- `index.js` — empty host half (pure UI plugin).
- `client.js` — browser bundle in the `window.__ModuleLoader__.load` format (`exports["./client"]`, declared via `dsh.client.platform: web`).

The Think row itself is embedded inside the shipped `assistant-step` chat-node renderer, with no dedicated extension slot. The browser half registers the same keyed entry (`conversation.chat.node`, key `assistant-step`) in the Cordis slot system, shadowing the shipped renderer with a lightweight one. When the plugin is removed, the shipped renderer is restored automatically.

> **Known trade-off:** while this plugin is active, plain assistant text blocks render as pre-wrapped plain text instead of full Markdown, because the dynamic/lightweight renderer cannot reuse the shipped Markdown components.

## Install

### Command (recommended)

Install directly from GitHub into your profile:

```bash
dsh plugin --profile web add https://github.com/dmz2922990/dsh-thinkmeter.git
```

Replace `web` with the profile you use (e.g. `tui`, `headless`). The command forwards to `pnpm add` inside the profile directory, so any pnpm-supported specifier works (git URL, tag, local path).

Upgrade / remove:

```bash
dsh plugin --profile web up dsh-thinkmeter
dsh plugin --profile web rm dsh-thinkmeter
```

> If your machine has no GitHub credentials configured for git-over-HTTPS, use the SSH form: `git+ssh://git@github.com/dmz2922990/dsh-thinkmeter.git`.

### Static composition

Clone the repo next to your DSH config, then add a row to your `cordis.yml` composition:

```yaml
plugins:
  - name: dsh-thinkmeter
    path: ../dsh-thinkmeter
```

Or once the package is published to a registry:

```yaml
plugins:
  - name: dsh-thinkmeter
```

## Development

Plain JavaScript, no build step:

```
src/index.js   # the Cordis client plugin (default export)
```

The same logic can also be pasted as a *dynamic* Cordis plugin (`cordis_define` client code) inside a running DSH session.

## License

MIT
