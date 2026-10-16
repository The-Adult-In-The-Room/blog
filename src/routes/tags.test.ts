import { describe, expect, test, vi } from "vitest";
import {
	beerPostSummary,
	codePostSummary,
	lifePostSummary,
} from "../test-utils/fixtures";
import { tagsLoader } from "./tags";

vi.mock("../lib/posts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../lib/posts")>();
	return {
		...actual,
		getPosts: vi.fn(),
	};
});

const { getPosts } = await import("../lib/posts");

describe("Given the tags index route loader", () => {
	test("When loaded, Then it returns sorted tag counts", async () => {
		vi.mocked(getPosts).mockResolvedValue([
			beerPostSummary,
			lifePostSummary,
			codePostSummary,
		]);

		const result = await tagsLoader();

		expect(result).toEqual([
			{ tag: "beer", count: 1 },
			{ tag: "code", count: 1 },
			{ tag: "life", count: 2 },
		]);
	});

	test("When there are no posts, Then it returns an empty array", async () => {
		vi.mocked(getPosts).mockResolvedValue([]);

		const result = await tagsLoader();

		expect(result).toEqual([]);
	});
});
