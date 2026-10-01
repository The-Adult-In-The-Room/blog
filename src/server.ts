import {
	createStartHandler,
	defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";
import { CONTENT_DIR, getPostsFromDir } from "./lib/posts";
import { generateRss } from "./lib/rss";
import { generateSitemap } from "./lib/sitemap";

const startHandler = createStartHandler(defaultStreamHandler);

async function handleRss(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const posts = await getPostsFromDir(CONTENT_DIR);
	const body = generateRss(url.origin, posts);
	return new Response(body, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}

async function handleSitemap(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const posts = await getPostsFromDir(CONTENT_DIR);
	const body = generateSitemap(url.origin, posts);
	return new Response(body, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
}

export default createServerEntry({
	async fetch(request) {
		const url = new URL(request.url);

		if (url.pathname === "/rss.xml") {
			return handleRss(request);
		}

		if (url.pathname === "/sitemap.xml") {
			return handleSitemap(request);
		}

		return startHandler(request);
	},
});
