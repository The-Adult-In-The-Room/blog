import { beforeEach, describe, expect, test, vi } from "vitest";
import {
	beerPostSummary,
	codePostSummary,
	lifePostSummary,
} from "../test-utils/fixtures";
import { tagLoader } from "./tags.$tag";

vi.mock("../lib/posts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../lib/posts")>();
	return {
		...actual,
		getPosts: vi.fn(),
		getTagCounts: vi.fn(),
	};
});

const { getPosts, getTagCounts, clearTagCountsCache } = await import(
	"../lib/posts"
);

const allPosts = [beerPostSummary, lifePostSummary, codePostSummary];
const tagCounts = [
	{ tag: "beer", count: 1 },
	{ tag: "code", count: 1 },
	{ tag: "life", count: 2 },
];

describe("Given the tag detail route loader", () => {
	beforeEach(() => {
		clearTagCountsCache();
	});

	test("When loaded with a tag, Then it returns filtered posts, the sorted tag list, and tag counts", async () => {
		vi.mocked(getPosts).mockResolvedValue(allPosts);
		vi.mocked(getTagCounts).mockResolvedValue(tagCounts);

		const result = await tagLoader({ params: { tag: "beer" } });

		expect(result.tag).toBe("beer");
		expect(result.posts).toEqual([beerPostSummary]);
		expect(result.allTags).toEqual(["beer", "code", "life"]);
		expect(result.tagCounts).toEqual(tagCounts);
	});

	test("When the tag param has mixed case and whitespace, Then it is lowercased and trimmed", async () => {
		vi.mocked(getPosts).mockResolvedValue(allPosts);
		vi.mocked(getTagCounts).mockResolvedValue(tagCounts);

		const result = await tagLoader({ params: { tag: "  Beer  " } });

		expect(result.tag).toBe("beer");
		expect(result.posts).toEqual([beerPostSummary]);
		expect(result.tagCounts).toEqual(tagCounts);
	});

	test("When no posts match the tag, Then the filtered posts list is empty", async () => {
		vi.mocked(getPosts).mockResolvedValue(allPosts);
		vi.mocked(getTagCounts).mockResolvedValue(tagCounts);

		const result = await tagLoader({ params: { tag: "nonexistent" } });

		expect(result.tag).toBe("nonexistent");
		expect(result.posts).toEqual([]);
		expect(result.allTags).toEqual(["beer", "code", "life"]);
		expect(result.tagCounts).toEqual(tagCounts);
	});
});
