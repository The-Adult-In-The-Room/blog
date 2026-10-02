import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		setupFiles: ["./src/test-utils/setup.ts"],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/cypress/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
			"e2e/**",
		],
		coverage: {
			include: ["src/**/*"],
			exclude: [
				"**/index.ts",
				"**/index.tsx",
				"src/components/**",
				"src/routes/**",
				"src/router.tsx",
				"src/routeTree.gen.ts",
				"src/styles.css",
				"src/test-utils/**",
			],
			thresholds: {
				statements: 95,
				branches: 95,
				functions: 95,
				lines: 95,
				autoUpdate: false,
			},
		},
	},
});
