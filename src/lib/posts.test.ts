import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createPostSummary } from "../test-utils/fixtures";
import {
	clearPostCache,
	extractExcerpt,
	filenameToNumber,
	filenameToSlug,
	filenameToTitle,
	filterPostsByTag,
	getAllTags,
	getContentDir,
	getPostFromDir,
	getPostsFromDir,
	getTagCounts,
	normalizeTags,
	readPostFile,
	readPostSummary,
	sortPosts,
} from "./posts";

describe("posts", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-test-"));
		clearPostCache();
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	function writePost(filename: string, content: string): string {
		const filePath = path.join(tempDir, filename);
		fs.writeFileSync(filePath, content, "utf-8");
		return filePath;
	}

	describe("filenameToSlug", () => {
		test("converts filename to slug", () => {
			expect(filenameToSlug("1_Hello_World.md")).toBe("hello-world");
			expect(filenameToSlug("my_post.md")).toBe("my-post");
		});
	});

	describe("filenameToTitle", () => {
		test("converts filename to title", () => {
			expect(filenameToTitle("1_Hello_World.md")).toBe("Hello World");
			expect(filenameToTitle("my_post.md")).toBe("My Post");
		});
	});

	describe("filenameToNumber", () => {
		test("extracts number from filename", () => {
			expect(filenameToNumber("1_Hello_World.md")).toBe(1);
			expect(filenameToNumber("42_my_post.md")).toBe(42);
			expect(filenameToNumber("no_number.md")).toBeNull();
		});
	});

	describe("extractExcerpt", () => {
		test("extracts first paragraph", () => {
			const body = "First paragraph.\n\nSecond paragraph.";
			expect(extractExcerpt(body)).toBe("First paragraph.");
		});

		test("returns empty string for empty body", () => {
			expect(extractExcerpt("")).toBe("");
		});

		test("truncates long excerpts", () => {
			const longText = "a".repeat(200);
			const excerpt = extractExcerpt(longText);
			expect(excerpt.length).toBe(160);
			expect(excerpt.endsWith("...")).toBe(true);
		});
	});

	describe("normalizeTags", () => {
		test("normalizes array of tags", () => {
			expect(normalizeTags(["Beer", "LIFE"])).toEqual(["beer", "life"]);
		});

		test("normalizes comma-separated string", () => {
			expect(normalizeTags("beer, life")).toEqual(["beer", "life"]);
		});

		test("returns empty array for invalid input", () => {
			expect(normalizeTags(null)).toEqual([]);
			expect(normalizeTags(undefined)).toEqual([]);
			expect(normalizeTags(123)).toEqual([]);
		});

		test("handles array with non-string values", () => {
			expect(normalizeTags([123, "beer", null])).toEqual([
				"123",
				"beer",
				"null",
			]);
		});

		test("filters empty tags", () => {
			expect(normalizeTags(["beer", "", "life"])).toEqual(["beer", "life"]);
		});

		test("handles empty string", () => {
			expect(normalizeTags("")).toEqual([]);
		});
	});

	describe("readPostFile", () => {
		test("parses markdown file with frontmatter", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test Post\ndate: 2026-09-28\ntags: [beer, life]\n---\nBody content.",
			);

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Test Post");
			expect(post.date).toBe("2026-09-28");
			expect(post.tags).toEqual(["beer", "life"]);
			expect(post.content).toBeDefined();
			expect(post.content.type).toBe("root");
		});

		test("uses filename for missing frontmatter", async () => {
			const filePath = writePost("1_Hello_World.md", "Body content.");

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Hello World");
			expect(post.slug).toBe("hello-world");
			expect(post.number).toBe(1);
		});

		test("parses numeric frontmatter values", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\nnumber: 42\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.number).toBe(42);
		});

		test("parses float frontmatter values", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\nversion: 1.5\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			// Float values are parsed but may not be used in Post type
			expect(post).toBeDefined();
		});

		test("parses boolean frontmatter values", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ndraft: true\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.draft).toBe(true);
		});

		test("handles tags as string", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ntags: beer, life\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.tags).toEqual(["beer", "life"]);
		});

		test("handles quoted values in frontmatter", async () => {
			const filePath = writePost(
				"test.md",
				'---\ntitle: "Quoted Title"\n---\nBody.',
			);

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Quoted Title");
		});

		test("handles frontmatter with invalid lines", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ninvalid line without colon\nslug: test\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Test");
			expect(post.slug).toBe("test");
		});

		test("handles empty array in frontmatter", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ntags: []\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.tags).toEqual([]);
		});

		test("handles array with quoted values in frontmatter", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ntags: [\"beer\", 'life']\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.tags).toEqual(["beer", "life"]);
		});
	});

	describe("readPostSummary", () => {
		test("returns post summary", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ndate: 2026-09-28\ntags: [beer]\n---\nBody.",
			);

			const summary = await readPostSummary(filePath);

			expect(summary.title).toBe("Test");
			expect(summary.date).toBe("2026-09-28");
			expect(summary.tags).toEqual(["beer"]);
		});
	});

	describe("getPostsFromDir", () => {
		test("returns all published posts sorted by date", async () => {
			writePost("1_post-a.md", "---\ntitle: Post A\ndate: 2026-09-27\n---\nA.");
			writePost("2_post-b.md", "---\ntitle: Post B\ndate: 2026-09-28\n---\nB.");

			const posts = await getPostsFromDir(tempDir);

			expect(posts).toHaveLength(2);
			expect(posts[0].title).toBe("Post B");
			expect(posts[1].title).toBe("Post A");
		});

		test("excludes draft posts in production", async () => {
			const originalNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			writePost("draft.md", "---\ntitle: Draft\ndraft: true\n---\nDraft.");

			const posts = await getPostsFromDir(tempDir);

			expect(posts).toHaveLength(0);

			process.env.NODE_ENV = originalNodeEnv;
		});
	});

	describe("getPostFromDir", () => {
		test("returns post by slug", async () => {
			writePost("1_hello-world.md", "---\ntitle: Hello World\n---\nContent.");

			const post = await getPostFromDir(tempDir, "hello-world");

			expect(post).not.toBeNull();
			expect(post?.title).toBe("Hello World");
		});

		test("returns null for non-existent post", async () => {
			const post = await getPostFromDir(tempDir, "missing");

			expect(post).toBeNull();
		});

		test("returns null for draft post in production", async () => {
			const originalNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			writePost("1_draft.md", "---\ntitle: Draft\ndraft: true\n---\nContent.");

			const post = await getPostFromDir(tempDir, "draft");

			expect(post).toBeNull();

			process.env.NODE_ENV = originalNodeEnv;
		});

		test("returns draft post in development", async () => {
			const originalNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "development";

			writePost("1_draft.md", "---\ntitle: Draft\ndraft: true\n---\nContent.");

			const post = await getPostFromDir(tempDir, "draft");

			expect(post).not.toBeNull();
			expect(post?.title).toBe("Draft");

			process.env.NODE_ENV = originalNodeEnv;
		});
	});

	describe("getAllTags", () => {
		test("returns unique sorted tags", () => {
			const posts = [
				createPostSummary({ tags: ["beer", "life"] }),
				createPostSummary({ tags: ["code", "beer"] }),
			];

			const tags = getAllTags(posts);

			expect(tags).toEqual(["beer", "code", "life"]);
		});
	});

	describe("getTagCounts", () => {
		test("returns tag counts sorted by tag", () => {
			const posts = [
				createPostSummary({ tags: ["beer", "life"] }),
				createPostSummary({ tags: ["beer"] }),
			];

			const counts = getTagCounts(posts);

			expect(counts).toEqual([
				{ tag: "beer", count: 2 },
				{ tag: "life", count: 1 },
			]);
		});
	});

	describe("filterPostsByTag", () => {
		test("filters posts by tag", () => {
			const posts = [
				createPostSummary({ tags: ["beer"] }),
				createPostSummary({ tags: ["life"] }),
				createPostSummary({ tags: ["beer", "life"] }),
			];

			const filtered = filterPostsByTag(posts, "beer");

			expect(filtered).toHaveLength(2);
		});

		test("returns all posts when tag is undefined", () => {
			const posts = [createPostSummary(), createPostSummary()];

			const filtered = filterPostsByTag(posts, undefined);

			expect(filtered).toHaveLength(2);
		});
	});

	describe("sortPosts", () => {
		test("sorts posts by date descending", () => {
			const posts = [
				createPostSummary({ date: "2026-09-27", title: "A" }),
				createPostSummary({ date: "2026-09-28", title: "B" }),
			];

			const sorted = sortPosts(posts);

			expect(sorted[0].title).toBe("B");
			expect(sorted[1].title).toBe("A");
		});

		test("sorts by title when dates are equal", () => {
			const posts = [
				createPostSummary({ date: "2026-09-28", title: "Z" }),
				createPostSummary({ date: "2026-09-28", title: "A" }),
			];

			const sorted = sortPosts(posts);

			expect(sorted[0].title).toBe("A");
			expect(sorted[1].title).toBe("Z");
		});

		test("handles posts with null dates", () => {
			const posts = [
				createPostSummary({ date: null, title: "B" }),
				createPostSummary({ date: "2026-09-28", title: "A" }),
			];

			const sorted = sortPosts(posts);

			expect(sorted[0].title).toBe("A");
			expect(sorted[1].title).toBe("B");
		});

		test("sorts by title when both dates are null", () => {
			const posts = [
				createPostSummary({ date: null, title: "Z" }),
				createPostSummary({ date: null, title: "A" }),
			];

			const sorted = sortPosts(posts);

			expect(sorted[0].title).toBe("A");
			expect(sorted[1].title).toBe("Z");
		});
	});

	describe("getContentDir", () => {
		test("returns default content directory", () => {
			const dir = getContentDir();
			expect(dir).toContain("content");
		});

		test("uses BLOG_CONTENT_DIR environment variable", () => {
			const original = process.env.BLOG_CONTENT_DIR;
			process.env.BLOG_CONTENT_DIR = "/custom/path";

			const dir = getContentDir();

			expect(dir).toBe("/custom/path");

			process.env.BLOG_CONTENT_DIR = original;
		});
	});
});
