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
			".tkcnt-row{display:flex;align-items:center;gap:8px;min-height:24px;font-size:14px;line-height:24px;cursor:pointer;user-select:none;position:relative;overflow:hidden}",
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
			".tkgrp-row{display:flex;align-items:center;gap:8px;min-height:24px;font-size:14px;line-height:24px;cursor:pointer;user-select:none;position:relative;overflow:hidden}",
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
				{ className: "tkcnt-think" },
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

		/**
		 * Global collapse state: while true (and the preference on), the tool-call
		 * shadow is registered and groups render as count headers. Expanding
		 * unregisters the shadow so the SHIPPED renderer shows original cards;
		 * the dock chip re-registers it.
		 */
		var toolsCollapsed = true;
		var expandListeners = new Set();

		function setToolsCollapsed(value) {
			toolsCollapsed = value;
			for (var fn of expandListeners) {
				try {
					fn();
				} catch (e) {}
			}
			notifyPref(); // syncShadow listens on the same channel
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
		 * Compute the consecutive visible tool-call run around `selfKey`.
		 * Returns the run's live node references for delegated rendering.
		 */
		function toolRunOf(nodes, selfKey) {
			if (nodes === undefined || nodes === null || typeof nodes.values !== "function") return null;
			var list = sortedVisible(nodes);
			var i = -1;
			for (var j = 0; j < list.length; j++) {
				if (list[j].key === selfKey) {
					i = j;
					break;
				}
			}
			if (i === -1 || list[i].kind !== "tool-call") return null;
			var s0 = i;
			while (s0 > 0 && list[s0 - 1].kind === "tool-call") s0--;
			var e0 = i;
			while (e0 + 1 < list.length && list[e0 + 1].kind === "tool-call") e0++;
			if (s0 !== i) return { first: false };
			var runNodes = [];
			var anyRunning = false;
			for (var k = s0; k <= e0; k++) {
				var nd = list[k];
				var root = nd.data && nd.data.root;
				// Settled blocks carry kind 'tool-result'; running blocks have no kind.
				if (!(root !== undefined && root !== null && root.kind === "tool-result")) anyRunning = true;
				runNodes.push(nd);
			}
			return { first: true, firstKey: list[s0].key, count: e0 - s0 + 1, running: anyRunning, nodes: runNodes };
		}

		function ToolGroupEntry(props) {
			var node = props.node;
			var useSession = props.useSession;
			if (typeof useSession !== "function" || node === undefined) return null;
			// All hooks run unconditionally: a node may transition between
			// first-of-run and non-first across renders, and React requires a
			// stable hook count.
			var run = useSession(function (snapshot) {
				return toolRunOf(snapshot && snapshot.chat && snapshot.chat.nodes, node.key);
			});
			React.useState(false);
			if (run === null || !run.first) return null;
			var header = run.count + " 次工具调用" + (run.running ? " · 运行中" : "");
			// Expanding unregisters our shadow entirely, so the SHIPPED renderer
			// takes over and the group shows the original tool cards.
			return React.createElement(
				"div",
				{
					className: "tkgrp-row",
					"data-state": run.running ? "running" : "ok",
					role: "button",
					tabIndex: 0,
					title: "点击展开原始工具卡片",
					onClick: function (e) {
						e.stopPropagation();
						setToolsCollapsed(false);
					},
					onKeyDown: function (e) {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							setToolsCollapsed(false);
						}
					},
				},
				React.createElement("span", { className: "tkgrp-chevron" }, "▸"),
				React.createElement("span", { className: "tkgrp-title" }, "Tool calls"),
				React.createElement("span", { className: "tkgrp-summary" }, header),
			);
		}

		/** Re-collapse chip above the composer, visible while tools are expanded. */
		function RecollapseDockRow() {
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
			if (!readPref() || toolsCollapsed) return null;
			return React.createElement(
				"div",
				{ className: "tkgrp-dock" },
				React.createElement(
					"button",
					{
						className: "tkgrp-dock-btn",
						onClick: function () {
							setToolsCollapsed(true);
						},
					},
					"▸ 重新折叠工具调用",
				),
			);
		}

		function CollapseToolsSettingRow() {
			var on = usePref();
			return React.createElement(
				"div",
				{ className: "tkset-row" },
				React.createElement(
					"div",
					{ className: "tkset-info" },
					React.createElement("div", { className: "tkset-label" }, "折叠工具调用"),
					React.createElement(
						"div",
						{ className: "tkset-desc" },
						"开启后，连续的工具调用折叠为分组框并显示数量；点击分组框展开为原始工具卡片，再用输入框上方的按钮重新折叠",
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
			var disposeStyle = insertStyle();

			// ThinkMeter: always-on shadow of the shipped assistant-step renderer.
			var disposeThink = slots.inject("conversation.chat.node", function () {
				// priority -1 shadows the shipped assistant-step entry at priority 0 (lowest renders)
				return slots.register({ name: "conversation.chat.node", key: "assistant-step", priority: -1 }, AssistantStep);
			});

			// Settings row (Settings → General), always registered.
			var disposeSettings = slots.inject("settings.general.item", function () {
				return slots.register(
					{ name: "settings.general.item", id: "thinkmeter-collapse-tools", order: 100, label: "折叠工具调用" },
					CollapseToolsSettingRow,
				);
			});

			// Re-collapse chip above the composer (renders only while expanded).
			var disposeDock = slots.inject("conversation.input.dock", function () {
				return slots.register(
					{ name: "conversation.input.dock", id: "thinkmeter-recollapse", order: 100, label: "重新折叠工具调用" },
					RecollapseDockRow,
				);
			});

			// Tool-call group shadow: registered only while the preference is on
			// AND the user has not expanded; unregistering lets the shipped
			// renderer show the ORIGINAL tool cards.
			var shadowDisp = null;
			function syncShadow() {
				var want = readPref() && toolsCollapsed;
				if (want && shadowDisp === null) {
					shadowDisp = slots.inject("conversation.chat.node", function () {
						return slots.register({ name: "conversation.chat.node", key: "tool-call", priority: -1 }, ToolGroupEntry);
					});
				} else if (!want && shadowDisp !== null) {
					try {
						shadowDisp();
					} catch (e) {}
					shadowDisp = null;
				}
			}
			prefListeners.add(syncShadow);
			expandListeners.add(syncShadow);
			syncShadow();

			ctx.effect(function () {
				return function () {
					prefListeners.delete(syncShadow);
					expandListeners.delete(syncShadow);
					if (shadowDisp !== null) {
						try {
							shadowDisp();
						} catch (e) {}
						shadowDisp = null;
					}
					try {
						disposeDock && disposeDock();
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
				};
			});
		}

		exports.apply = apply;
		return module.exports;
	},
});
