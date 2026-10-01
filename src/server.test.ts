import { describe, expect, test, vi } from "vitest";

const startHandler = vi.fn();
const createStartHandler = vi.fn(() => startHandler);

vi.mock("@tanstack/react-start/server", () => ({
	createStartHandler,
	defaultStreamHandler: "defaultStreamHandler",
}));

const generateRss = vi.fn(() => "<rss></rss>");
const generateSitemap = vi.fn(() => "<urlset></urlset>");
const getPostsFromDir = vi.fn(async () => []);

vi.mock("./lib/posts", () => ({
	CONTENT_DIR: "/content",
	getPostsFromDir,
}));

vi.mock("./lib/rss", () => ({
	generateRss,
}));

vi.mock("./lib/sitemap", () => ({
	generateSitemap,
}));

describe("Given the server entry", async () => {
	const { default: server } = await import("./server");

	test("When a request is made to /rss.xml, Then it returns an RSS response", async () => {
		const request = new Request("https://example.com/rss.xml");
		const response = await server.fetch(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe(
			"application/rss+xml; charset=utf-8",
		);
		expect(await response.text()).toBe("<rss></rss>");
		expect(generateRss).toHaveBeenCalledWith("https://example.com", []);
		expect(startHandler).not.toHaveBeenCalled();
	});

	test("When a request is made to /sitemap.xml, Then it returns a sitemap response", async () => {
		const request = new Request("https://example.com/sitemap.xml");
		const response = await server.fetch(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe(
			"application/xml; charset=utf-8",
		);
		expect(await response.text()).toBe("<urlset></urlset>");
		expect(generateSitemap).toHaveBeenCalledWith("https://example.com", []);
		expect(startHandler).not.toHaveBeenCalled();
	});

	test("When a request is made to any other path, Then it delegates to the Start handler", async () => {
		const request = new Request("https://example.com/");
		startHandler.mockResolvedValueOnce(new Response("OK"));

		const response = await server.fetch(request);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe("OK");
		expect(startHandler).toHaveBeenCalledWith(request);
	});
});
