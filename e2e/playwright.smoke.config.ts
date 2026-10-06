import { defineConfig } from "@playwright/test";

if (!process.env.SMOKE_BASE_URL) {
	throw new Error(
		"SMOKE_BASE_URL is required for smoke tests. Set it to the deployed URL, e.g. https://example.up.railway.app",
	);
}

export default defineConfig({
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["dot"], ["html", { open: "never" }]] : "list",
	globalSetup: "./fixtures/globalSetup.ts",
	globalTeardown: "./fixtures/globalTeardown.ts",
	use: {
		baseURL: process.env.SMOKE_BASE_URL,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "smoke",
			testDir: "./smoke",
		},
	],
});
