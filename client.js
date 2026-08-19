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
			".jk-rail{position:fixed;width:12px;pointer-events:auto;z-index:21}",
			".jk-dot{position:absolute;left:3px;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-caption);cursor:pointer;transform:translateY(-50%);transition:width .12s ease,height .12s ease,background .12s ease}",
			".jk-dot:hover,.jk-dot-active{width:8px;height:8px;left:2px;background:var(--dsw-alias-label-secondary)}",
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
			return false;
		}

		function toggleRun(run) {
			var open = runOpen(run);
			for (var i = 0; i < run.nodes.length; i++) {
				if (open) expandedRuns.delete(run.nodes[i].key);
				else expandedRuns.add(run.nodes[i].key);
			}
			if (open) expandedRuns.delete(run.firstKey);
			else expandedRuns.add(run.firstKey);
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
				var childKit = Object.assign({}, kit, {
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
		 * Whether an assistant step carries reasoning text (a think output).
		 * Every such step anchors its own round card; its think output text is
		 * the always-visible divider between cards.
		 */
		function hasReasoningText(node) {
			if (node.kind !== "assistant-step") return false;
			var data = node.data;
			if (data === undefined || data === null) return false;
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];
			for (var i = 0; i < blocks.length; i++) {
				var b = blocks[i];
				if (b !== undefined && b !== null && b.kind === "reasoning" && typeof b.text === "string" && b.text.trim() !== "") {
					return true;
				}
			}
			return false;
		}

		/**
		 * Round model — each think output divides the cards:
		 *  - a reasoning assistant step anchors a round = [step, following
		 *    tool-call nodes up to the next reasoning step];
		 *  - tool-call nodes attach to the nearest preceding reasoning step, or
		 *    anchor a tool-only round when no reasoning precedes them.
		 */
		function roundRunOf(nodes, selfKey) {
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
			var selfThink = hasReasoningText(list[i]);
			var selfTool = list[i].kind === "tool-call";
			if (!selfThink && !selfTool) return null;
			var anchor = i;
			if (selfTool) {
				// Attach to the nearest preceding reasoning step across any run
				// of tools; otherwise anchor a tool-only round at the first tool.
				var j = i;
				while (j > 0 && list[j - 1].kind === "tool-call") j--;
				if (j > 0 && hasReasoningText(list[j - 1])) anchor = j - 1;
				else anchor = j;
			}
			var s0 = anchor;
			var e0 = s0;
			while (e0 + 1 < list.length && list[e0 + 1].kind === "tool-call") e0++;
			if (s0 !== i) return { first: false };
			var runNodes = [];
			var anyRunning = false;
			var toolCount = 0;
			var thinkTokens = 0;
			var thinkMs = 0;
			if (hasReasoningText(list[s0])) {
				thinkTokens = thinkTokensOf(list[s0].data);
				thinkMs = thinkMsOf(list[s0].data);
				if (list[s0].data !== undefined && list[s0].data !== null && list[s0].data.status === "running") anyRunning = true;
			}
			for (var k = s0; k <= e0; k++) {
				var nd = list[k];
				if (nd.kind === "tool-call") {
					toolCount++;
					var root = nd.data && nd.data.root;
					// Settled blocks carry kind 'tool-result'; running blocks have no kind.
					if (!(root !== undefined && root !== null && root.kind === "tool-result")) anyRunning = true;
				}
				runNodes.push(nd);
			}
			return {
				first: true,
				firstKey: list[s0].key,
				count: toolCount,
				running: anyRunning,
				thinkTokens: thinkTokens,
				thinkMs: thinkMs,
				nodes: runNodes,
			};
		}

		/** The shipped tool-call renderer shadowed by ours (same slot, priority 0). */
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
						return e.component;
					}
				}
			} catch (err) {}
			return null;
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
				return roundRunOf(snapshot && snapshot.chat && snapshot.chat.nodes, node.key);
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
			if (run === null) {
				// Outside every round: plain per-node rendering.
				if (node.kind === "assistant-step") return AssistantStep(props);
				return null;
			}
			// Hidden members render a marker element; the :has() CSS rule below
			// removes the whole flow wrapper from layout (flex gap included),
			// independent of :empty support.
			if (!run.first) {
				return hiddenMarker();
			}
			return React.createElement(RoundView, { props: props, run: run });
		}

		/** Layout-invisible marker rendered by hidden round members. */
		function hiddenMarker() {
			return React.createElement("div", { className: "tkgrp-hidden", style: { display: "none" } });
		}

		/**
		 * One round: collapsed card (Think summary + tool count) on top; the
		 * anchor step's text blocks are the always-visible divider, while its
		 * reasoning and tool-call blocks fold into disclosures (official
		 * components inside).
		 */
		function RoundView(props) {
			var run = props.run;
			var propsSource = props.props;
			// Disclosures, collapsed by default.
			var thinkState = React.useState(false);
			var thinkOpen = thinkState[0];
			var setThinkOpen = thinkState[1];
			var toolState = React.useState(false);
			var toolBlocksOpen = toolState[0];
			var setToolBlocksOpen = toolState[1];
			// Live ticker while the anchor step is running: keeps the elapsed
			// seconds and the streamed token estimate updating in the header.
			var tickState = React.useState(0);
			var setTick = tickState[1];
			var anchor = run.nodes[0];
			var anchorData = anchor !== undefined && anchor !== null ? anchor.data : undefined;
			var running = anchorData !== undefined && anchorData !== null && anchorData.status === "running";
			React.useEffect(
				function () {
					if (!running) return;
					var id = setInterval(function () {
						setTick(function (v) {
							return v + 1;
						});
					}, 500);
					return function () {
						clearInterval(id);
					};
				},
				[running],
			);
			var isOpen = runOpen(run);
			// Live header values while running: elapsed wall-clock seconds and
			// the reasoning-text estimate (usage is only reported on settle).
			var liveSecs = running && typeof anchorData.time === "number" ? (Date.now() - anchorData.time) / 1000 : null;
			var headerTokens = running ? thinkTokensOf(anchorData) : run.thinkTokens;
			var headerMs = running && liveSecs !== null ? liveSecs * 1000 : run.thinkMs;
			// Header: [Think duration & tokens, tool-call count]
			var parts = [];
			if (headerTokens > 0) {
				var duration = running ? (Math.round(headerMs / 100) / 10).toFixed(1) + "s" : fmtDuration(run.thinkMs);
				parts.push("Think" + (duration !== "" ? " " + duration : "") + " · " + fmt(headerTokens) + " tokens");
			}
			if (run.count > 0) parts.push(run.count + " 次工具调用");
			if (parts.length === 0) parts.push("运行中");
			var header = parts.join("，") + (run.running ? " · 运行中" : "");
			var children = [];
			// The card renders while running (immediate, live header) and for
			// every tool-bearing round; a settled think-only round (final
			// answer) renders the fold + text without a card.
			if (running || run.count > 0) {
				children.push(
					React.createElement(
						"div",
						{
							key: "head",
							className: "tkgrp-row",
							"data-state": run.running ? "running" : "ok",
							role: "button",
							tabIndex: 0,
							title: isOpen ? "点击折叠" : "点击展开原始工具卡片",
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
			}
			// Per-block handling of the anchor step: text blocks are the visible
			// divider; reasoning and tool-call blocks fold into disclosures.
			if (hasReasoningText(anchor)) {
				var blocks = Array.isArray(anchorData !== undefined && anchorData !== null ? anchorData.blocks : []) ? anchorData.blocks : [];
				var outputs = [];
				var answers = [];
				var toolBlocks = [];
				for (var b = 0; b < blocks.length; b++) {
					var block = blocks[b];
					if (block === undefined || block === null) continue;
					if (block.kind === "reasoning" && typeof block.text === "string" && block.text.trim() !== "") {
						outputs.push(block.text.replace(/^\n+/, ""));
					} else if (block.kind === "text" && typeof block.text === "string" && block.text.trim() !== "") {
						var answer = renderTextBlock("ans" + b, block.text.replace(/^\n+/, ""), false);
						if (answer !== null) answers.push(answer);
					} else if (block.kind === "tool-call") {
						toolBlocks.push(block);
					}
				}
				// Reasoning disclosure — the OFFICIAL think row (DisclosureRow +
				// Think icon, same component family as the shipped ReasoningRow).
				// While the step is running, the collapsed row streams the latest
				// reasoning line with a sweep animation (shipped behavior).
				if (outputs.length > 0) {
					var thinkChildren = [];
					for (var o = 0; o < outputs.length; o++) {
						thinkChildren.push(
							React.createElement("div", { key: "out" + o, className: "tkgrp-out" }, outputs[o]),
						);
					}
					var thinkRunning = anchorData !== undefined && anchorData !== null && anchorData.status === "running";
					var thinkText = outputs[outputs.length - 1];
					var summaryLine = thinkRunning ? latestLine(thinkText) : firstLine(thinkText);
					var prims = getPrimitives();
					if (prims !== null && prims.DisclosureRow !== undefined) {
						children.push(
							React.createElement(
								"div",
								{ key: "think", className: "tkgrp-think", "data-state": thinkRunning ? "running" : "ok" },
								React.createElement(prims.DisclosureRow, {
									rowClassName: "tkgrp-thinkrow",
									leadingClassName: "tkgrp-thinkleading",
									titleClassName: "tkgrp-thinktitle",
									chevronClassName: "tkgrp-thinkchevron",
									icon: React.createElement(prims.IconThinkOutline14, { size: 14 }),
									title: "Think",
									open: thinkOpen,
									expandable: true,
									expandOnRowClick: true,
									onToggle: function () {
										setThinkOpen(function (v) {
											return !v;
										});
									},
									collapsedContent: React.createElement("span", {
										className: "tkgrp-think-summary",
										"data-follow-end": thinkRunning || undefined,
									}, summaryLine),
								}, thinkChildren),
							),
						);
					} else {
						children.push(
							React.createElement(
								"div",
								{ key: "think", className: "tkgrp-think" },
								React.createElement(
									"div",
									{
										className: "tkgrp-outrow",
										role: "button",
										tabIndex: 0,
										title: thinkOpen ? "收起思考输出" : "展开思考输出",
										onClick: function (e) {
											e.stopPropagation();
											setThinkOpen(function (v) {
												return !v;
											});
										},
										onKeyDown: function (e) {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												e.stopPropagation();
												setThinkOpen(function (v) {
													return !v;
												});
											}
										},
									},
									React.createElement("span", { className: "tkgrp-chevron", "data-open": thinkOpen || undefined }, "▸"),
									React.createElement("span", { className: "tkgrp-outlabel" }, "思考输出"),
								),
								thinkOpen ? thinkChildren : null,
							),
						);
					}
				}
				// Tool-call block disclosure: only when the round has no separate
				// tool nodes (those already render official cards on expansion),
				// to avoid double-drawing the same calls.
				if (toolBlocks.length > 0 && run.count === 0) {
					var toolBlockEls = [];
					var shippedBlocks = findShippedToolComponent();
					var kitBlocks = kitOf(propsSource);
					for (var tb = 0; tb < toolBlocks.length; tb++) {
						var block2 = toolBlocks[tb];
						if (shippedBlocks !== null) {
							var delegatedProps2 = Object.assign({}, propsSource, {
								node: { data: { root: block2 } },
								renderSlot: function (key, owner, opts) {
									return dispatchSlot(key, owner, opts, kitBlocks);
								},
							});
							toolBlockEls.push(
								React.createElement(shippedBlocks, Object.assign({}, delegatedProps2, { key: "tb" + tb })),
							);
						}
					}
					children.push(
						React.createElement(
							"div",
							{ key: "toolblocks", className: "tkgrp-think" },
							React.createElement(
								"div",
								{
									className: "tkgrp-outrow",
									role: "button",
									tabIndex: 0,
									title: toolBlocksOpen ? "收起工具调用" : "展开工具调用",
									onClick: function (e) {
										e.stopPropagation();
										setToolBlocksOpen(function (v) {
											return !v;
										});
									},
									onKeyDown: function (e) {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											e.stopPropagation();
											setToolBlocksOpen(function (v) {
												return !v;
											});
										}
									},
								},
								React.createElement("span", { className: "tkgrp-chevron", "data-open": toolBlocksOpen || undefined }, "▸"),
								React.createElement("span", { className: "tkgrp-outlabel" }, "工具调用 (" + toolBlocks.length + ")"),
							),
							toolBlocksOpen ? toolBlockEls : null,
						),
					);
				}
				for (var a = 0; a < answers.length; a++) {
					children.push(answers[a]);
				}
			}
			// Tool cards come AFTER the think fold and text, matching the
			// chronological order (think -> tools).
			if (isOpen && run.count > 0) {
				// Tool members delegate to the SHIPPED renderer (its toolview
				// child slot goes through our registry-backed dispatch).
				var shipped = findShippedToolComponent();
				var kit = kitOf(propsSource);
				for (var i = 0; i < run.nodes.length; i++) {
					var n = run.nodes[i];
					if (n.kind !== "tool-call") continue;
					if (shipped !== null) {
						var delegatedProps = Object.assign({}, propsSource, {
							renderSlot: function (key, owner, opts) {
								return dispatchSlot(key, owner, opts, kit);
							},
						});
						children.push(
							React.createElement(shipped, Object.assign({}, delegatedProps, { key: n.key, node: n })),
						);
					}
				}
				if (shipped === null && run.count > 0) {
					children.push(
						React.createElement("div", { key: "fallback", className: "tkgrp-summary" }, "(原始渲染器不可用)"),
					);
				}
			}
			var rootClass = "tkgrp-root" + (running || run.count > 0 ? " tkgrp-card" : "");
			return React.createElement(
				"div",
				{ className: rootClass, "data-open": isOpen || undefined },
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

		/** Cached visible user-node summary: by nodes identity, or by content
		 *  signature when the store Map is recreated on every snapshot. */
		var userCache = { nodes: null, list: null, sig: null };

		function userEntries(nodes) {
			if (nodes === undefined || nodes === null || typeof nodes.values !== "function") return [];
			if (userCache.nodes === nodes && userCache.list !== null) return userCache.list;
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
			if (userCache.sig === sig && userCache.list !== null) {
				userCache.nodes = nodes;
				return userCache.list;
			}
			userCache = { nodes: nodes, list: list, sig: sig };
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
		function JumpRail() {
			React.useState(false);
			var hoverState = React.useState(-1);
			var hoverIdx = hoverState[0];
			var setHoverIdx = hoverState[1];
			React.useEffect(
				function () {
					var fn = function () {
						setHoverIdx(-1);
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
			if (jumpEntries.length === 0 || jumpContainer === null) return null;
			var rect = jumpContainer.getBoundingClientRect();
			if (rect.height <= 0 || rect.width <= 0) return null;
			var railTop = rect.top;
			var railHeight = rect.height;
			// Sit clear of the browser scrollbar: its width is the difference
			// between the container's offset and client widths.
			var scrollbar = Math.max(0, jumpContainer.offsetWidth - jumpContainer.clientWidth);
			var railLeft = rect.right - scrollbar - 14;
			var dots = [];
			var tip = null;
			for (var i = 0; i < jumpEntries.length; i++) {
				var entry = jumpEntries[i];
				var top = railTop + entry.pct * (railHeight - 10);
				dots.push(
					React.createElement("div", {
						key: entry.key,
						className: "jk-dot" + (i === hoverIdx ? " jk-dot-active" : ""),
						style: { top: top },
						title: "",
						onMouseEnter: function (idx) {
							return function () {
								setHoverIdx(idx);
							};
						}(i),
						onMouseLeave: function () {
							setHoverIdx(-1);
						},
						onClick: function (key) {
							return function () {
								var el = document.querySelector('[data-chat-anchor-key="' + key + '"]');
								if (el !== null && typeof el.scrollIntoView === "function") {
									el.scrollIntoView({ behavior: "smooth", block: "start" });
								}
							};
						}(entry.key),
					}),
				);
				if (i === hoverIdx) {
					tip = React.createElement(
						"div",
						{ className: "jk-tip", style: { top: top - 8, left: railLeft - 296 } },
						React.createElement("div", { className: "jk-tip-text" }, entry.text || "(空)"),
					);
				}
			}
			return React.createElement(
				"div",
				{ className: "jk-rail", style: { top: railTop, left: railLeft, height: railHeight } },
				dots,
				tip,
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
