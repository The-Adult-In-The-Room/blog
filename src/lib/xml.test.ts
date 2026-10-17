import { describe, expect, test } from "vitest";
import { escapeXml, unescapeXml } from "./xml";

describe("escapeXml", () => {
	test("escapes all XML special characters", () => {
		expect(escapeXml(`<tag attr="value">&'test'</tag>`)).toBe(
			"&lt;tag attr=&quot;value&quot;&gt;&amp;&apos;test&apos;&lt;/tag&gt;",
		);
	});

	test("returns unchanged string when no special characters", () => {
		expect(escapeXml("hello world")).toBe("hello world");
	});

	test("handles empty string", () => {
		expect(escapeXml("")).toBe("");
	});
});

describe("unescapeXml", () => {
	test("unescapes all XML entities", () => {
		expect(
			unescapeXml(
				"&lt;tag attr=&quot;value&quot;&gt;&amp;&apos;test&apos;&lt;/tag&gt;",
			),
		).toBe(`<tag attr="value">&'test'</tag>`);
	});

	test("returns unchanged string when no entities", () => {
		expect(unescapeXml("hello world")).toBe("hello world");
	});

	test("handles empty string", () => {
		expect(unescapeXml("")).toBe("");
	});

	test("correctly handles ampersand to avoid double-decoding", () => {
		expect(unescapeXml("&amp;amp;")).toBe("&amp;");
	});
});

describe("escapeXml and unescapeXml", () => {
	test("are inverse operations", () => {
		const input = 'It\'s a <test> & "something"';
		expect(unescapeXml(escapeXml(input))).toBe(input);
	});
});
