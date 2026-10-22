import { describe, expect, test, vi } from "vitest";
import { getPost, getPosts } from "../lib/posts";
import { createPost, createPostSummary } from "../test-utils/fixtures";
import { postLoader } from "./posts.$slug";

vi.mock("../lib/posts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../lib/posts")>();
	return {
		...actual,
		getPost: vi.fn(),
		getPosts: vi.fn(),
	};
});

describe("Given the post detail route loader", () => {
	test("When the requested post exists, Then it returns the post with its neighbors", async () => {
		const post = createPost({ slug: "hello-world", title: "Hello World" });
		vi.mocked(getPost).mockResolvedValue(post);
		vi.mocked(getPosts).mockResolvedValue([
			createPostSummary({ slug: "hello-world", title: "Hello World" }),
		]);

		const result = await postLoader({ params: { slug: "hello-world" } });

		expect(result).toEqual({ post, previous: null, next: null });
		expect(getPost).toHaveBeenCalledWith({ data: "hello-world" });
		expect(getPosts).toHaveBeenCalled();
	});

	test("When the requested post does not exist, Then it throws a notFound error", async () => {
		vi.mocked(getPost).mockResolvedValue(null);
		vi.mocked(getPosts).mockResolvedValue([]);

		await expect(postLoader({ params: { slug: "missing" } })).rejects.toThrow();
		expect(getPost).toHaveBeenCalledWith({ data: "missing" });
	});
});
