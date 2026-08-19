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
			".tkgrp-row{display:flex;align-items:center;gap:8px;min-height:24px;font-size:14px;line-height:24px;cursor:pointer;user-select:none;position:relative;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:4px 12px;background:var(--dsw-alias-bg-base);margin:4px 0 4px 4px;width:fit-content;min-width:180px}",
			".tkgrp-root[data-open] .tkgrp-row{border:none;border-radius:0;padding:0 0 6px;margin:0;background:transparent;min-width:0}",
			"[data-chat-flow-kind=tool-call]:empty{display:none}",
			"[data-chat-flow-kind=assistant-step]:empty{display:none}",
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

		function usePref() {
			var s = React.useState(readPref());
			var on = s[0];
			var setOn = s[1];
			React.useEffect(
				function () {
					var fn = function () {
						setOn(readPref());
					};
					prefListeners.add(fn);
					return function () {
						prefListeners.delete(fn);
					};
				},
				[],
			);
			return on;
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
				} else if (block.kind === "text") {
					children.push(
						React.createElement("div", { key: "t" + i, className: "tkcnt-text" }, typeof block.text === "string" ? block.text : ""),
					);
				}
			}
			if (data.status === "interrupted") {
				children.push(React.createElement("span", { key: "stopped", className: "tkcnt-stopped" }, "Stopped"));
			}
			return React.createElement("div", { className: "tkcnt-root", "data-streaming": running || undefined }, children);
		}

		// ── Collapse tool calls ──

		/** Per-group expansion state (keyed by the run's first node key). */
		var expandedRuns = new Set();
		var expandListeners = new Set();

		function toggleRun(firstKey) {
			if (expandedRuns.has(firstKey)) expandedRuns.delete(firstKey);
			else expandedRuns.add(firstKey);
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
		var runCache = { nodes: null, sorted: null };

		function sortedVisible(nodes) {
			if (runCache.nodes === nodes && runCache.sorted !== null) return runCache.sorted;
			var list = [];
			for (var n of nodes.values()) {
				if (n === undefined || n === null) continue;
				if (n.visibility !== "visible") continue;
				list.push(n);
			}
			list.sort(function (a, b) {
				return a.anchorSeq - b.anchorSeq || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
			});
			runCache = { nodes: nodes, sorted: list };
			return list;
		}

		/**
		 * A node joins a merged collapse group when it is a tool call, or an
		 * assistant step that carries reasoning but no visible text output
		 * (text-bearing assistant steps are real messages and stay separate).
		 */
		function groupable(node) {
			if (node.kind === "tool-call") return true;
			if (node.kind !== "assistant-step") return false;
			var data = node.data;
			if (data === undefined || data === null) return false;
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];
			var hasReasoning = false;
			for (var i = 0; i < blocks.length; i++) {
				var b = blocks[i];
				if (b === undefined || b === null) continue;
				if (b.kind === "reasoning") hasReasoning = true;
				if (b.kind === "text" && typeof b.text === "string" && b.text.trim() !== "") return false;
			}
			return hasReasoning;
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
			if (
				timing === undefined ||
				timing.stepStartTime === null ||
				timing.completedTime === null
			) {
				return 0;
			}
			return Math.max(0, timing.completedTime - timing.stepStartTime);
		}

		function fmtDuration(ms) {
			if (ms <= 0) return "";
			if (ms < 1000) return ms + "ms";
			return (Math.round(ms / 100) / 10).toFixed(1) + "s";
		}

		/**
		 * Compute the consecutive groupable run around `selfKey`, aggregating
		 * think tokens/duration and the tool-call count for the group header.
		 */
		function groupRunOf(nodes, selfKey) {
			if (nodes === undefined || nodes === null || typeof nodes.values !== "function") return null;
			var list = sortedVisible(nodes);
			var i = -1;
			for (var j = 0; j < list.length; j++) {
				if (list[j].key === selfKey) {
					i = j;
					break;
				}
			}
			if (i === -1 || !groupable(list[i])) return null;
			var s0 = i;
			while (s0 > 0 && groupable(list[s0 - 1])) s0--;
			var e0 = i;
			while (e0 + 1 < list.length && groupable(list[e0 + 1])) e0++;
			if (s0 !== i) return { first: false };
			var runNodes = [];
			var anyRunning = false;
			var thinkTokens = 0;
			var thinkMs = 0;
			var toolCount = 0;
			for (var k = s0; k <= e0; k++) {
				var nd = list[k];
				if (nd.kind === "tool-call") {
					toolCount++;
					var root = nd.data && nd.data.root;
					// Settled blocks carry kind 'tool-result'; running blocks have no kind.
					if (!(root !== undefined && root !== null && root.kind === "tool-result")) anyRunning = true;
				} else {
					thinkTokens += thinkTokensOf(nd.data);
					thinkMs += thinkMsOf(nd.data);
					if (nd.data && nd.data.status === "running") anyRunning = true;
				}
				runNodes.push(nd);
			}
			return {
				first: true,
				firstKey: list[s0].key,
				running: anyRunning,
				thinkTokens: thinkTokens,
				thinkMs: thinkMs,
				toolCount: toolCount,
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
						e.component !== MergedGroupEntry
					) {
						return e.component;
					}
				}
			} catch (err) {}
			return null;
		}

		/** Fallback rendering for one run node outside merged grouping. */
		function fallbackNodeRender(props, node) {
			if (node.kind === "assistant-step") {
				return React.createElement(AssistantStep, Object.assign({}, props, { node: node }));
			}
			// tool-call: delegate to the SHIPPED renderer with our registry-backed
			// renderSlot (the framework binding is reserved to the entry that
			// declared the toolview child slot).
			var shipped = findShippedToolComponent();
			if (shipped === null) return null;
			var kit = kitOf(props);
			var delegatedProps = Object.assign({}, props, {
				renderSlot: function (key, owner, opts) {
					return dispatchSlot(key, owner, opts, kit);
				},
			});
			return React.createElement(shipped, Object.assign({}, delegatedProps, { node: node }));
		}

		function MergedGroupEntry(props) {
			var node = props.node;
			var useSession = props.useSession;
			if (typeof useSession !== "function" || node === undefined) return null;
			// All hooks run unconditionally: a node may transition between
			// first-of-run and non-first across renders, and React requires a
			// stable hook count.
			var run = useSession(function (snapshot) {
				return groupRunOf(snapshot && snapshot.chat && snapshot.chat.nodes, node.key);
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
			// Feature off, or a node outside every group (e.g. an assistant step
			// with visible text): render normally. A grouped non-first node is
			// rendered by the group's first node and hides itself here.
			if (!readPref() || run === null) {
				return fallbackNodeRender(props, node);
			}
			if (!run.first) return null;
			var isOpen = expandedRuns.has(run.firstKey);
			// Header: [Think duration & tokens, tool-call count]
			var parts = [];
			if (run.thinkTokens > 0) {
				var duration = fmtDuration(run.thinkMs);
				parts.push("Think" + (duration !== "" ? " " + duration : "") + " · " + fmt(run.thinkTokens) + " tokens");
			}
			if (run.toolCount > 0) parts.push(run.toolCount + " 次工具调用");
			if (parts.length === 0) parts.push("运行中");
			var header = parts.join("，") + (run.running ? " · 运行中" : "");
			var children = [
				React.createElement(
					"div",
					{
						key: "head",
						className: "tkgrp-row",
						"data-state": run.running ? "running" : "ok",
						role: "button",
						tabIndex: 0,
						title: isOpen ? "点击折叠" : "点击展开详情",
						onClick: function (e) {
							e.stopPropagation();
							toggleRun(run.firstKey);
						},
						onKeyDown: function (e) {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								toggleRun(run.firstKey);
							}
						},
					},
					React.createElement("span", { className: "tkgrp-chevron", "data-open": isOpen || undefined }, "▸"),
					React.createElement("span", { className: "tkgrp-title" }, "Think & Tools"),
					React.createElement("span", { className: "tkgrp-summary" }, header),
				),
			];
			if (isOpen) {
				for (var i = 0; i < run.nodes.length; i++) {
					var n = run.nodes[i];
					if (n.key === node.key) {
						// This node: reuse already-computed fallback rendering.
						children.push(
							React.createElement(
								"div",
								{ key: n.key },
								fallbackNodeRender(props, n),
							),
						);
					} else {
						children.push(
							React.createElement(GroupNodeView, { key: n.key, props: props, node: n }),
						);
					}
				}
			}
			return React.createElement(
				"div",
				{ className: "tkgrp-root", "data-open": isOpen || undefined },
				children,
			);
		}

		/** Render one non-self run node inside an expanded group. */
		function GroupNodeView(props) {
			return fallbackNodeRender(props.props, props.node);
		}

		function CollapseToolsSettingRow() {
			var on = usePref();
			return React.createElement(
				"div",
				{ className: "tkset-row" },
				React.createElement(
					"div",
					{ className: "tkset-info" },
					React.createElement("div", { className: "tkset-label" }, "折叠 Think 与工具调用"),
					React.createElement(
						"div",
						{ className: "tkset-desc" },
						"开启后，连续的思考与工具调用合并为一个分组框，显示 Think 时长、token 数与工具调用次数；点击展开原始内容，再次点击折叠",
					),
				),
				React.createElement(
					"button",
					{
						className: "tkset-toggle" + (on ? " is-on" : ""),
						role: "switch",
						"aria-checked": on,
						onClick: function () {
							writePref(!on);
						},
					},
					React.createElement("span", { className: "tkset-knob" }),
				),
			);
		}

		function apply(ctx) {
			var slots = ctx.get("slots");
			if (slots === undefined) return;
			slotsRef = slots;
			var disposeStyle = insertStyle();

			// Think meter + merged groups: the assistant-step shadow is always on;
			// when the collapse preference is off it renders the plain think meter.
			var disposeThink = slots.inject("conversation.chat.node", function () {
				// priority -1 shadows the shipped assistant-step entry at priority 0 (lowest renders)
				return slots.register(
					{ name: "conversation.chat.node", key: "assistant-step", priority: -1, locale: "conversation" },
					MergedGroupEntry,
				);
			});

			// Settings row (Settings → General), always registered.
			var disposeSettings = slots.inject("settings.general.item", function () {
				return slots.register(
					{ name: "settings.general.item", id: "thinkmeter-collapse-tools", order: 100, label: "折叠工具调用" },
					CollapseToolsSettingRow,
				);
			});

			// Tool-call shadow: registered only while the preference is on, so
			// turning it off restores the shipped tool cards and plain grouping.
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
							MergedGroupEntry,
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
