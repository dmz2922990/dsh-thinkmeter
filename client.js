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
		 * A node links a tool-call chain when it is a tool call, or the
		 * assistant step that ISSUED tool calls (its blocks contain tool-call
		 * entries; such steps interleave between the tool rows in real turns).
		 * Think-only and final-answer steps are NOT links: they keep rendering
		 * their own cards.
		 */
		function chainLink(node) {
			if (node.kind === "tool-call") return true;
			if (node.kind !== "assistant-step") return false;
			var data = node.data;
			if (data === undefined || data === null) return false;
			var blocks = Array.isArray(data.blocks) ? data.blocks : [];
			for (var i = 0; i < blocks.length; i++) {
				var b = blocks[i];
				if (b !== undefined && b !== null && b.kind === "tool-call") return true;
			}
			return false;
		}

		/**
		 * Compute the consecutive tool-call chain around `selfKey`.
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
			if (i === -1 || !chainLink(list[i])) return null;
			var s0 = i;
			while (s0 > 0 && chainLink(list[s0 - 1])) s0--;
			var e0 = i;
			while (e0 + 1 < list.length && chainLink(list[e0 + 1])) e0++;
			if (s0 !== i) return { first: false };
			var runNodes = [];
			var anyRunning = false;
			var toolCount = 0;
			for (var k = s0; k <= e0; k++) {
				var nd = list[k];
				if (nd.kind === "tool-call") {
					toolCount++;
					var root = nd.data && nd.data.root;
					// Settled blocks carry kind 'tool-result'; running blocks have no kind.
					if (!(root !== undefined && root !== null && root.kind === "tool-result")) anyRunning = true;
				} else if (nd.data !== undefined && nd.data !== null && nd.data.status === "running") {
					anyRunning = true;
				}
				runNodes.push(nd);
			}
			return { first: true, firstKey: list[s0].key, count: toolCount, running: anyRunning, nodes: runNodes };
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
						e.component !== ToolGroupEntry
					) {
						return e.component;
					}
				}
			} catch (err) {}
			return null;
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
			if (run === null) return null;
			// Hidden members render a marker element; the :has() CSS rule below
			// removes the whole flow wrapper from layout (flex gap included),
			// independent of :empty support.
			if (!run.first) {
				return hiddenMarker();
			}
			return GroupCard(props, run);
		}

		/** Layout-invisible marker rendered by hidden chain members. */
		function hiddenMarker() {
			return React.createElement("div", { className: "tkgrp-hidden", style: { display: "none" } });
		}

		/** The collapsed/expanded group card for one tool-call chain. */
		function GroupCard(props, run) {
			var isOpen = expandedRuns.has(run.firstKey);
			var header = run.count + " 次工具调用" + (run.running ? " · 运行中" : "");
			var children = [
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
					React.createElement("span", { className: "tkgrp-title" }, "Tool calls"),
					React.createElement("span", { className: "tkgrp-summary" }, header),
				),
			];
			if (isOpen) {
				// Tool nodes delegate to the SHIPPED renderer (its toolview child
				// slot goes through our registry-backed dispatch); interleaved
				// assistant steps render through our own AssistantStep.
				var shipped = findShippedToolComponent();
				var kit = kitOf(props);
				for (var i = 0; i < run.nodes.length; i++) {
					var n = run.nodes[i];
					if (n.kind === "tool-call") {
						if (shipped !== null) {
							var delegatedProps = Object.assign({}, props, {
								renderSlot: function (key, owner, opts) {
									return dispatchSlot(key, owner, opts, kit);
								},
							});
							children.push(
								React.createElement(shipped, Object.assign({}, delegatedProps, { key: n.key, node: n })),
							);
						}
					} else {
						children.push(React.createElement(AssistantStep, { key: n.key, node: n }));
					}
				}
				if (shipped === null && run.count > 0) {
					children.push(
						React.createElement("div", { key: "fallback", className: "tkgrp-summary" }, "(原始渲染器不可用)"),
					);
				}
			}
			return React.createElement(
				"div",
				{ className: "tkgrp-root", "data-open": isOpen || undefined },
				children,
			);
		}

		/**
		 * Assistant-step entry, chain-aware: a step whose blocks issued tool
		 * calls hides inside the tool group (or anchors its card when it starts
		 * the chain); every other step renders the plain think meter.
		 */
		function AssistantStepChainAware(props) {
			var node = props.node;
			var useSession = props.useSession;
			if (typeof useSession !== "function" || node === undefined) return AssistantStep(props);
			// Hooks unconditional (see ToolGroupEntry note).
			var run = useSession(function (snapshot) {
				return toolRunOf(snapshot && snapshot.chat && snapshot.chat.nodes, node.key);
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
			if (run === null) return AssistantStep(props);
			if (!run.first) return hiddenMarker();
			// Only anchor the card when the chain actually has tool calls; a
			// lone issuing step (tools not yet materialized) stays a think card.
			if (run.count === 0) return AssistantStep(props);
			return GroupCard(props, run);
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
					AssistantStepChainAware,
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
							ToolGroupEntry,
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
