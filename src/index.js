/**
 * dsh-thinkmeter — DSH client plugin (ThinkMeter)
 *
 * Replaces the streaming "Think" reasoning preview row in the chat view with a
 * live token-count display:
 *   - running:  `思考中 · ≈1,234 tokens` (with sweep animation)
 *   - settled:  `Think · 1,234 tokens` (uses exact `usage.reasoningTokens`
 *               when the model reports it, otherwise an estimate)
 *   - click the row to expand/collapse the full reasoning text
 *
 * Implementation: shadows the shipped `assistant-step` renderer of the
 * `conversation.chat.node` keyed slot with a lightweight renderer. When this
 * plugin stops, the shipped renderer is restored automatically.
 */

import React from 'react'

const CSS_ID = 'dsh-thinkmeter-style'
const CSS = [
  '.tkcnt-root{display:flex;flex-direction:column;font-size:16px;line-height:28px;color:var(--dsw-alias-label-primary)}',
  '.tkcnt-text{white-space:pre-wrap;word-break:break-word}',
  '.tkcnt-stopped{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-tertiary);border-radius:6px;align-self:flex-start;padding:0 6px;font-size:11px;line-height:18px}',
  '.tkcnt-think{display:flex;flex-direction:column}',
  '.tkcnt-row{display:flex;align-items:center;gap:8px;min-height:24px;font-size:14px;line-height:24px;cursor:pointer;user-select:none;position:relative;overflow:hidden}',
  '.tkcnt-row[data-state=running]:after{content:"";position:absolute;inset-block:0;left:0;width:300px;pointer-events:none;background:linear-gradient(90deg,transparent 0%,color-mix(in srgb,var(--dsw-alias-bg-base) 60%,transparent) 55%,transparent 100%);animation:tkcnt-sweep 2.6s ease-out infinite}',
  '@keyframes tkcnt-sweep{0%{left:-300px}90%,to{left:100%}}',
  '.tkcnt-chevron{color:var(--dsw-alias-label-secondary);flex-shrink:0;width:14px;text-align:center;transition:transform .15s ease}',
  '.tkcnt-chevron[data-open]{transform:rotate(90deg)}',
  '.tkcnt-title{font-weight:400}',
  '.tkcnt-summary{color:var(--dsw-alias-label-tertiary);min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:auto}',
  '.tkcnt-body{color:var(--dsw-alias-label-tertiary);white-space:pre-wrap;word-break:break-word;padding:4px 0 4px 22px;font-size:14px;line-height:24px}',
  '@media (prefers-reduced-motion:reduce){.tkcnt-row[data-state=running]:after{animation:none}}',
].join('\n')

function insertStyle() {
  if (typeof document === 'undefined') return () => {}
  if (document.getElementById(CSS_ID) !== null) return () => {}
  const tag = document.createElement('style')
  tag.id = CSS_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
  return () => {
    if (tag.parentNode !== null) tag.parentNode.removeChild(tag)
  }
}

/** Rough token estimate: CJK chars ≈ 0.6 token each, others ≈ 1 token / 4 chars. */
function estimateTokens(text) {
  let cjk = 0
  let other = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)
    if (code > 0xffff) i++
    if (
      (code >= 0x3400 && code <= 0x9fff) ||
      (code >= 0x3040 && code <= 0x30ff) ||
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0x3000 && code <= 0x303f)
    ) {
      cjk++
    } else {
      other++
    }
  }
  return Math.max(1, Math.round(cjk * 0.6 + other / 4))
}

function fmt(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function ThinkRow({ text, running, usage }) {
  const [isOpen, setOpen] = React.useState(false)
  const exact =
    typeof usage === 'object' && usage !== null && typeof usage.reasoningTokens === 'number'
      ? usage.reasoningTokens
      : undefined
  const count = exact !== undefined ? exact : estimateTokens(text)
  const label = running
    ? `思考中 · ${exact !== undefined ? fmt(exact) : '≈' + fmt(count)} tokens`
    : `Think · ${fmt(count)} tokens`
  return React.createElement(
    'div',
    { className: 'tkcnt-think' },
    React.createElement(
      'div',
      {
        className: 'tkcnt-row',
        'data-state': running ? 'running' : 'ok',
        role: 'button',
        tabIndex: 0,
        onClick: () => setOpen((v) => !v),
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          }
        },
      },
      React.createElement('span', { className: 'tkcnt-chevron', 'data-open': isOpen || undefined }, '▸'),
      React.createElement('span', { className: 'tkcnt-title' }, 'Think'),
      React.createElement('span', { className: 'tkcnt-summary' }, label),
    ),
    isOpen ? React.createElement('div', { className: 'tkcnt-body' }, text) : null,
  )
}

/** Lightweight shadow of the shipped `assistant-step` chat node renderer. */
function AssistantStep({ node }) {
  const data = node?.data
  if (data === undefined || data === null) return null
  const blocks = Array.isArray(data.blocks) ? data.blocks : []
  const running = data.status === 'running'
  const last = blocks.length - 1
  const children = []
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (block === undefined || block === null) continue
    if (block.kind === 'reasoning') {
      children.push(
        React.createElement(ThinkRow, {
          key: 'r' + i,
          text: typeof block.text === 'string' ? block.text : '',
          running: running && i === last,
          usage: data.usage,
        }),
      )
    } else if (block.kind === 'text') {
      children.push(
        React.createElement(
          'div',
          { key: 't' + i, className: 'tkcnt-text' },
          typeof block.text === 'string' ? block.text : '',
        ),
      )
    }
  }
  if (data.status === 'interrupted') {
    children.push(React.createElement('span', { key: 'stopped', className: 'tkcnt-stopped' }, 'Stopped'))
  }
  return React.createElement('div', { className: 'tkcnt-root', 'data-streaming': running || undefined }, children)
}

export const client = {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    const disposeStyle = insertStyle()
    const disposeInject = slots.inject('conversation.chat.node', () =>
      slots.register({ name: 'conversation.chat.node', key: 'assistant-step' }, AssistantStep),
    )
    ctx.effect(() => () => {
      try {
        disposeInject?.()
      } catch {}
      try {
        disposeStyle()
      } catch {}
    })
  },
}

export default client
