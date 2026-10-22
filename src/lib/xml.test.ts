import { describe, expect, test } from "vitest";
import { escapeXml, unescapeXml } from "./xml";

describe("Given the XML utilities", () => {
	describe("Given the escapeXml function", () => {
		test("When the string contains XML special characters, Then they are escaped", () => {
			expect(escapeXml(`<tag attr="value">&'test'</tag>`)).toBe(
				"&lt;tag attr=&quot;value&quot;&gt;&amp;&apos;test&apos;&lt;/tag&gt;",
			);
		});

		test("When the string has no special characters, Then it is unchanged", () => {
			expect(escapeXml("hello world")).toBe("hello world");
		});

		test("When the string is empty, Then it returns an empty string", () => {
			expect(escapeXml("")).toBe("");
		});
	});

	describe("Given the unescapeXml function", () => {
		test("When the string contains XML entities, Then they are unescaped", () => {
			expect(
				unescapeXml(
					"&lt;tag attr=&quot;value&quot;&gt;&amp;&apos;test&apos;&lt;/tag&gt;",
				),
			).toBe(`<tag attr="value">&'test'</tag>`);
		});

		test("When the string has no entities, Then it is unchanged", () => {
			expect(unescapeXml("hello world")).toBe("hello world");
		});

		test("When the string is empty, Then it returns an empty string", () => {
			expect(unescapeXml("")).toBe("");
		});

		test("When an entity contains an ampersand, Then it avoids double-decoding", () => {
			expect(unescapeXml("&amp;amp;")).toBe("&amp;");
		});
	});

	describe("Given escapeXml and unescapeXml are composed", () => {
		test("When escaping then unescaping a string, Then the original value is returned", () => {
			const input = 'It\'s a <test> & "something"';
			expect(unescapeXml(escapeXml(input))).toBe(input);
		});
	});
});
