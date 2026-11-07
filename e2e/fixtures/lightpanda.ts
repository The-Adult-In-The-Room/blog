import type { ChildProcessByStdio } from "node:child_process";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Readable } from "node:stream";

export const LIGHTPANDA_HOST = "127.0.0.1";
export const LIGHTPANDA_PORT = 9222;
export const LIGHTPANDA_WS_ENDPOINT = `ws://${LIGHTPANDA_HOST}:${LIGHTPANDA_PORT}`;

let proc: ChildProcessByStdio<null, Readable, Readable> | undefined;

function resolveBinary(): string {
	if (process.env.LIGHTPANDA_EXECUTABLE_PATH) {
		return process.env.LIGHTPANDA_EXECUTABLE_PATH;
	}
	return path.join(os.homedir(), ".cache", "lightpanda-node", "lightpanda");
}

function pipeFilteredStream(
	source: NodeJS.ReadableStream,
	destination: NodeJS.WritableStream,
): void {
	let buffer = "";
	source.on("data", (chunk: Buffer) => {
		buffer += chunk.toString("utf8");
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";
		for (const line of lines) {
			// Lightpanda logs a warning for every unsupported CDP command when
			// connected to Playwright. Filter those out to keep test output readable.
			if (line && !line.includes("$scope=not_implemented")) {
				destination.write(`${line}\n`);
			}
		}
	});
}

async function waitForCdpServer(timeoutMs = 10000): Promise<void> {
	const start = Date.now();
	const healthUrl = `http://${LIGHTPANDA_HOST}:${LIGHTPANDA_PORT}/json/version`;

	while (Date.now() - start < timeoutMs) {
		try {
			const response = await fetch(healthUrl);
			if (response.ok) return;
		} catch {
			// Server is not ready yet.
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error(
		`Lightpanda CDP server did not become ready within ${timeoutMs}ms`,
	);
}

export async function startLightpanda(): Promise<void> {
	if (proc && !proc.killed) {
		return;
	}

	const binary = resolveBinary();
	if (!existsSync(binary)) {
		throw new Error(
			`Lightpanda binary not found at ${binary}. ` +
				"Set LIGHTPANDA_EXECUTABLE_PATH or run `npx @lightpanda/browser install`.",
		);
	}

	// Axe accessibility scans return large result payloads via CDP; raise the
	// default 1 MB websocket message limit so the browser connection stays open.
	const CDP_MAX_MESSAGE_SIZE = 16 * 1024 * 1024;

	proc = spawn(
		binary,
		[
			"serve",
			"--host",
			LIGHTPANDA_HOST,
			"--port",
			String(LIGHTPANDA_PORT),
			"--cdp-max-message-size",
			String(CDP_MAX_MESSAGE_SIZE),
		],
		{ stdio: ["ignore", "pipe", "pipe"] },
	);

	pipeFilteredStream(proc.stdout, process.stdout);
	pipeFilteredStream(proc.stderr, process.stderr);

	await waitForCdpServer();
}

export async function stopLightpanda(): Promise<void> {
	if (!proc || proc.killed) {
		return;
	}

	const exitPromise = new Promise<void>((resolve) => {
		proc?.once("exit", () => resolve());
	});

	proc.kill();
	await exitPromise;
	proc = undefined;
}
