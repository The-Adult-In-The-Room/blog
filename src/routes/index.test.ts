import { describe, expect, test, vi } from "vitest";
import {
	beerPostSummary,
	codePostSummary,
	lifePostSummary,
} from "../test-utils/fixtures";
import { homeLoader } from "./index";

vi.mock("../lib/posts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../lib/posts")>();
	return {
		...actual,
		getPosts: vi.fn(),
	};
});

const { getPosts: mockedGetPosts } = await import("../lib/posts");

describe("Given the home route loader", () => {
	test("When loaded, Then it returns all posts and sorted tag counts", async () => {
		const posts = [beerPostSummary, lifePostSummary, codePostSummary];
		vi.mocked(mockedGetPosts).mockResolvedValue(posts);

		const result = await homeLoader();

		expect(result).toEqual({
			posts,
			tagCounts: [
				{ tag: "beer", count: 1 },
				{ tag: "code", count: 1 },
				{ tag: "life", count: 2 },
			],
		});
		expect(mockedGetPosts).toHaveBeenCalledTimes(1);
	});

	test("When there are no posts, Then it returns empty posts and tag counts", async () => {
		vi.mocked(mockedGetPosts).mockResolvedValue([]);

		const result = await homeLoader();

		expect(result).toEqual({ posts: [], tagCounts: [] });
	});
});
