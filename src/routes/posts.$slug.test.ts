import { describe, expect, test, vi } from "vitest";
import { getPost } from "../lib/posts";
import { createPost } from "../test-utils/fixtures";
import { postLoader } from "./posts.$slug";

vi.mock("../lib/posts", () => ({
	getPost: vi.fn(),
}));

describe("Given the post detail route loader", () => {
	test("When the requested post exists, Then it returns the post", async () => {
		const post = createPost({ slug: "hello-world", title: "Hello World" });
		vi.mocked(getPost).mockResolvedValue(post);

		const result = await postLoader({ params: { slug: "hello-world" } });

		expect(result).toEqual(post);
		expect(getPost).toHaveBeenCalledWith({ data: "hello-world" });
	});

	test("When the requested post does not exist, Then it throws a notFound error", async () => {
		vi.mocked(getPost).mockResolvedValue(null);

		await expect(postLoader({ params: { slug: "missing" } })).rejects.toThrow();
		expect(getPost).toHaveBeenCalledWith({ data: "missing" });
	});
});
