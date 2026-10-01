import { describe, expect, test } from "vitest";
import { createPostSummary } from "../test-utils/fixtures";
import { generateSitemap } from "./sitemap";

describe("Given a base URL and a list of posts", () => {
	test("When generating a sitemap, Then it includes the home page, posts, and tags", () => {
		const posts = [
			createPostSummary({
				slug: "hello-world",
				title: "Hello World",
				date: "2026-09-28",
				tags: ["life"],
			}),
			createPostSummary({
				slug: "beer-post",
				title: "Beer Post",
				date: "2026-09-27",
				tags: ["beer", "life"],
			}),
		];

		const sitemap = generateSitemap("https://example.com/", posts);

		expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(sitemap).toContain(
			'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		);
		expect(sitemap).toContain("<loc>https://example.com/</loc>");
		expect(sitemap).toContain(
			"<loc>https://example.com/posts/hello-world</loc><lastmod>2026-09-28</lastmod>",
		);
		expect(sitemap).toContain(
			"<loc>https://example.com/posts/beer-post</loc><lastmod>2026-09-27</lastmod>",
		);
		expect(sitemap).toContain("<loc>https://example.com/tags/beer</loc>");
		expect(sitemap).toContain("<loc>https://example.com/tags/life</loc>");
	});

	test("When a post has no date, Then lastmod is omitted", () => {
		const posts = [
			createPostSummary({
				slug: "undated",
				title: "Undated",
				date: null,
			}),
		];

		const sitemap = generateSitemap("https://example.com", posts);

		expect(sitemap).toContain(
			"<loc>https://example.com/posts/undated</loc></url>",
		);
		expect(sitemap).not.toContain("<lastmod>");
	});

	test("When content contains XML-special characters, Then they are escaped", () => {
		const posts = [
			createPostSummary({
				slug: "special",
				title: "Special",
				date: "2026-09-28",
				tags: ["a&b"],
			}),
		];

		const sitemap = generateSitemap("https://example.com", posts);

		expect(sitemap).toContain("<loc>https://example.com/tags/a&amp;b</loc>");
	});
});
