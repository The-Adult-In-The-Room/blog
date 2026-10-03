import path from "node:path";
import { defineConfig } from "@playwright/test";

const BASE_URL =
	process.env.REGRESSION_BASE_URL ??
	process.env.BASE_URL ??
	"http://localhost:3000";
const isLocal =
	BASE_URL.includes("localhost") || BASE_URL.includes("127.0.0.1");

export default defineConfig({
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["dot"], ["html", { open: "never" }]] : "list",
	globalSetup: "./e2e/fixtures/globalSetup.ts",
	globalTeardown: "./e2e/fixtures/globalTeardown.ts",
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "smoke",
			testDir: "./e2e/smoke",
		},
		{
			name: "acceptance",
			testDir: "./e2e/acceptance",
		},
		{
			// Content-agnostic invariants. Safe to run against any deployment:
			// nothing here names a post or a tag, so the same suite holds for
			// the fixtures locally and for production content.
			name: "regression",
			testDir: "./e2e/regression",
		},
	],
	webServer: isLocal
		? {
				command: "npm run build && npm run preview",
				url: BASE_URL,
				timeout: 120_000,
				reuseExistingServer: !process.env.CI,
				stdout: "pipe",
				stderr: "ignore",
				env: {
					BLOG_CONTENT_DIR: path.resolve("e2e/fixtures/content"),
				},
			}
		: undefined,
});
