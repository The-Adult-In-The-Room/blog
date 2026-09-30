import { describe, expect, test } from "vitest";
import { postFrontmatterSchema } from "./postFrontmatter";

describe("Given a valid post frontmatter object", () => {
	test("When all fields are provided, Then they are parsed and normalized", () => {
		const result = postFrontmatterSchema.safeParse({
			title: "Frontmatter Title",
			date: "2026-09-28",
			slug: "frontmatter-slug",
			excerpt: "Frontmatter excerpt.",
			tags: ["beer", "life"],
			number: 42,
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data).toEqual({
			title: "Frontmatter Title",
			date: "2026-09-28",
			slug: "frontmatter-slug",
			excerpt: "Frontmatter excerpt.",
			tags: ["beer", "life"],
			number: 42,
		});
	});

	test("When date is a Date instance, Then it is normalized to an ISO date string", () => {
		const result = postFrontmatterSchema.safeParse({
			date: new Date("2026-09-28T00:00:00.000Z"),
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data.date).toBe("2026-09-28");
	});

	test("When date is a numeric timestamp, Then it is normalized to an ISO date string", () => {
		const result = postFrontmatterSchema.safeParse({
			date: 1727654400000,
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data.date).toBe("2024-09-30");
	});

	test("When tags are a comma-separated string, Then they are accepted", () => {
		const result = postFrontmatterSchema.safeParse({
			tags: "beer, life",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data.tags).toBe("beer, life");
	});

	test("When optional fields are omitted, Then parsing succeeds", () => {
		const result = postFrontmatterSchema.safeParse({});

		expect(result.success).toBe(true);
	});
});

describe("Given an invalid post frontmatter object", () => {
	test("When date is invalid, Then parsing fails with a clear message", () => {
		const result = postFrontmatterSchema.safeParse({ date: "not-a-date" });

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.error.issues[0]?.message).toBe('Invalid date: "not-a-date"');
	});

	test("When title is a number, Then parsing fails", () => {
		const result = postFrontmatterSchema.safeParse({ title: 123 });

		expect(result.success).toBe(false);
	});

	test("When title is empty, Then parsing fails", () => {
		const result = postFrontmatterSchema.safeParse({ title: "" });

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.error.issues[0]?.message).toBe(
			"Title must be a non-empty string",
		);
	});

	test("When slug contains spaces, Then parsing fails", () => {
		const result = postFrontmatterSchema.safeParse({ slug: "hello world" });

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.error.issues[0]?.message).toBe(
			"Slug must contain only lowercase letters, numbers, and hyphens",
		);
	});

	test("When number is not a number, Then parsing fails", () => {
		const result = postFrontmatterSchema.safeParse({ number: "one" });

		expect(result.success).toBe(false);
	});

	test("When number is not an integer, Then parsing fails", () => {
		const result = postFrontmatterSchema.safeParse({ number: 3.14 });

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.error.issues[0]?.message).toBe("Number must be an integer");
	});

	test("When tags are neither a string nor an array, Then parsing fails", () => {
		const result = postFrontmatterSchema.safeParse({ tags: 42 });

		expect(result.success).toBe(false);
	});
});
