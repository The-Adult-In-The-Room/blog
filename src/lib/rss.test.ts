import { describe, expect, test } from "vitest";
import { createPostSummary } from "../test-utils/fixtures";
import { generateRss, RSS_DESCRIPTION, RSS_TITLE } from "./rss";

describe("Given a base URL and a list of posts", () => {
	test("When generating RSS, Then it returns a valid RSS 2.0 feed", () => {
		const posts = [
			createPostSummary({
				slug: "hello-world",
				title: "Hello World",
				date: "2026-09-28",
				excerpt: "A greeting.",
			}),
		];

		const rss = generateRss("https://example.com/", posts);

		expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(rss).toContain('<rss version="2.0">');
		expect(rss).toContain(`<title>${RSS_TITLE}</title>`);
		expect(rss).toContain(`<description>${RSS_DESCRIPTION}</description>`);
		expect(rss).toContain("<link>https://example.com</link>");
		expect(rss).toContain("<item>");
		expect(rss).toContain("<title>Hello World</title>");
		expect(rss).toContain("<link>https://example.com/posts/hello-world</link>");
		expect(rss).toContain("<description>A greeting.</description>");
		expect(rss).toContain("<pubDate>Mon, 28 Sep 2026 00:00:00 GMT</pubDate>");
		expect(rss).toContain("<guid>https://example.com/posts/hello-world</guid>");
	});

	test("When posts have no date, Then pubDate is omitted", () => {
		const posts = [
			createPostSummary({
				slug: "undated",
				title: "Undated",
				date: null,
				excerpt: "No date.",
			}),
		];

		const rss = generateRss("https://example.com", posts);

		expect(rss).not.toContain("<pubDate>");
	});

	test("When content contains XML-special characters, Then they are escaped", () => {
		const posts = [
			createPostSummary({
				slug: "special",
				title: "A & B < C",
				date: "2026-09-28",
				excerpt: '5 > 3 & "quotes"',
			}),
		];

		const rss = generateRss("https://example.com", posts);

		expect(rss).toContain("<title>A &amp; B &lt; C</title>");
		expect(rss).toContain(
			"<description>5 &gt; 3 &amp; &quot;quotes&quot;</description>",
		);
	});

	test("When the base URL has no trailing slash, Then links are still correct", () => {
		const posts = [
			createPostSummary({ slug: "hello", title: "Hello", date: "2026-09-28" }),
		];

		const rss = generateRss("https://example.com", posts);

		expect(rss).toContain("<link>https://example.com</link>");
		expect(rss).toContain("<link>https://example.com/posts/hello</link>");
	});
});
