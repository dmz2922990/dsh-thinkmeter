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
			".tkver-row{color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px;padding:20px 16px 8px 0;text-align:right}",
			// tool call group
			".tkgrp-root{display:flex;flex-direction:column}",
			".tkgrp-root[data-open]{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:8px 12px 4px;background:var(--dsw-alias-bg-base);margin:4px 0 4px 4px}",
			".tkgrp-card{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:8px 12px 4px;background:var(--dsw-alias-bg-base);margin:4px 0 4px 4px}",
			".tkgrp-card .tkgrp-row{border:none;border-radius:0;padding:0 0 6px;margin:0;background:transparent;min-width:0}",
			".tkgrp-card:empty{display:none}",
			".tkgrp-root[data-open]>div:empty{display:none}",
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
			".tkgrp-thinkrow{padding-left:0;min-height:24px;position:relative;overflow:hidden}",
			".tkgrp-think[data-state=running] .tkgrp-thinkrow:after{content:'';position:absolute;inset-block:0;left:0;width:300px;pointer-events:none;background:linear-gradient(90deg,transparent 0%,color-mix(in srgb,var(--dsw-alias-bg-base) 60%,transparent) 55%,transparent 100%);animation:tkcnt-sweep 2.6s ease-out infinite}",
			".tkgrp-think-summary{color:var(--dsw-alias-label-tertiary);font-size:14px;line-height:24px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:auto;display:inline-block;vertical-align:middle;padding-left:8px}",
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
		var roleDiagLogged = false;
		function nodeRoleOf(node) {
			if (node === undefined || node === null) return null;
			if (!roleDiagLogged) {
				roleDiagLogged = true;
				console.log("[thinkmeter] first node seen:", node.kind, "blocks:", Array.isArray(node.data && node.data.blocks) ? node.data.blocks.map(function(b){return b && b.kind}).join(",") : "none");
			}
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

		/** Settings footer: the running DSH version (served by our host half). */
		function DshVersionRow() {
			var state = React.useState("");
			var version = state[0];
			var setVersion = state[1];
			React.useEffect(
				function () {
					var cancelled = false;
					try {
						fetch("/plugins/dsh-thinkmeter/version")
							.then(function (r) {
								return r.ok ? r.json() : null;
							})
							.then(function (data) {
								if (!cancelled && data !== null && typeof data.version === "string") {
									setVersion(data.version);
								}
							})
							.catch(function () {});
					} catch (e) {}
					return function () {
						cancelled = true;
					};
				},
				[],
			);
			if (version === "") return null;
			return React.createElement(
				"div",
				{ className: "tkver-row" },
				"DeepSeek Harness " + version,
			);
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

		/**
		 * Standalone think+text step (no chain above it): a card styled like the
		 * fold cards — official Think DisclosureRow with duration & tokens in
		 * the summary, plus the step's text rendered below.
		 */
		function SoloCard(props) {
			var node = props.node;
			var data = node !== undefined && node !== null ? node.data : undefined;
			// Live ticker for the running case.
			var running = data !== undefined && data !== null && data.status === "running";
			var tickState = React.useState(0);
			React.useEffect(
				function () {
					if (!running) return;
					var id = setInterval(function () {
						tickState[1](function (v) {
							return v + 1;
						});
					}, 500);
					return function () {
						clearInterval(id);
					};
				},
				[running],
			);
			var tokens = thinkTokensOf(data);
			var ms = thinkMsOf(data);
			if (running && data !== undefined && data !== null && typeof data.time === "number") {
				var secs = (Date.now() - data.time) / 1000;
				if (ms <= 0 && secs > 0) ms = secs * 1000;
			}
			var meta = "Think " + (ms > 0 ? (Math.round(ms / 100) / 10).toFixed(1) + "s" : "") + " · " + fmt(Math.round(tokens)) + " tokens";
			var fold = React.createElement(ThinkFold, { data: data, meta: meta });
			var blocks = data !== undefined && data !== null && Array.isArray(data.blocks) ? data.blocks : [];
			var children = [];
			// The think disclosure gets its OWN bordered box; the answer text
			// renders below it as normal message text (no shared card border).
			if (fold !== null) children.push(React.createElement("div", { key: "box", className: "tkgrp-card" }, fold));
			if (fold === null && blocks.length === 0) return null;
			for (var i = 0; i < blocks.length; i++) {
				var block = blocks[i];
				if (block === undefined || block === null) continue;
				if (block.kind === "text" && typeof block.text === "string" && block.text.trim() !== "") {
					var el = renderTextBlock("t" + i, block.text.replace(/^\n+/, ""), running);
					if (el !== null) children.push(el);
				}
			}
			if (children.length === 0) return null;
			return React.createElement("div", { className: "tkgrp-root" }, children);
		}

		/** One round entry, shared by the assistant-step and tool-call seats. */
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
				// Standalone divider (no chain above to merge into): card-styled
				// think + text, consistent with the fold cards.
				if (run.role === "solo") {
					return React.createElement(SoloCard, { node: node });
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
			// Independent per-fold expansion.
			var openState = React.useState(false);
			var open = openState[0];
			var setOpen = openState[1];
			var onToggle = function () {
				setOpen(function (v) {
					return !v;
				});
			};
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
			// Collapsed state shows ONLY the meta (duration/tokens) — never the
			// reasoning line, so no content leaks before expanding.
			var summaryLine = props.meta !== undefined && props.meta !== null ? props.meta : "";
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
			// (each Think fold manages its own expansion state)
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

		function apply(ctx) {
			var slots = ctx.get("slots");
			if (slots === undefined) {
				console.warn("[thinkmeter] apply: slots service not available — plugin will not register");
				return;
			}
			slotsRef = slots;
			var disposeStyle = insertStyle();
			console.log("[thinkmeter] v" + "0.9.1" + " loaded, slots:", typeof slots.register === "function" ? "OK" : "BROKEN");

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
			var disposeVersion = slots.inject("settings.general.item", function () {
				return slots.register(
					{ name: "settings.general.item", id: "thinkmeter-dsh-version", order: 999, label: "DSH 版本" },
					DshVersionRow,
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
						disposeSettings && disposeSettings();
					} catch (e) {}
					try {
						disposeVersion && disposeVersion();
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
		exports.inject = ["slots"];
		return module.exports;
	},
});
