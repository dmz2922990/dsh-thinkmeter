/**
 * dsh-thinkmeter host half.
 * Registers a tiny read-only route serving the running DSH version, consumed
 * by the Settings → General footer row in the browser half.
 */

import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

function dshVersion() {
	const candidates = ["@deepseek-ai/dsh/package.json", "dsh/package.json"]
	for (const spec of candidates) {
		try {
			const pkg = require(spec)
			if (pkg !== null && typeof pkg === "object" && typeof pkg.version === "string") {
				return pkg.version
			}
		} catch {}
	}
	return "unknown"
}

export const inject = ["webServer"]

export function apply(ctx) {
	const version = dshVersion()
	ctx.effect(() =>
		ctx.webServer.register({
			kind: "exact",
			path: "/plugins/dsh-thinkmeter/version",
			handler: async (req, res) => {
				if (req.method !== "GET" && req.method !== "HEAD") {
					res.writeHead(405)
					res.end()
					return
				}
				res.setHeader("content-type", "application/json")
				res.end(JSON.stringify({ version }))
			},
		}),
		"thinkmeter: version route",
	)
}
