#!/usr/bin/env node

/**
 * Post-build script to compress prerendered HTML files and register them
 * in Nitro's server asset map so they're served with proper encoding.
 *
 * This is needed because Nitro builds its asset map BEFORE prerendering,
 * so prerendered HTML files (and their compressed versions) aren't included.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, ".output/public");
const serverBundlePath = path.join(rootDir, ".output/server/index.mjs");

async function compressFile(filePath) {
	const content = await fs.promises.readFile(filePath);
	const fileName = path.basename(filePath);

	// Skip files smaller than 1KB
	if (content.length < 1024) {
		console.log(`  Skipping ${fileName} (too small: ${content.length} bytes)`);
		return null;
	}

	// Compress with gzip
	const gzipPath = `${filePath}.gz`;
	const gzipContent = await new Promise((resolve, reject) => {
		zlib.gzip(content, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
	await fs.promises.writeFile(gzipPath, gzipContent);
	const gzipSize = gzipContent.length;

	// Compress with brotli
	const brPath = `${filePath}.br`;
	const brContent = await new Promise((resolve, reject) => {
		zlib.brotliCompress(content, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
	await fs.promises.writeFile(brPath, brContent);
	const brSize = brContent.length;

	console.log(
		`  ✓ ${fileName}: ${content.length} → gzip: ${gzipSize} (${Math.round((gzipSize / content.length) * 100)}%), brotli: ${brSize} (${Math.round((brSize / content.length) * 100)}%)`,
	);

	return { gzipSize, brSize, originalSize: content.length };
}

async function findHtmlFiles(dir) {
	const files = [];
	const entries = await fs.promises.readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await findHtmlFiles(fullPath)));
		} else if (entry.name.endsWith(".html")) {
			files.push(fullPath);
		}
	}

	return files;
}

async function registerCompressedAssets(htmlFiles) {
	console.log("\nRegistering compressed assets in server bundle...");

	let bundleContent = await fs.promises.readFile(serverBundlePath, "utf-8");

	// Find the public_assets_data_default object
	const assetMapMatch = bundleContent.match(
		/var public_assets_data_default = \{([\s\S]*?)\};/,
	);
	if (!assetMapMatch) {
		console.warn("  ⚠ Could not find asset map in server bundle");
		return;
	}

	const assetMapContent = assetMapMatch[1];
	const newEntries = [];

	for (const filePath of htmlFiles) {
		const relativePath = path.relative(publicDir, filePath);
		const assetId = `/${relativePath.replace(/\\/g, "/")}`;

		// Get file stats for mtime
		const stat = await fs.promises.stat(filePath);
		const mtime = stat.mtime.toISOString();

		// Add gzip entry
		const gzPath = `${filePath}.gz`;
		if (fs.existsSync(gzPath)) {
			const gzStat = await fs.promises.stat(gzPath);
			const gzRelativePath = path.relative(
				path.dirname(serverBundlePath),
				gzPath,
			);
			newEntries.push(
				`	"${assetId}.gz": {
		"type": "text/html; charset=utf-8",
		"encoding": "gzip",
		"etag": "${gzStat.size}-${gzStat.mtimeMs}",
		"mtime": "${gzStat.mtime.toISOString()}",
		"size": ${gzStat.size},
		"path": "${gzRelativePath.replace(/\\/g, "/")}"
	}`,
			);
		}

		// Add brotli entry
		const brPath = `${filePath}.br`;
		if (fs.existsSync(brPath)) {
			const brStat = await fs.promises.stat(brPath);
			const brRelativePath = path.relative(
				path.dirname(serverBundlePath),
				brPath,
			);
			newEntries.push(
				`	"${assetId}.br": {
		"type": "text/html; charset=utf-8",
		"encoding": "br",
		"etag": "${brStat.size}-${brStat.mtimeMs}",
		"mtime": "${brStat.mtime.toISOString()}",
		"size": ${brStat.size},
		"path": "${brRelativePath.replace(/\\/g, "/")}"
	}`,
			);
		}
	}

	if (newEntries.length === 0) {
		console.log("  No compressed files to register");
		return;
	}

	// Insert new entries into the asset map
	const updatedAssetMap = assetMapContent.trimEnd() + ",\n" + newEntries.join(",\n");
	const updatedBundle = bundleContent.replace(
		assetMapMatch[0],
		`var public_assets_data_default = {${updatedAssetMap}\n};`,
	);

	await fs.promises.writeFile(serverBundlePath, updatedBundle);
	console.log(`  ✓ Registered ${newEntries.length} compressed asset(s)`);
}

async function main() {
	console.log("Compressing prerendered HTML files...\n");

	if (!fs.existsSync(publicDir)) {
		console.error(`Public directory not found: ${publicDir}`);
		process.exit(1);
	}

	const htmlFiles = await findHtmlFiles(publicDir);
	console.log(`Found ${htmlFiles.length} HTML file(s)\n`);

	let hasCompressedFiles = false;
	for (const file of htmlFiles) {
		const relativePath = path.relative(publicDir, file);
		console.log(`Compressing ${relativePath}:`);
		const result = await compressFile(file);
		if (result) hasCompressedFiles = true;
	}

	if (hasCompressedFiles) {
		await registerCompressedAssets(htmlFiles);
	}

	console.log("\n✓ Compression complete!");
}

main().catch((err) => {
	console.error("Error:", err);
	process.exit(1);
});
