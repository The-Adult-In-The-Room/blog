import { describe, expect, test, vi } from "vitest";
import { getPosts } from "../lib/posts";
import { helloWorldPostSummary } from "../test-utils/fixtures";
import { homeLoader } from "./index";

vi.mock("../lib/posts", () => ({
	getPosts: vi.fn(),
}));

describe("Given the home route loader", () => {
	test("When loaded, Then it returns all posts from getPosts", async () => {
		const posts = [helloWorldPostSummary];
		vi.mocked(getPosts).mockResolvedValue(posts);

		const result = await homeLoader();

		expect(result).toEqual(posts);
		expect(getPosts).toHaveBeenCalledTimes(1);
	});
});
