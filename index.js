/**
 * dsh-thinkmeter host half.
 * Registers a tiny read-only route serving the running DSH version, consumed
 * by the Settings → General footer row in the browser half.
 */

import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { homedir } from "node:os"

const require = createRequire(import.meta.url)

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"))
	} catch {
		return null
	}
}

function looksLikeDsh(pkg) {
	return pkg !== null && typeof pkg === "object" && /dsh|deepseek-harness/i.test(String(pkg.name ?? ""))
}

/**
 * Resolve the running DSH version. The launcher package is usually NOT on the
 * profile's resolution path, so: resolve any in-box package, read its version,
 * and try walking up to the installation root (whose package.json carries the
 * CLI version `dsh -V` prints).
 */
function dshVersion() {
	const specs = [
		"@deepseek-ai/dsh/package.json",
		"@deepseek-ai/dsh-base/package.json",
		"@deepseek-ai/dsh-client-runtime/package.json",
		"@deepseek-ai/dsh-client-ui-conversation/package.json",
		"@deepseek-ai/cordis/package.json",
	]
	// Resolution anchors: our own location, the running dsh CLI entry, and the
	// DSH home flat-fallback directory — whichever sits inside the installation.
	const dshHome = process.env.DSH_HOME ?? join(homedir(), ".dsh")
	const anchors = [
		require,
		createRequire(process.argv[1] ?? process.argv[0]),
		createRequire(join(dshHome, "profiles", "node_modules", "_anchor.js")),
	]
	for (const spec of specs) {
		for (const anchor of anchors) {
		try {
			const pkgPath = anchor.resolve(spec)
			const pkg = readJson(pkgPath)
			if (pkg === null || typeof pkg.version !== "string") continue
			// <install>/node_modules/@deepseek-ai/<pkg>/package.json
			//   -> <install>/package.json (the launcher/CLI package)
			const rootPkg = readJson(resolve(dirname(pkgPath), "../../../package.json"))
			if (looksLikeDsh(rootPkg) && typeof rootPkg.version === "string") {
				return rootPkg.version
			}
			if (looksLikeDsh(pkg)) {
				return pkg.version
			}
		} catch {}
		}
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
