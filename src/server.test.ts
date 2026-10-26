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
	getContentDir: () => "/content",
	getPostsFromDir,
}));

vi.mock("./lib/rss", () => ({
	generateRss,
}));

vi.mock("./lib/sitemap", () => ({
	generateSitemap,
}));

describe("Given the server entry", () => {
	test("When a request is made to /rss.xml, Then it returns an RSS response", async () => {
		const { default: server } = await import("./server");

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
		const { default: server } = await import("./server");

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
		const { default: server } = await import("./server");

		const request = new Request("https://example.com/");
		startHandler.mockResolvedValueOnce(new Response("OK"));

		const response = await server.fetch(request);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe("OK");
		expect(startHandler).toHaveBeenCalledWith(request);
	});

	test("When /rss.xml is requested with X-Forwarded-Proto, Then the origin reflects the forwarded scheme", async () => {
		const { default: server } = await import("./server");

		const request = new Request("http://example.com/rss.xml", {
			headers: { "X-Forwarded-Proto": "https" },
		});
		const response = await server.fetch(request);

		expect(response.status).toBe(200);
		expect(generateRss).toHaveBeenCalledWith("https://example.com", []);
	});

	test("When /sitemap.xml is requested with X-Forwarded-Proto and X-Forwarded-Host, Then the origin reflects both headers", async () => {
		const { default: server } = await import("./server");

		const request = new Request("http://internal.example.com/sitemap.xml", {
			headers: {
				"X-Forwarded-Proto": "https",
				"X-Forwarded-Host": "public.example.com",
			},
		});
		const response = await server.fetch(request);

		expect(response.status).toBe(200);
		expect(generateSitemap).toHaveBeenCalledWith(
			"https://public.example.com",
			[],
		);
	});
});
