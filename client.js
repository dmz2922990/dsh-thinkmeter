/**
 * Browser bundle for dsh-thinkmeter, in the DSH client module format:
 * `window.__ModuleLoader__.load({ id, factory })` with `require("react")`.
 * The kernel adopts `module.exports` (an object with `apply`) as the plugin.
 *
 * Features:
 *  1. ThinkMeter — the streaming "Think" reasoning preview becomes a live
 *     token-count display (shadows the shipped assistant-step renderer).
 *  2. Collapse tool calls — optional (Settings → General): consecutive
 *     tool-call rows collapse into one group box showing the call count
 *     (shadows the shipped tool-call renderer only while enabled).
 */

window.__ModuleLoader__.load({
	id: "dsh-thinkmeter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		const React = react;

		var CSS_ID = "dsh-thinkmeter-style";
		var CSS = [
			// think meter
			".tkcnt-root{display:flex;flex-direction:column;font-size:16px;line-height:28px;color:var(--dsw-alias-label-primary)}",
			".tkcnt-text{white-space:pre-wrap;word-break:break-word}",
			".tkcnt-stopped{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-tertiary);border-radius:6px;align-self:flex-start;padding:0 6px;font-size:11px;line-height:18px}",
			".tkcnt-think{display:flex;flex-direction:column}",
			".tkcnt-think[data-open]{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:8px 12px 4px;background:var(--dsw-alias-bg-base);margin:4px 0 4px 4px}",
			".tkcnt-row{display:flex;align-items:center;gap:8px;min-height:24px;font-size:14px;line-height:24px;cursor:pointer;user-select:none;position:relative;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:4px 12px;background:var(--dsw-alias-bg-base);margin:4px 0 4px 4px;width:fit-content;min-width:180px}",
			".tkcnt-think[data-open] .tkcnt-row{border:none;border-radius:0;padding:0 0 6px;margin:0;background:transparent;min-width:0}",
			'.tkcnt-row[data-state=running]:after{content:"";position:absolute;inset-block:0;left:0;width:300px;pointer-events:none;background:linear-gradient(90deg,transparent 0%,color-mix(in srgb,var(--dsw-alias-bg-base) 60%,transparent) 55%,transparent 100%);animation:tkcnt-sweep 2.6s ease-out infinite}',
			"@keyframes tkcnt-sweep{0%{left:-300px}90%,to{left:100%}}",
			".tkcnt-chevron{color:var(--dsw-alias-label-secondary);flex-shrink:0;width:14px;text-align:center;transition:transform .15s ease}",
			".tkcnt-chevron[data-open]{transform:rotate(90deg)}",
			".tkcnt-title{font-weight:400}",
			".tkcnt-summary{color:var(--dsw-alias-label-tertiary);min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:auto}",
			".tkcnt-body{color:var(--dsw-alias-label-tertiary);white-space:pre-wrap;word-break:break-word;padding:4px 0 4px 22px;font-size:14px;line-height:24px}",
			"@media (prefers-reduced-motion:reduce){.tkcnt-row[data-state=running]:after{animation:none}}",
			// settings row
			".tkset-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0}",
			".tkset-info{min-width:0}",
			".tkset-label{font-size:14px;line-height:22px}",
			".tkset-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin-top:2px}",
			".tkset-toggle{flex-shrink:0;width:36px;height:20px;border-radius:10px;border:none;cursor:pointer;position:relative;background:var(--dsw-alias-interactive-bg-hover);transition:background .15s ease;padding:0}",
			".tkset-toggle.is-on{background:var(--dsw-alias-state-success-primary,#3ba272)}",
			".tkset-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:8px;background:var(--dsw-alias-bg-base,#fff);transition:left .15s ease}",
			".tkset-toggle.is-on .tkset-knob{left:18px}",
			// tool call group
			".tkgrp-root{display:flex;flex-direction:column}",
			".tkgrp-root[data-open]{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:8px 12px 4px;background:var(--dsw-alias-bg-base);margin:4px 0 4px 4px}",
			".tkgrp-card{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:8px 12px 4px;background:var(--dsw-alias-bg-base);margin:4px 0 4px 4px}",
			".tkgrp-card .tkgrp-row{border:none;border-radius:0;padding:0 0 6px;margin:0;background:transparent;min-width:0}",
			".tkgrp-row{display:flex;align-items:center;gap:8px;min-height:24px;font-size:14px;line-height:24px;cursor:pointer;user-select:none;position:relative;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:4px 12px;background:var(--dsw-alias-bg-base);margin:4px 0 4px 4px;width:fit-content;min-width:180px}",
			".tkgrp-root[data-open] .tkgrp-row{border:none;border-radius:0;padding:0 0 6px;margin:0;background:transparent;min-width:0}",
			"[data-chat-flow-kind=tool-call]:empty{display:none}",
			"[data-chat-flow-kind=tool-call]:has(.tkgrp-hidden){display:none}",
			"[data-chat-anchor-key]:has(.tkgrp-hidden){display:none}",
			"[data-conversation-scroll] div:has(> .tkgrp-hidden){display:none}",
			'.tkgrp-row[data-state=running]:after{content:"";position:absolute;inset-block:0;left:0;width:300px;pointer-events:none;background:linear-gradient(90deg,transparent 0%,color-mix(in srgb,var(--dsw-alias-bg-base) 60%,transparent) 55%,transparent 100%);animation:tkcnt-sweep 2.6s ease-out infinite}',
			".tkgrp-chevron{color:var(--dsw-alias-label-secondary);flex-shrink:0;width:14px;text-align:center;transition:transform .15s ease}",
			".tkgrp-chevron[data-open]{transform:rotate(90deg)}",
			".tkgrp-title{font-weight:400;color:var(--dsw-alias-label-secondary)}",
			".tkgrp-summary{color:var(--dsw-alias-label-tertiary);min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:auto}",
			".tkgrp-list{display:flex;flex-direction:column;gap:2px;padding:2px 0 2px 22px}",
			".tkgrp-item{font-size:13px;line-height:22px}",
			".tkgrp-item-head{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none}",
			".tkgrp-item-name{color:var(--dsw-alias-label-secondary)}",
			".tkgrp-item-state{font-size:11px;color:var(--dsw-alias-label-caption)}",
			".tkgrp-item-args{color:var(--dsw-alias-label-tertiary);white-space:pre-wrap;word-break:break-word;font-family:var(--dsw-font-markdown-code-block-small,monospace);font-size:12px;line-height:18px;padding:2px 0 2px 20px;max-height:180px;overflow:auto}",
			".tkgrp-dock{display:flex;justify-content:center;padding:2px 0}",
			".tkgrp-dock-btn{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border:none;border-radius:8px;cursor:pointer;font-size:12px;line-height:20px;padding:2px 10px}",
			".tkgrp-dock-btn:hover{color:var(--dsw-alias-label-primary)}",
			".tkgrp-out{color:var(--dsw-alias-label-tertiary);white-space:pre-wrap;word-break:break-word;padding:2px 0 4px 22px;font-size:14px;line-height:24px}",
			".jk-rail{position:fixed;width:20px;pointer-events:auto;z-index:21;cursor:default}",
			".jk-rail-active{cursor:pointer}",
			".jk-idle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;gap:5px;align-items:center}",
			".jk-idle-dot{width:4px;height:4px;border-radius:50%;background:var(--dsw-alias-label-caption);opacity:.7}",
			".jk-dot{position:absolute;left:50%;border-radius:50%;background:var(--dsw-alias-label-secondary);cursor:pointer;transform:translate(-50%,-50%)}",
			".jk-dot-active{background:var(--dsw-alias-label-primary);box-shadow:0 0 0 1px var(--dsw-alias-bg-base)}",
			".jk-tip{position:fixed;pointer-events:none;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 10px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);max-width:280px;box-shadow:var(--dsw-shadow-lv2);z-index:22}",
			".jk-tip-text{white-space:normal;word-break:break-word;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}",
			".tkgrp-thinkrow{padding-left:4px;min-height:24px;position:relative;overflow:hidden}",
			".tkgrp-think[data-state=running] .tkgrp-thinkrow:after{content:'';position:absolute;inset-block:0;left:0;width:300px;pointer-events:none;background:linear-gradient(90deg,transparent 0%,color-mix(in srgb,var(--dsw-alias-bg-base) 60%,transparent) 55%,transparent 100%);animation:tkcnt-sweep 2.6s ease-out infinite}",
			".tkgrp-think-summary{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:auto;display:inline-block;vertical-align:middle;padding-left:8px}",
			".tkgrp-thinktitle{font-weight:400}",
			".tkgrp-thinkchevron{color:var(--dsw-alias-label-secondary)}",
			".tkgrp-outrow{display:flex;align-items:center;gap:6px;min-height:22px;font-size:12px;line-height:18px;cursor:pointer;user-select:none;color:var(--dsw-alias-label-caption);padding:4px 0 2px 4px}",
			".tkgrp-outlabel{font-variant-numeric:tabular-nums}",
			"@media (prefers-reduced-motion:reduce){.tkgrp-row[data-state=running]:after{animation:none}}",
		].join("\n");

		function insertStyle() {
			if (typeof document === "undefined") return function () {};
			if (document.getElementById(CSS_ID) !== null) return function () {};
			var tag = document.createElement("style");
			tag.id = CSS_ID;
			tag.textContent = CSS;
			document.head.appendChild(tag);
			return function () {
				if (tag.parentNode !== null) tag.parentNode.removeChild(tag);
			};
		}

		/** Rough token estimate: CJK chars ≈ 0.6 token each, others ≈ 1 token / 4 chars. */
		function estimateTokens(text) {
			var cjk = 0;
			var other = 0;
			for (var i = 0; i < text.length; i++) {
				var code = text.codePointAt(i);
				if (code > 0xffff) i++;
				if (
					(code >= 0x3400 && code <= 0x9fff) ||
					(code >= 0x3040 && code <= 0x30ff) ||
					(code >= 0xac00 && code <= 0xd7af) ||
					(code >= 0x3000 && code <= 0x303f)
				) {
					cjk++;
				} else {
					other++;
				}
			}
			return Math.max(1, Math.round(cjk * 0.6 + other / 4));
		}

		function fmt(n) {
			return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

		function firstLine(text) {
			var newline = text.indexOf("\n");
			return newline === -1 ? text : text.slice(0, newline);
		}

		function latestLine(text) {
			var visible = text.trimEnd();
			var newline = visible.lastIndexOf("\n");
			return newline === -1 ? visible : visible.slice(newline + 1);
		}

		function fmtDuration(ms) {
			if (ms <= 0) return "";
			if (ms < 1000) return ms + "ms";
			return (Math.round(ms / 100) / 10).toFixed(1) + "s";
		}

		/** Reasoning token count for one assistant step (exact when reported). */
		function thinkTokensOf(data) {
			if (data === undefined || data === null) return 0;
			var usage = data.usage;
			if (typeof usage === "object" && usage !== null && typeof usage.reasoningTokens === "number") {
				return usage.reasoningTokens;
			}
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];
			var total = 0;
			for (var i = 0; i < blocks.length; i++) {
				var b = blocks[i];
				if (b !== undefined && b !== null && b.kind === "reasoning" && typeof b.text === "string") {
					total += estimateTokens(b.text);
				}
			}
			return total;
		}

		/** Think duration ms for one assistant step from its final node timing. */
		function thinkMsOf(data) {
			var fn = data !== undefined && data !== null ? data.finalNode : undefined;
			var timing = fn !== undefined && fn !== null ? fn.timing : undefined;
			if (timing === undefined || timing.stepStartTime === null || timing.completedTime === null) {
				return 0;
			}
			return Math.max(0, timing.completedTime - timing.stepStartTime);
		}

		// ── collapse-tools preference store (localStorage-backed, in-memory notify) ──

		var PREF_KEY = "dsh-thinkmeter:collapseTools";
		var prefListeners = new Set();

		function readPref() {
			try {
				if (typeof localStorage === "undefined") return false;
				return localStorage.getItem(PREF_KEY) === "1";
			} catch (e) {
				return false;
			}
		}

		function writePref(value) {
			try {
				if (typeof localStorage !== "undefined") localStorage.setItem(PREF_KEY, value ? "1" : "0");
			} catch (e) {}
			notifyPref();
		}

		function notifyPref() {
			for (var fn of prefListeners) {
				try {
					fn();
				} catch (e) {}
			}
		}


		function writeMd(value) {
			try {
				if (typeof localStorage !== "undefined") localStorage.setItem(MD_KEY, value ? "1" : "0");
			} catch (e) {}
			notifyPref();
		}


		/**
		 * Lazy access to the SHIPPED MarkdownText component. The module-table
		 * require is synchronous, so this is retried on later renders until the
		 * primitives bundle has materialized (it always has by the time the
		 * conversation renders).
		 */
		var primitivesValue;
		function getPrimitives() {
			if (primitivesValue !== undefined) return primitivesValue;
			try {
				primitivesValue = require("@deepseek-ai/dsh-client-ui-primitives") || null;
			} catch (e) {
				return null; // not materialized yet; retry next render
			}
			return primitivesValue;
		}

		var CODE_LABELS = { copyLabel: "复制", copiedLabel: "已复制" };

		/** Render one assistant text block: official Markdown, or plain text. */
		function renderTextBlock(key, text, streaming) {
			var prims = getPrimitives();
			if (prims !== null && prims.MarkdownText !== undefined) {
				return React.createElement(prims.MarkdownText, {
					key: key,
					text: text,
					streaming: streaming,
					codeLabels: CODE_LABELS,
				});
			}
			// Fallback while/if the primitives bundle is unavailable.
			return React.createElement("div", { key: key, className: "tkcnt-text" }, text);
		}

		// ── ThinkMeter ──

		function ThinkRow(props) {
			var state = React.useState(false);
			var isOpen = state[0];
			var setOpen = state[1];
			var usage = props.usage;
			var exact =
				typeof usage === "object" && usage !== null && typeof usage.reasoningTokens === "number"
					? usage.reasoningTokens
					: undefined;
			var count = exact !== undefined ? exact : estimateTokens(props.text);
			var title = props.running ? "Thinking" : "Think";
			var label = props.running
				? (exact !== undefined ? fmt(exact) : "≈ " + fmt(count)) + " tokens"
				: "Think · " + fmt(count) + " tokens";
			return React.createElement(
				"div",
				{ className: "tkcnt-think", "data-open": isOpen || undefined },
				React.createElement(
					"div",
					{
						className: "tkcnt-row",
						"data-state": props.running ? "running" : "ok",
						role: "button",
						tabIndex: 0,
						onClick: function () {
							setOpen(function (v) {
								return !v;
							});
						},
						onKeyDown: function (e) {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								setOpen(function (v) {
									return !v;
								});
							}
						},
					},
					React.createElement("span", { className: "tkcnt-chevron", "data-open": isOpen || undefined }, "▸"),
					React.createElement("span", { className: "tkcnt-title" }, title),
					React.createElement("span", { className: "tkcnt-summary" }, label),
				),
				isOpen ? React.createElement("div", { className: "tkcnt-body" }, props.text) : null,
			);
		}

		function AssistantStep(props) {
			var node = props.node;
			var data = node && node.data;
			if (data === undefined || data === null) return null;
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];
			var running = data.status === "running";
			var last = blocks.length - 1;
			var children = [];
			for (var i = 0; i < blocks.length; i++) {
				var block = blocks[i];
				if (block === undefined || block === null) continue;
				if (block.kind === "reasoning") {
					children.push(
						React.createElement(ThinkRow, {
							key: "r" + i,
							text: typeof block.text === "string" ? block.text : "",
							running: running && i === last,
							usage: data.usage,
						}),
					);
				} else if (block.kind === "text" && typeof block.text === "string" && block.text.trim() !== "") {
					// Skip whitespace-only text blocks; strip leading newlines.
					var el = renderTextBlock("t" + i, block.text.replace(/^\n+/, ""), running && i === last);
					if (el !== null) children.push(el);
				}
			}
			if (data.status === "interrupted") {
				children.push(React.createElement("span", { key: "stopped", className: "tkcnt-stopped" }, "Stopped"));
			}
			return React.createElement("div", { className: "tkcnt-root", "data-streaming": running || undefined }, children);
		}

		// ── Collapse tool calls ──

		/**
		 * Per-group expansion state, keyed by EVERY member node key of the run:
		 * the chain's first node can shift (or two chains can merge) when new
		 * tool calls stream in, and the expanded flag must survive that.
		 */
		var expandedRuns = new Set();
		var expandListeners = new Set();

		function runOpen(run) {
			if (run === null || run === undefined) return false;
			if (expandedRuns.has(run.firstKey)) return true;
			for (var i = 0; i < run.nodes.length; i++) {
				if (expandedRuns.has(run.nodes[i].key)) return true;
			}
			if (run.tail !== undefined && run.tail !== null && expandedRuns.has(run.tail.key)) return true;
			return false;
		}

		function runKeys(run) {
			var keys = [run.firstKey];
			for (var i = 0; i < run.nodes.length; i++) keys.push(run.nodes[i].key);
			if (run.tail !== undefined && run.tail !== null) keys.push(run.tail.key);
			return keys;
		}

		function toggleRun(run) {
			var open = runOpen(run);
			var keys = runKeys(run);
			for (var i = 0; i < keys.length; i++) {
				if (open) expandedRuns.delete(keys[i]);
				else expandedRuns.add(keys[i]);
			}
			for (var fn of expandListeners) {
				try {
					fn();
				} catch (e) {}
			}
		}

		/** Slot service reference set in apply(); used for delegated slot dispatch. */
		var slotsRef = null;

		/**
		 * Custom renderSlot for delegated rendering. The framework builds
		 * per-entry renderSlot bindings only for entries that DECLARE their child
		 * slots; our shadow cannot re-declare `tool.call.toolview` (already
		 * declared by the shipped entry), so we dispatch the slot registry
		 * ourselves: first matching keyed entry in priority order, else the
		 * caller's fallback. Chosen entries that declare their own children get a
		 * recursively scoped renderSlot of the same kind.
		 */
		function dispatchSlot(key, owner, opts, kit) {
			var slots = slotsRef;
			if (slots === null) return opts && opts.fallback !== undefined ? opts.fallback : null;
			var entries = slots.entries(key);
			var want = opts !== undefined && opts !== null ? opts.entryKey : undefined;
			for (var i = 0; i < entries.length; i++) {
				var e = entries[i];
				if (e === undefined || e === null || e.component === undefined) continue;
				if (want !== undefined && e.options !== undefined && e.options.key !== want) continue;
				var childKit = Object.assign({}, kit, buildInjectProps(e), {
					renderSlot: function (childKey, childOwner, childOpts) {
						var declared = e.children !== undefined ? e.children[childKey] : undefined;
						if (declared === undefined) {
							throw new Error("renderSlot('" + childKey + "') is not declared by this entry's children");
						}
						return dispatchSlot(childKey, childOwner, childOpts, kit);
					},
				});
				return React.createElement(e.component, Object.assign({}, childKit, owner));
			}
			return opts !== undefined && opts !== null && opts.fallback !== undefined ? opts.fallback : null;
		}

		/** Build the kit share (session standard props + locale) for delegation. */
		function kitOf(props) {
			var kit = {};
			for (var name of ["useSession", "sessionId", "useProjection", "useSessions", "t"]) {
				if (props[name] !== undefined) kit[name] = props[name];
			}
			return kit;
		}

		/** Cached sorted visible-node list, keyed by the nodes store identity. */
		var runCache = { nodes: null, sorted: null, size: 0 };

		function sortedVisible(nodes) {
			if (runCache.nodes === nodes && runCache.sorted !== null && runCache.size === nodes.size) {
				return runCache.sorted;
			}
			var list = [];
			for (var n of nodes.values()) {
				if (n === undefined || n === null) continue;
				if (n.visibility !== "visible") continue;
				list.push(n);
			}
			list.sort(function (a, b) {
				return a.anchorSeq - b.anchorSeq || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
			});
			runCache = { nodes: nodes, sorted: list, size: nodes.size };
			return list;
		}

		function indexIn(list, key) {
			for (var j = 0; j < list.length; j++) {
				if (list[j].key === key) return j;
			}
			return -1;
		}

		/**
		 * Node roles for the text-divider grouping model:
		 *  - 'tool':    a tool-call node (chain member)
		 *  - 'think':   an assistant step with reasoning and NO visible text
		 *               (chain member; consecutive thinks merge into one card)
		 *  - 'divider': an assistant step with visible text — the text renders
		 *               as the always-visible divider BELOW the merged card; a
		 *               reasoning-carrying divider's think merges into the
		 *               chain BEFORE it (chronologically before its text)
		 *  - null:      not groupable
		 */
		function nodeRoleOf(node) {
			if (node === undefined || node === null) return null;
			if (node.kind === "tool-call") return "tool";
			if (node.kind !== "assistant-step") return null;
			var data = node.data;
			if (data === undefined || data === null) return null;
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];
			var hasReasoning = false;
			var hasText = false;
			for (var i = 0; i < blocks.length; i++) {
				var b = blocks[i];
				if (b === undefined || b === null) continue;
				if (b.kind === "reasoning") hasReasoning = true;
				else if (b.kind === "text" && typeof b.text === "string" && b.text.trim() !== "") hasText = true;
			}
			if (hasText) return "divider";
			if (hasReasoning) return "think";
			return null;
		}

		function hasReasoningBlocks(node) {
			var data = node !== undefined && node !== null ? node.data : undefined;
			if (data === undefined || data === null) return false;
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];
			for (var i = 0; i < blocks.length; i++) {
				var b = blocks[i];
				if (b !== undefined && b !== null && b.kind === "reasoning") return true;
			}
			return false;
		}

		function isChainNode(node) {
			var role = nodeRoleOf(node);
			return role === "tool" || role === "think";
		}

		/**
		 * Text-divider grouping — every visible TEXT output divides the cards:
		 * one card merges ALL thinks and tool calls that precede it (since the
		 * previous text). The divider step renders only its text below the
		 * card; its own reasoning is absorbed into that card's aggregates.
		 */
		function groupRunOf(nodes, selfKey) {
			if (nodes === undefined || nodes === null || typeof nodes.values !== "function") return null;
			var list = sortedVisible(nodes);
			var i = indexIn(list, selfKey);
			// The nodes store may be mutated in place (stable identity), so a
			// cached list can be stale for a just-arrived node: force one recompute.
			if (i === -1 && runCache.nodes === nodes) {
				runCache = { nodes: null, sorted: null, size: 0 };
				list = sortedVisible(nodes);
				i = indexIn(list, selfKey);
			}
			if (i === -1) return null;
			var selfNode = nodes.get(selfKey);
			if (selfNode === undefined || selfNode === null) selfNode = list[i];
			var selfRole = nodeRoleOf(selfNode);
			if (selfRole === null) return null;
			if (selfRole === "divider") {
				// Its think merges into the preceding chain, if one exists and
				// this step carries reasoning; otherwise it renders standalone
				// (own think fold + text).
				var chainBefore = i > 0 && isChainNode(list[i - 1]);
				if (chainBefore && hasReasoningBlocks(selfNode)) return { role: "divider" };
				return { role: "solo" };
			}
			// Chain member (tool | think): extent of the consecutive chain.
			var s0 = i;
			while (s0 > 0 && isChainNode(list[s0 - 1])) s0--;
			var e0 = i;
			while (e0 + 1 < list.length && isChainNode(list[e0 + 1])) e0++;
			if (s0 !== i) return { role: "member" };
			// The divider right AFTER the chain absorbs its reasoning into us.
			var tail = null;
			if (e0 + 1 < list.length) {
				var after = nodes.get(list[e0 + 1].key);
				if (after === undefined || after === null) after = list[e0 + 1];
				if (nodeRoleOf(after) === "divider" && hasReasoningBlocks(after)) tail = after;
			}
			// Read LIVE node objects by key: the cached list only provides the
			// ORDER, while its node refs may be stale (store mutated in place).
			var runNodes = [];
			var anyRunning = false;
			var toolCount = 0;
			var thinkTokens = 0;
			var thinkMs = 0;
			for (var k = s0; k <= e0; k++) {
				var nd = nodes.get(list[k].key);
				if (nd === undefined || nd === null) nd = list[k];
				var role = nodeRoleOf(nd);
				if (role === "tool") {
					toolCount++;
					var root = nd.data && nd.data.root;
					// Settled blocks carry kind 'tool-result'; running blocks have no kind.
					if (!(root !== undefined && root !== null && root.kind === "tool-result")) anyRunning = true;
				} else {
					thinkTokens += thinkTokensOf(nd.data);
					thinkMs += thinkMsOf(nd.data);
					if (nd.data !== undefined && nd.data !== null && nd.data.status === "running") anyRunning = true;
				}
				runNodes.push(nd);
			}
			if (tail !== null) {
				thinkTokens += thinkTokensOf(tail.data);
				thinkMs += thinkMsOf(tail.data);
				if (tail.data !== undefined && tail.data !== null && tail.data.status === "running") anyRunning = true;
			}
			return {
				role: "first",
				firstKey: list[s0].key,
				count: toolCount,
				running: anyRunning,
				thinkTokens: thinkTokens,
				thinkMs: thinkMs,
				nodes: runNodes,
				tail: tail,
			};
		}

		/** Build a React selector hook over one HostObservable source. */
		function makeSelectorHook(obs) {
			return function (selector) {
				var sel = typeof selector === "function" ? selector : function (v) {
					return v;
				};
				var state = React.useState(function () {
					return obs !== undefined && obs !== null ? sel(obs.getSnapshot()) : undefined;
				});
				var value = state[0];
				var setValue = state[1];
				React.useEffect(
					function () {
						if (obs === undefined || obs === null) return;
						var fn = function () {
							setValue(sel(obs.getSnapshot()));
						};
						var dispose = obs.subscribe(fn);
						fn();
						return function () {
							if (typeof dispose === "function") dispose();
						};
					},
					[],
				);
				return value;
			};
		}

		/**
		 * The shipped tool-call renderer shadowed by ours (same slot, priority
		 * 0), plus the inject compartment props its entry declares (plain
		 * members + `hooks` sources that the framework binds as `useXxx`
		 * selector-hook props — e.g. useHostDescription — when the SHIPPED
		 * entry renders; our delegation must supply them too).
		 */
		var shippedToolCache = { entry: null, component: null, injectProps: null };

		function findShippedToolComponent() {
			var slots = slotsRef;
			if (slots === null || typeof slots.entries !== "function") return null;
			try {
				var entries = slots.entries("conversation.chat.node");
				for (var idx = 0; idx < entries.length; idx++) {
					var e = entries[idx];
					if (
						e !== null &&
						e !== undefined &&
						e.options !== undefined &&
						e.options.key === "tool-call" &&
						e.component !== RoundEntry
					) {
						if (shippedToolCache.entry !== e) {
							shippedToolCache = {
								entry: e,
								component: e.component,
								injectProps: buildInjectProps(e),
							};
						}
						return shippedToolCache.component;
					}
				}
			} catch (err) {}
			return null;
		}

		/** Resolve one entry's inject compartment into concrete props (cached per entry). */
		var injectPropsCache = typeof WeakMap !== "undefined" ? new WeakMap() : null;

		function buildInjectProps(entry) {
			if (injectPropsCache !== null) {
				var cached = injectPropsCache.get(entry);
				if (cached !== undefined) return cached;
			}
			var out = buildInjectPropsUncached(entry);
			if (injectPropsCache !== null) {
				try {
					injectPropsCache.set(entry, out);
				} catch (e) {}
			}
			return out;
		}

		function buildInjectPropsUncached(entry) {
			var out = {};
			try {
				if (entry === null || entry === undefined || typeof entry.inject !== "function") return out;
				var compartment = entry.inject();
				if (compartment === null || compartment === undefined || typeof compartment !== "object") return out;
				for (var name in compartment) {
					if (!Object.prototype.hasOwnProperty.call(compartment, name)) continue;
					if (name === "hooks") continue;
					out[name] = compartment[name];
				}
				var hooks = compartment.hooks;
				if (hooks !== null && hooks !== undefined && typeof hooks === "object") {
					for (var hookName in hooks) {
						if (!Object.prototype.hasOwnProperty.call(hooks, hookName)) continue;
						var obs = hooks[hookName];
						if (obs === null || obs === undefined) continue;
						var prop = "use" + hookName.charAt(0).toUpperCase() + hookName.slice(1);
						out[prop] = makeSelectorHook(obs);
					}
				}
			} catch (err) {
				console.error("[thinkmeter] buildInjectProps error:", err);
			}
			return out;
		}

		/**
		 * Error boundary around RoundView: a crash inside the card (official
		 * DisclosureRow / MarkdownText / delegated tool cards) degrades to the
		 * plain think meter instead of abdicating the whole entry (which would
		 * hide the fold card AND every grouped tool call).
		 */
		class SafeRoundBoundary extends React.Component {
			constructor(props) {
				super(props);
				this.state = { failed: false };
			}
			static getDerivedStateFromError() {
				return { failed: true };
			}
			componentDidCatch(error) {
				console.error("[thinkmeter] RoundView render error:", error);
			}
			render() {
				if (this.state.failed) {
					var fb = this.props.fallback;
					return fb === undefined ? null : fb();
				}
				return this.props.children;
			}
		}

		/** Divider rendering: only the step's text blocks (think merged above). */
		function AssistantTextOnly(props) {
			var data = props.node !== undefined && props.node !== null ? props.node.data : undefined;
			if (data === undefined || data === null) return null;
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];
			var running = data.status === "running";
			var children = [];
			for (var i = 0; i < blocks.length; i++) {
				var block = blocks[i];
				if (block === undefined || block === null) continue;
				if (block.kind === "text" && typeof block.text === "string" && block.text.trim() !== "") {
					var el = renderTextBlock("t" + i, block.text.replace(/^\n+/, ""), running);
					if (el !== null) children.push(el);
				}
			}
			if (data.status === "interrupted") {
				children.push(React.createElement("span", { key: "stopped", className: "tkcnt-stopped" }, "Stopped"));
			}
			if (children.length === 0) return null;
			return React.createElement("div", { className: "tkcnt-root", "data-streaming": running || undefined }, children);
		}

		/** One round entry, shared by the assistant-step and tool-call seats. */
		function RoundEntry(props) {
			var node = props.node;
			var useSession = props.useSession;
			if (typeof useSession !== "function" || node === undefined) return null;
			// All hooks run unconditionally: a node may transition between
			// first-of-run and non-first across renders, and React requires a
			// stable hook count.
			var run = useSession(function (snapshot) {
				try {
					return groupRunOf(snapshot && snapshot.chat && snapshot.chat.nodes, node.key);
				} catch (e) {
					console.error("[thinkmeter] roundRunOf error:", e);
					return null;
				}
			});
			var state = React.useState(false);
			var bump = state[1];
			React.useEffect(
				function () {
					var fn = function () {
						bump(function (v) {
							return !v;
						});
					};
					expandListeners.add(fn);
					return function () {
						expandListeners.delete(fn);
					};
				},
				[],
			);
			try {
				if (run === null) {
					// Not groupable: plain per-node rendering.
					if (node.kind === "assistant-step") return AssistantStep(props);
					return null;
				}
				// Hidden chain members render a marker element; the :has() CSS
				// rule removes the whole flow wrapper from layout.
				if (run.role === "member") {
					return hiddenMarker();
				}
				// Divider: its think merged into the card above — render text only.
				if (run.role === "divider") {
					return AssistantTextOnly(props);
				}
				// Standalone divider (no chain above to merge into): think + text.
				if (run.role === "solo") {
					return AssistantStep(props);
				}
				var fallback = function () {
					return node.kind === "assistant-step" ? AssistantStep(props) : hiddenMarker();
				};
				return React.createElement(
					SafeRoundBoundary,
					{ fallback: fallback },
					React.createElement(RoundView, { props: props, run: run }),
				);
			} catch (e) {
				console.error("[thinkmeter] RoundEntry render error:", e);
				if (node.kind === "assistant-step") return AssistantStep(props);
				return null;
			}
		}

		/** Layout-invisible marker rendered by hidden round members. */
		function hiddenMarker() {
			return React.createElement("div", { className: "tkgrp-hidden", style: { display: "none" } });
		}

		/** One reasoning section of a card (official DisclosureRow fold). */
		function ThinkFold(props) {
			var data = props.data;
			var open = props.open;
			var onToggle = props.onToggle;
			var blocks = data !== undefined && data !== null && Array.isArray(data.blocks) ? data.blocks : [];
			var outputs = [];
			for (var b = 0; b < blocks.length; b++) {
				var block = blocks[b];
				if (block !== undefined && block !== null && block.kind === "reasoning" && typeof block.text === "string" && block.text.trim() !== "") {
					outputs.push(block.text.replace(/^\n+/, ""));
				}
			}
			if (outputs.length === 0) return null;
			var thinkChildren = [];
			for (var o = 0; o < outputs.length; o++) {
				thinkChildren.push(React.createElement("div", { key: "out" + o, className: "tkgrp-out" }, outputs[o]));
			}
			var thinkRunning = data !== undefined && data !== null && data.status === "running";
			var summaryLine = thinkRunning ? latestLine(outputs[outputs.length - 1]) : firstLine(outputs[outputs.length - 1]);
			var prims = getPrimitives();
			if (prims !== null && prims.DisclosureRow !== undefined) {
				return React.createElement(
					"div",
					{ className: "tkgrp-think", "data-state": thinkRunning ? "running" : "ok" },
					React.createElement(prims.DisclosureRow, {
						rowClassName: "tkgrp-thinkrow",
						leadingClassName: "tkgrp-thinkleading",
						titleClassName: "tkgrp-thinktitle",
						chevronClassName: "tkgrp-thinkchevron",
						icon: React.createElement(prims.IconThinkOutline14, { size: 14 }),
						title: "Think",
						open: open,
						expandable: true,
						expandOnRowClick: true,
						onToggle: onToggle,
						collapsedContent: React.createElement("span", {
							className: "tkgrp-think-summary",
							"data-follow-end": thinkRunning || undefined,
						}, summaryLine),
					}, thinkChildren),
				);
			}
			return React.createElement(
				"div",
				{ className: "tkgrp-think", "data-state": thinkRunning ? "running" : "ok" },
				React.createElement(
					"div",
					{
						className: "tkgrp-outrow",
						role: "button",
						tabIndex: 0,
						onClick: function (e) {
							e.stopPropagation();
							onToggle();
						},
					},
					React.createElement("span", { className: "tkgrp-chevron", "data-open": open || undefined }, "▸"),
					React.createElement("span", { className: "tkgrp-outlabel" }, "Think"),
				),
				open ? thinkChildren : null,
			);
		}

		/**
		 * One merged card: everything (thinks + tool calls) since the previous
		 * text output. The divider step's own text renders BELOW the card in
		 * its own wrapper (see the 'divider' role in RoundEntry).
		 */
		function RoundView(props) {
			var run = props.run;
			var propsSource = props.props;
			// Shared disclosure state for the card's think folds.
			var thinkState = React.useState(false);
			var thinkOpen = thinkState[0];
			var setThinkOpen = thinkState[1];
			// Live ticker while anything in the chain is running.
			var tickState = React.useState(0);
			var setTick = tickState[1];
			React.useEffect(
				function () {
					if (!run.running) return;
					var id = setInterval(function () {
						setTick(function (v) {
							return v + 1;
						});
					}, 500);
					return function () {
						clearInterval(id);
					};
				},
				[run.running],
			);
			var isOpen = runOpen(run);
			// Live header values while running: the freshest running member's
			// wall-clock seconds + streamed estimate on top of the settled sum.
			var liveNode = null;
			if (run.running) {
				for (var m = run.nodes.length - 1; m >= 0; m--) {
					var cand = run.nodes[m];
					if (cand.kind !== "tool-call" && cand.data !== undefined && cand.data !== null && cand.data.status === "running") {
						liveNode = cand;
						break;
					}
				}
				if (liveNode === null && run.tail !== undefined && run.tail !== null && run.tail.data !== undefined && run.tail.data !== null && run.tail.data.status === "running") {
					liveNode = run.tail;
				}
			}
			// Header aggregates: settled members contribute exact values; the
			// running member contributes a live estimate + wall-clock seconds.
			var headerTokens = 0;
			var headerMs = 0;
			for (var m2 = 0; m2 < run.nodes.length; m2++) {
				var node2 = run.nodes[m2];
				if (node2.kind === "tool-call") continue;
				headerTokens += thinkTokensOf(node2.data);
				if (node2 === liveNode && typeof node2.data.time === "number") {
					var s2 = (Date.now() - node2.data.time) / 1000;
					if (s2 > 0) headerMs += s2 * 1000;
				} else {
					headerMs += thinkMsOf(node2.data);
				}
			}
			if (run.tail !== undefined && run.tail !== null) {
				headerTokens += thinkTokensOf(run.tail.data);
				if (run.tail === liveNode && typeof run.tail.data.time === "number") {
					var s3 = (Date.now() - run.tail.data.time) / 1000;
					if (s3 > 0) headerMs += s3 * 1000;
				} else {
					headerMs += thinkMsOf(run.tail.data);
				}
			}
			var headerRunning = run.running;
			// Header: [Think duration & tokens, tool-call count]
			var parts = [];
			if (headerTokens > 0) {
				var duration = headerRunning && headerMs > 0 ? (Math.round(headerMs / 100) / 10).toFixed(1) + "s" : fmtDuration(headerMs);
				parts.push("Think" + (duration !== "" ? " " + duration : "") + " · " + fmt(Math.round(headerTokens)) + " tokens");
			}
			if (run.count > 0) parts.push(run.count + " 次工具调用");
			if (parts.length === 0) parts.push("运行中");
			var header = parts.join("，") + (headerRunning ? " · 运行中" : "");
			var children = [];
			children.push(
				React.createElement(
					"div",
					{
						key: "head",
						className: "tkgrp-row",
						"data-state": headerRunning ? "running" : "ok",
						role: "button",
						tabIndex: 0,
						title: isOpen ? "点击折叠" : "点击展开工具卡片",
						onClick: function (e) {
							e.stopPropagation();
							toggleRun(run);
						},
						onKeyDown: function (e) {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								toggleRun(run);
							}
						},
					},
					React.createElement("span", { className: "tkgrp-chevron", "data-open": isOpen || undefined }, "▸"),
					React.createElement("span", { className: "tkgrp-title" }, "Tool calls"),
					React.createElement("span", { className: "tkgrp-summary" }, header),
				),
			);
			// Members in chronological order: think members render their fold
			// row; tool members render official cards when expanded. The
			// absorbed tail divider's think fold comes last (after the tools).
			var shipped = run.count > 0 ? findShippedToolComponent() : null;
			var kit = kitOf(propsSource);
			var foldCount = 0;
			for (var mi = 0; mi < run.nodes.length; mi++) {
				var member = run.nodes[mi];
				if (member.kind === "tool-call") {
					if (!isOpen || shipped === null) continue;
					var cardName = (member.data !== undefined && member.data !== null && member.data.root !== undefined && member.data.root !== null && member.data.root.name) || "tool";
					var delegatedProps = Object.assign({}, propsSource, shippedToolCache.injectProps, {
						node: member,
						renderSlot: function (key, owner, opts) {
							return dispatchSlot(key, owner, opts, kit);
						},
					});
					children.push(
						React.createElement(
							SafeRoundBoundary,
							{
								key: member.key,
								fallback: function (name) {
									return function () {
										return React.createElement(
											"div",
											{ className: "tkgrp-summary" },
											"(工具卡渲染失败：" + name + ")",
										);
									};
								}(cardName),
							},
							React.createElement(shipped, delegatedProps),
						),
					);
				} else {
					foldCount++;
					children.push(
						React.createElement(ThinkFold, {
							key: "fold" + member.key,
							data: member.data,
							open: thinkOpen,
							onToggle: function () {
								setThinkOpen(function (v) {
									return !v;
								});
							},
						}),
					);
				}
			}
			if (run.tail !== undefined && run.tail !== null) {
				foldCount++;
				children.push(
					React.createElement(ThinkFold, {
						key: "fold" + run.tail.key,
						data: run.tail.data,
						open: thinkOpen,
						onToggle: function () {
							setThinkOpen(function (v) {
								return !v;
							});
						},
					}),
				);
			}
			if (isOpen && run.count > 0 && shipped === null) {
				children.push(
					React.createElement("div", { key: "fallback", className: "tkgrp-summary" }, "(原始渲染器不可用 — shipped tool renderer not found)"),
				);
			}
			var rootClass = "tkgrp-root" + (run.running || run.count > 0 || foldCount > 0 ? " tkgrp-card" : "");
			return React.createElement(
				"div",
				{ className: rootClass, "data-open": (run.count > 0 && isOpen) || undefined },
				children,
			);
		}

		/** Generic preference toggle row. */
		function makeToggleRow(read, write, label, desc) {
			return function PrefRow() {
				var s = React.useState(read());
				var on = s[0];
				var setOn = s[1];
				React.useEffect(
					function () {
						var fn = function () {
							setOn(read());
						};
						prefListeners.add(fn);
						return function () {
							prefListeners.delete(fn);
						};
					},
					[],
				);
				return React.createElement(
					"div",
					{ className: "tkset-row" },
					React.createElement(
						"div",
						{ className: "tkset-info" },
						React.createElement("div", { className: "tkset-label" }, label),
						React.createElement("div", { className: "tkset-desc" }, desc),
					),
					React.createElement(
						"button",
						{
							className: "tkset-toggle" + (on ? " is-on" : ""),
							role: "switch",
							"aria-checked": on,
							onClick: function () {
								write(!on);
							},
						},
						React.createElement("span", { className: "tkset-knob" }),
					),
				);
			};
		}

		var CollapseToolsSettingRow = makeToggleRow(
			readPref,
			writePref,
			"折叠工具调用",
			"开启后，连续的工具调用折叠为分组框并显示数量；点击分组框展开为原始工具卡片，再次点击折叠",
		);

		// ── Session quick-jump rail ──

		/** Pure-data store shared by the measure dock and the overlay rail. */
		var jumpEntries = [];
		var jumpContainer = null;
		var jumpListeners = new Set();

		function notifyJump() {
			for (var fn of [...jumpListeners]) {
				try {
					fn();
				} catch (e) {}
			}
		}

		/** Extract prompt text from one user node (text content blocks only). */
		function userTextOf(data) {
			if (data === undefined || data === null) return "";
			var content = Array.isArray(data.content) ? data.content : [];
			var parts = [];
			for (var i = 0; i < content.length; i++) {
				var c = content[i];
				if (c !== undefined && c !== null && typeof c.text === "string" && c.text.trim() !== "") {
					parts.push(c.text.replace(/^\n+/, ""));
				}
			}
			var t = parts.join("\n").replace(/\s+/g, " ").trim();
			if (t.length > 200) t = t.slice(0, 200) + "…";
			return t;
		}

		/** Visible user-node summary, stable by CONTENT (not Map identity, which
		 *  can be mutated in place when "load older" prepends history). */
		var userCache = { list: null, sig: null };

		function userEntries(nodes) {
			if (nodes === undefined || nodes === null || typeof nodes.values !== "function") return [];
			var list = [];
			for (var n of nodes.values()) {
				if (n === undefined || n === null) continue;
				if (n.kind !== "user" || n.visibility !== "visible") continue;
				var seq = n.data !== undefined && n.data !== null && typeof n.data.seq === "number" ? n.data.seq : n.anchorSeq;
				list.push({ key: n.key, seq: seq, text: userTextOf(n.data) });
			}
			list.sort(function (a, b) {
				return a.seq - b.seq;
			});
			var sig = list.map(function (x) {
				return x.key + "|" + x.text.length;
			}).join(",");
			if (userCache.sig === sig && userCache.list !== null) return userCache.list;
			userCache = { list: list, sig: sig };
			return list;
		}

		/**
		 * Session-scope measurer (renders nothing): watches the scroll
		 * container and writes each user message's normalized position into
		 * the jump store.
		 */
		function MeasureDock(props) {
			var useSession = props.useSession;
			if (typeof useSession !== "function") {
				console.warn("[thinkmeter] MeasureDock: no useSession in dock props");
				return null;
			}
			var users = useSession(function (snapshot) {
				return userEntries(snapshot && snapshot.chat && snapshot.chat.nodes);
			});
			React.useState(false);
			// usersRef lets the single mount-once effect read the latest list
			// without re-running (and clearing) on every snapshot.
			var usersRef = React.useRef(users);
			usersRef.current = users;
			var measureRef = React.useRef(null);
			React.useEffect(
				function () {
					var raf = 0;
					var lastContainer = null;
					var loggedEmpty = false;
					var lastSig = "";
					var retryTimer = 0;
					var retries = 0;
					function measure() {
						if (raf !== 0) return;
						raf = requestAnimationFrame(function () {
							raf = 0;
							doMeasure();
						});
					}
					function retry() {
						if (retryTimer !== 0) return;
						retryTimer = setTimeout(function () {
							retryTimer = 0;
							measure();
						}, 120);
					}
					function doMeasure() {
						try {
							measureInner();
						} catch (e) {
							console.error("[thinkmeter] jump measure error:", e);
						}
					}
					function measureInner() {
						var container = document.querySelector("[data-conversation-scroll]");
						if (container === null) {
							if (!loggedEmpty) {
								loggedEmpty = true;
								console.warn("[thinkmeter] jump: [data-conversation-scroll] container not found");
							}
							jumpContainer = null;
							jumpEntries = [];
							notifyJump();
							retry();
							return;
						}
						loggedEmpty = false;
						if (container !== lastContainer) {
							if (lastContainer !== null) lastContainer.removeEventListener("scroll", measure);
							container.addEventListener("scroll", measure, { passive: true });
							lastContainer = container;
							// Watch the newly-resolved container for size changes too.
							if (typeof ResizeObserver !== "undefined" && ro !== null) {
								try {
									ro.observe(container);
								} catch (e) {}
							}
						}
						var usersNow = usersRef.current;
						var cRect = container.getBoundingClientRect();
						if (cRect.height <= 0) {
							// New session's container is not laid out yet: retry a
							// few times instead of silently keeping stale data.
							if (retries < 30) {
								retries++;
								retry();
							}
							return;
						}
						retries = 0;
						var list = [];
						for (var i = 0; i < usersNow.length; i++) {
							var u = usersNow[i];
							var el = container.querySelector('[data-chat-anchor-key="' + u.key + '"]');
							if (el === null) continue;
							var r = el.getBoundingClientRect();
							var top = r.top - cRect.top + container.scrollTop;
							var pct = container.scrollHeight > 0 ? top / container.scrollHeight : 0;
							list.push({ key: u.key, text: u.text, pct: Math.min(1, Math.max(0, pct)) });
						}
						// Only notify when something materially changed (count or a
						// marker moved >1%): avoids re-rendering the rail per frame.
						var sig = list.length + "|" + list.map(function (x) {
							return Math.round(x.pct * 100);
						}).join(",");
						if (sig === lastSig && jumpEntries.length === list.length) return;
						lastSig = sig;
						if (list.length > 0 && jumpEntries.length === 0) {
							console.log("[thinkmeter] jump rail active: " + list.length + " user markers");
						}
						jumpContainer = container;
						jumpEntries = list;
						notifyJump();
					}
					measureRef.current = measure;
					measure();
					// Self-healing: refresh periodically in case an event was missed.
					var refresh = setInterval(function () {
						measure();
					}, 2000);
					function onExpand() {
						measure();
					}
					expandListeners.add(onExpand);
					var onResize = measure;
					window.addEventListener("resize", onResize);
					var ro = null;
					if (typeof ResizeObserver !== "undefined") {
						ro = new ResizeObserver(function () {
							measure();
						});
						var c0 = document.querySelector("[data-conversation-scroll]");
						if (c0 !== null) ro.observe(c0);
					}
					return function () {
						expandListeners.delete(onExpand);
						window.removeEventListener("resize", onResize);
						clearInterval(refresh);
						if (retryTimer !== 0) {
							clearTimeout(retryTimer);
							retryTimer = 0;
						}
						if (ro !== null) ro.disconnect();
						if (lastContainer !== null) lastContainer.removeEventListener("scroll", measure);
						if (raf !== 0) cancelAnimationFrame(raf);
						measureRef.current = null;
						// Do NOT clear the store here: transient effect re-runs would
						// flicker the rail. The store is replaced on the next measure.
					};
				},
				[],
			);
			// Re-measure when the user-message list identity changes (new/other
			// session, new message) without tearing the listeners down.
			React.useEffect(
				function () {
					var m = measureRef.current;
					if (m !== null) m();
				},
				[users],
			);
			return null;
		}

		/** Root-scope overlay rail: dots for every user message, tip on hover, jump on click. */
		function scrollToKey(key, behavior) {
			var el = document.querySelector('[data-chat-anchor-key="' + key + '"]');
			if (el !== null && typeof el.scrollIntoView === "function") {
				el.scrollIntoView({ behavior: behavior, block: "start" });
			}
		}

		/**
		 * Quick-jump rail. Idle: three small dots vertically centered. Hover:
		 * one dot per user input, magnified near the cursor (lens effect) and
		 * shrinking progressively away from it. Wheel: steps focus to the
		 * previous/next input and scrolls the chat there. Click jumps.
		 */
		function JumpRail() {
			var tickState = React.useState(0);
			var setTick = tickState[1];
			var activeState = React.useState(false);
			var active = activeState[0];
			var setActive = activeState[1];
			var cursorState = React.useState(null);
			var cursorY = cursorState[0];
			var setCursorY = cursorState[1];
			var focusState = React.useState(-1);
			var focusIdx = focusState[0];
			var setFocusIdx = focusState[1];
			var railRef = React.useRef(null);
			React.useEffect(
				function () {
					var fn = function () {
						setTick(function (v) {
							return v + 1;
						});
					};
					jumpListeners.add(fn);
					var raf = 0;
					var onResize = function () {
						if (raf !== 0) return;
						raf = requestAnimationFrame(function () {
							raf = 0;
							fn();
						});
					};
					window.addEventListener("resize", onResize);
					return function () {
						jumpListeners.delete(fn);
						window.removeEventListener("resize", onResize);
						if (raf !== 0) cancelAnimationFrame(raf);
					};
				},
				[],
			);
			// Non-passive wheel handler: step focus through the user inputs.
			React.useEffect(
				function () {
					var el = railRef.current;
					if (el === null) return;
					var onWheel = function (e) {
						e.preventDefault();
						var dir = e.deltaY > 0 ? 1 : -1;
						var cur = -1;
						// Start from the entry nearest the current scroll position.
						if (jumpContainer !== null && jumpEntries.length > 0) {
							var ratio = jumpContainer.scrollTop / Math.max(1, jumpContainer.scrollHeight - jumpContainer.clientHeight);
							var best = 0;
							var bestD = Infinity;
							for (var i = 0; i < jumpEntries.length; i++) {
								var d = Math.abs(jumpEntries[i].pct - ratio);
								if (d < bestD) {
									bestD = d;
									best = i;
								}
							}
							cur = best;
						}
						var next = Math.min(jumpEntries.length - 1, Math.max(0, cur + dir));
						setFocusIdx(next);
						if (jumpEntries[next] !== undefined) {
							scrollToKey(jumpEntries[next].key, "auto");
						}
					};
					el.addEventListener("wheel", onWheel, { passive: false });
					return function () {
						el.removeEventListener("wheel", onWheel);
					};
				},
				[active, tickState[0]],
			);
			if (jumpEntries.length === 0 || jumpContainer === null) return null;
			var rect = jumpContainer.getBoundingClientRect();
			if (rect.height <= 0 || rect.width <= 0) return null;
			var railTop = rect.top;
			var railHeight = rect.height;
			var scrollbar = Math.max(0, jumpContainer.offsetWidth - jumpContainer.clientWidth);
			var railLeft = rect.right - scrollbar - 16;
			var children = [];
			if (!active) {
				// Idle: three small dots vertically centered.
				children.push(
					React.createElement(
						"div",
						{ key: "idle", className: "jk-idle" },
						React.createElement("span", { className: "jk-idle-dot" }),
						React.createElement("span", { className: "jk-idle-dot" }),
						React.createElement("span", { className: "jk-idle-dot" }),
					),
				);
			} else {
				// Lens dots: size peaks at the cursor and decays away from it.
				var tipEntry = null;
				var tipTop = 0;
				var nearest = -1;
				var nearestD = Infinity;
				for (var p = 0; p < jumpEntries.length; p++) {
					var y = railTop + jumpEntries[p].pct * (railHeight - 12) + 6;
					if (cursorY !== null) {
						var dd = Math.abs(cursorY - y);
						if (dd < nearestD) {
							nearestD = dd;
							nearest = p;
						}
					}
				}
				var tipIdx = focusIdx >= 0 ? focusIdx : nearest;
				for (var i = 0; i < jumpEntries.length; i++) {
					var entry = jumpEntries[i];
					var top = railTop + entry.pct * (railHeight - 12) + 6;
					var size = 4;
					if (cursorY !== null) {
						var dist = Math.abs(cursorY - top);
						size = 4 + 7 * Math.exp(-(dist * dist) / (2 * 70 * 70));
					}
					var isTip = i === tipIdx;
					children.push(
						React.createElement("div", {
							key: entry.key,
							className: "jk-dot" + (isTip ? " jk-dot-active" : ""),
							style: { top: top, width: size, height: size },
							onClick: function (key) {
								return function () {
									scrollToKey(key, "smooth");
								};
							}(entry.key),
						}),
					);
					if (isTip) {
						tipEntry = entry;
						tipTop = top;
					}
				}
				if (tipEntry !== null) {
					children.push(
						React.createElement(
							"div",
							{ key: "tip", className: "jk-tip", style: { top: tipTop - 8, left: railLeft - 292 } },
							React.createElement("div", { className: "jk-tip-text" }, tipEntry.text || "(空)"),
						),
					);
				}
			}
			return React.createElement(
				"div",
				{
					ref: railRef,
					className: "jk-rail" + (active ? " jk-rail-active" : ""),
					style: { top: railTop, left: railLeft, height: railHeight },
					onMouseEnter: function () {
						setActive(true);
					},
					onMouseLeave: function () {
						setActive(false);
						setCursorY(null);
						setFocusIdx(-1);
					},
					onMouseMove: function (e) {
						setCursorY(e.clientY);
					},
				},
				children,
			);
		}


		function apply(ctx) {
			var slots = ctx.get("slots");
			if (slots === undefined) return;
			slotsRef = slots;
			var disposeStyle = insertStyle();

			// ThinkMeter + chain-aware tool grouping: the assistant-step shadow is
			// always on; when the collapse preference is off it renders the plain
			// think meter, otherwise chain-aware (tool-issuing steps join groups).
			var disposeThink = slots.inject("conversation.chat.node", function () {
				// priority -1 shadows the shipped assistant-step entry at priority 0 (lowest renders)
				return slots.register(
					{ name: "conversation.chat.node", key: "assistant-step", priority: -1, locale: "conversation" },
					RoundEntry,
				);
			});

			// Settings rows (Settings → General), always registered.
			var disposeSettings = slots.inject("settings.general.item", function () {
				return slots.register(
					{ name: "settings.general.item", id: "thinkmeter-collapse-tools", order: 100, label: "折叠工具调用" },
					CollapseToolsSettingRow,
				);
			});

			// Tool-call group shadow: registered only while the preference is on,
			// so turning it off restores the shipped tool cards.
			var shadowDisp = null;
			function syncShadow() {
				if (readPref() && shadowDisp === null) {
					shadowDisp = slots.inject("conversation.chat.node", function () {
						return slots.register(
							{
								name: "conversation.chat.node",
								key: "tool-call",
								priority: -1,
								locale: "conversation",
							},
							RoundEntry,
						);
					});
				} else if (!readPref() && shadowDisp !== null) {
					try {
						shadowDisp();
					} catch (e) {}
					shadowDisp = null;
				}
			}
			prefListeners.add(syncShadow);
			syncShadow();

			// Quick-jump rail: measure dock (session scope) + overlay rail.
			var disposeJumpDock = slots.inject("conversation.input.dock", function () {
				return slots.register(
					{ name: "conversation.input.dock", id: "thinkmeter-jump-measure", order: 200, label: "跳转测量" },
					MeasureDock,
				);
			});
			var disposeJumpRail = slots.inject("shell.overlay", function () {
				return slots.register(
					{ name: "shell.overlay", id: "thinkmeter-jump-rail", order: 200, label: "用户输入跳转条" },
					JumpRail,
				);
			});

			ctx.effect(function () {
				return function () {
					prefListeners.delete(syncShadow);
					if (shadowDisp !== null) {
						try {
							shadowDisp();
						} catch (e) {}
						shadowDisp = null;
					}
					try {
						disposeJumpDock && disposeJumpDock();
					} catch (e) {}
					try {
						disposeJumpRail && disposeJumpRail();
					} catch (e) {}
					try {
						disposeSettings && disposeSettings();
					} catch (e) {}
					try {
						disposeThink && disposeThink();
					} catch (e) {}
					try {
						disposeStyle();
					} catch (e) {}
					slotsRef = null;
				};
			});
		}

		exports.apply = apply;
		return module.exports;
	},
});
