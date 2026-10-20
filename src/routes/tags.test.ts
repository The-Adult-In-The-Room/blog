import { beforeEach, describe, expect, test, vi } from "vitest";
import { tagsLoader } from "./tags";

vi.mock("../lib/posts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../lib/posts")>();
	return {
		...actual,
		getTagCounts: vi.fn(),
	};
});

const { getTagCounts, clearTagCountsCache } = await import("../lib/posts");

describe("Given the tags index route loader", () => {
	beforeEach(() => {
		clearTagCountsCache();
	});

	test("When loaded, Then it returns sorted tag counts", async () => {
		vi.mocked(getTagCounts).mockResolvedValue([
			{ tag: "beer", count: 1 },
			{ tag: "code", count: 1 },
			{ tag: "life", count: 2 },
		]);

		const result = await tagsLoader();

		expect(result).toEqual([
			{ tag: "beer", count: 1 },
			{ tag: "code", count: 1 },
			{ tag: "life", count: 2 },
		]);
		expect(getTagCounts).toHaveBeenCalledTimes(1);
	});

	test("When there are no posts, Then it returns an empty array", async () => {
		vi.mocked(getTagCounts).mockResolvedValue([]);

		const result = await tagsLoader();

		expect(result).toEqual([]);
	});
});
