import { describe, expect, test } from "vitest";
import { renderMarkdown } from "./markdown";

describe("Given markdown content with headings and paragraphs", () => {
	test("When it is rendered, Then it produces the corresponding HTML elements", async () => {
		const html = await renderMarkdown("# Hello\n\nSome text.");
		expect(html).toContain("<h1>Hello</h1>");
		expect(html).toContain("<p>Some text.</p>");
	});
});

describe("Given markdown content with a table", () => {
	test("When it is rendered, Then it produces a valid HTML table", async () => {
		const html = await renderMarkdown(
			["| A | B |", "|---|---|", "| 1 | 2 |"].join("\n"),
		);
		expect(html).toContain("<table>");
	});
});

describe("Given markdown content containing a script tag", () => {
	test("When it is rendered, Then the script tag is removed from the output", async () => {
		const html = await renderMarkdown("<script>alert('xss')</script>");
		expect(html).not.toContain("<script");
		expect(html).not.toContain("alert('xss')");
	});
});

describe("Given markdown content containing an element with an event handler", () => {
	test("When it is rendered, Then the event handler attribute is removed from the output", async () => {
		const html = await renderMarkdown(`<img src="x" onerror="alert('xss')">`);
		expect(html).not.toContain("onerror");
	});
});
