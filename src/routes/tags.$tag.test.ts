import { describe, expect, test, vi } from "vitest";
import { getPosts } from "../lib/posts";
import { allPostSummaries } from "../test-utils/fixtures";
import { tagLoader } from "./tags.$tag";

vi.mock("../lib/posts", () => ({
	getPosts: vi.fn(),
}));

describe("Given the tag route loader", () => {
	test("When posts match the requested tag, Then it returns the normalized tag and filtered posts", async () => {
		vi.mocked(getPosts).mockResolvedValue(allPostSummaries);

		const result = await tagLoader({ params: { tag: "Beer" } });

		expect(result.tag).toBe("beer");
		expect(result.posts).toHaveLength(1);
		expect(result.posts[0].slug).toBe("beer-post");
	});

	test("When the tag has mixed case and whitespace, Then it is normalized for matching", async () => {
		vi.mocked(getPosts).mockResolvedValue(allPostSummaries);

		const result = await tagLoader({ params: { tag: "  LIFE  " } });

		expect(result.tag).toBe("life");
		expect(result.posts.map((p) => p.slug)).toEqual(["beer-post", "life-post"]);
	});

	test("When no posts match the requested tag, Then it returns the tag with an empty array", async () => {
		vi.mocked(getPosts).mockResolvedValue(allPostSummaries);

		const result = await tagLoader({ params: { tag: "missing" } });

		expect(result.tag).toBe("missing");
		expect(result.posts).toEqual([]);
	});
});
