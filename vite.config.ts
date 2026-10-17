import fs from "node:fs";
import path from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import matter from "gray-matter";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// Read post metadata at build time for prerendering (only published posts)
type PostMeta = { slug: string; tags: string[] };

function getPostMetas(): PostMeta[] {
	const contentDir = process.env.BLOG_CONTENT_DIR
		? path.resolve(process.env.BLOG_CONTENT_DIR)
		: path.resolve("content");

	if (!fs.existsSync(contentDir)) {
		return [];
	}

	const files = fs.readdirSync(contentDir);
	return files
		.filter((file) => file.endsWith(".md"))
		.map((file) => {
			const filePath = path.join(contentDir, file);
			const content = fs.readFileSync(filePath, "utf-8");
			const { data } = matter(content);
			const base = path.basename(file, path.extname(file));
			const slug = base.replace(/^\d+_/, "").replace(/_/g, "-").toLowerCase();
			const tags = Array.isArray(data.tags)
				? data.tags.map((t: unknown) => String(t).toLowerCase().trim())
				: [];
			return { slug, tags, draft: data.draft === true };
		})
		.filter((post) => !post.draft)
		.map(({ slug, tags }) => ({ slug, tags }));
}

const postMetas = getPostMetas();
const uniqueTags = [...new Set(postMetas.flatMap((post) => post.tags))].sort();

const prerenderPages = [
	{ path: "/" },
	{ path: "/tags" },
	...postMetas.map((post) => ({ path: `/posts/${post.slug}` })),
	...uniqueTags.map((tag) => ({ path: `/tags/${tag}` })),
];

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	build: {
		sourcemap: true,
	},
	plugins: [
		nitro({
			compressPublicAssets: {
				gzip: true,
				brotli: true,
			},
			rollupConfig: { external: [/^@sentry\//] },
			routeRules: {
				// Cache prerendered HTML pages aggressively
				"/": {
					headers: {
						"cache-control": "public, max-age=3600, s-maxage=86400",
					},
				},
				"/posts/**": {
					headers: {
						"cache-control": "public, max-age=3600, s-maxage=86400",
					},
				},
				"/tags/**": {
					headers: {
						"cache-control": "public, max-age=3600, s-maxage=86400",
					},
				},
			},
		}),
		tailwindcss(),
		tanstackStart({
			prerender: {
				enabled: true,
				crawlLinks: true,
			},
			pages: prerenderPages,
		}),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
