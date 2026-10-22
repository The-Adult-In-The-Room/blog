import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createPostSummary } from "../test-utils/fixtures";
import {
	clearPostCache,
	computeTagCounts,
	extractExcerpt,
	filenameToNumber,
	filenameToSlug,
	filenameToTitle,
	filterPostsByTag,
	getAdjacentPosts,
	getAllTags,
	getContentDir,
	getPostFromDir,
	getPostsFromDir,
	normalizeTags,
	readPostFile,
	readPostSummary,
	sortPosts,
} from "./posts";

describe("Given the posts module", () => {
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

	describe("Given the filenameToSlug function", () => {
		test("When converting a filename, Then it returns a kebab-case slug", () => {
			expect(filenameToSlug("1_Hello_World.md")).toBe("hello-world");
			expect(filenameToSlug("my_post.md")).toBe("my-post");
		});
	});

	describe("Given the filenameToTitle function", () => {
		test("When converting a filename, Then it returns a title-cased title", () => {
			expect(filenameToTitle("1_Hello_World.md")).toBe("Hello World");
			expect(filenameToTitle("my_post.md")).toBe("My Post");
		});
	});

	describe("Given the filenameToNumber function", () => {
		test("When a filename has a numeric prefix, Then it extracts the number", () => {
			expect(filenameToNumber("1_Hello_World.md")).toBe(1);
			expect(filenameToNumber("42_my_post.md")).toBe(42);
		});

		test("When a filename has no numeric prefix, Then it returns null", () => {
			expect(filenameToNumber("no_number.md")).toBeNull();
		});
	});

	describe("Given the extractExcerpt function", () => {
		test("When the body has multiple paragraphs, Then it returns the first paragraph", () => {
			const body = "First paragraph.\n\nSecond paragraph.";
			expect(extractExcerpt(body)).toBe("First paragraph.");
		});

		test("When the body is empty, Then it returns an empty string", () => {
			expect(extractExcerpt("")).toBe("");
		});

		test("When the first paragraph exceeds the limit, Then it truncates with an ellipsis", () => {
			const longText = "a".repeat(200);
			const excerpt = extractExcerpt(longText);
			expect(excerpt.length).toBe(160);
			expect(excerpt.endsWith("...")).toBe(true);
		});
	});

	describe("Given the normalizeTags function", () => {
		test("When given an array of mixed-case tags, Then it returns lowercased trimmed tags", () => {
			expect(normalizeTags(["Beer", "LIFE"])).toEqual(["beer", "life"]);
		});

		test("When given a comma-separated string, Then it splits and normalizes the tags", () => {
			expect(normalizeTags("beer, life")).toEqual(["beer", "life"]);
		});

		test("When given invalid input, Then it returns an empty array", () => {
			expect(normalizeTags(null)).toEqual([]);
			expect(normalizeTags(undefined)).toEqual([]);
			expect(normalizeTags(123)).toEqual([]);
		});

		test("When given an array with non-string values, Then it coerces them to strings", () => {
			expect(normalizeTags([123, "beer", null])).toEqual([
				"123",
				"beer",
				"null",
			]);
		});

		test("When given an array with empty tags, Then they are filtered out", () => {
			expect(normalizeTags(["beer", "", "life"])).toEqual(["beer", "life"]);
		});

		test("When given an empty string, Then it returns an empty array", () => {
			expect(normalizeTags("")).toEqual([]);
		});
	});

	describe("Given the readPostFile function", () => {
		test("When the file has frontmatter, Then it parses title, date, tags, and content", async () => {
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

		test("When frontmatter is missing, Then it falls back to the filename", async () => {
			const filePath = writePost("1_Hello_World.md", "Body content.");

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Hello World");
			expect(post.slug).toBe("hello-world");
			expect(post.number).toBe(1);
		});

		test("When frontmatter has a numeric value, Then it parses the number", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\nnumber: 42\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.number).toBe(42);
		});

		test("When frontmatter has a float value, Then parsing does not fail", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\nversion: 1.5\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			// Float values are parsed but may not be used in Post type
			expect(post).toBeDefined();
		});

		test("When frontmatter has a boolean value, Then it parses the boolean", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ndraft: true\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.draft).toBe(true);
		});

		test("When tags are provided as a string, Then they are split and normalized", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ntags: beer, life\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.tags).toEqual(["beer", "life"]);
		});

		test("When frontmatter values are quoted, Then they are parsed without quotes", async () => {
			const filePath = writePost(
				"test.md",
				'---\ntitle: "Quoted Title"\n---\nBody.',
			);

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Quoted Title");
		});

		test("When frontmatter contains invalid lines, Then valid fields are still parsed", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ninvalid line without colon\nslug: test\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Test");
			expect(post.slug).toBe("test");
		});

		test("When frontmatter has an empty tags array, Then tags are an empty array", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ntags: []\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.tags).toEqual([]);
		});

		test("When frontmatter has quoted array values, Then they are parsed and normalized", async () => {
			const filePath = writePost(
				"test.md",
				"---\ntitle: Test\ntags: [\"beer\", 'life']\n---\nBody.",
			);

			const post = await readPostFile(filePath);

			expect(post.tags).toEqual(["beer", "life"]);
		});
	});

	describe("Given the readPostSummary function", () => {
		test("When reading a post file, Then it returns a summary without content", async () => {
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

	describe("Given the getPostsFromDir function", () => {
		test("When the directory has published posts, Then it returns them sorted by date descending", async () => {
			writePost("1_post-a.md", "---\ntitle: Post A\ndate: 2026-09-27\n---\nA.");
			writePost("2_post-b.md", "---\ntitle: Post B\ndate: 2026-09-28\n---\nB.");

			const posts = await getPostsFromDir(tempDir);

			expect(posts).toHaveLength(2);
			expect(posts[0].title).toBe("Post B");
			expect(posts[1].title).toBe("Post A");
		});

		test("When running in production and a post is a draft, Then it is excluded", async () => {
			const originalNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			writePost("draft.md", "---\ntitle: Draft\ndraft: true\n---\nDraft.");

			const posts = await getPostsFromDir(tempDir);

			expect(posts).toHaveLength(0);

			process.env.NODE_ENV = originalNodeEnv;
		});
	});

	describe("Given the getPostFromDir function", () => {
		test("When the slug matches a published post, Then it returns the post", async () => {
			writePost("1_hello-world.md", "---\ntitle: Hello World\n---\nContent.");

			const post = await getPostFromDir(tempDir, "hello-world");

			expect(post).not.toBeNull();
			expect(post?.title).toBe("Hello World");
		});

		test("When the slug does not exist, Then it returns null", async () => {
			const post = await getPostFromDir(tempDir, "missing");

			expect(post).toBeNull();
		});

		test("When the matching post is a draft in production, Then it returns null", async () => {
			const originalNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			writePost("1_draft.md", "---\ntitle: Draft\ndraft: true\n---\nContent.");

			const post = await getPostFromDir(tempDir, "draft");

			expect(post).toBeNull();

			process.env.NODE_ENV = originalNodeEnv;
		});

		test("When the matching post is a draft in development, Then it returns the post", async () => {
			const originalNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "development";

			writePost("1_draft.md", "---\ntitle: Draft\ndraft: true\n---\nContent.");

			const post = await getPostFromDir(tempDir, "draft");

			expect(post).not.toBeNull();
			expect(post?.title).toBe("Draft");

			process.env.NODE_ENV = originalNodeEnv;
		});
	});

	describe("Given the getAllTags function", () => {
		test("When posts have overlapping tags, Then it returns a sorted unique list", () => {
			const posts = [
				createPostSummary({ tags: ["beer", "life"] }),
				createPostSummary({ tags: ["code", "beer"] }),
			];

			const tags = getAllTags(posts);

			expect(tags).toEqual(["beer", "code", "life"]);
		});
	});

	describe("Given the computeTagCounts function", () => {
		test("When posts have tags, Then it returns counts sorted by tag", () => {
			const posts = [
				createPostSummary({ tags: ["beer", "life"] }),
				createPostSummary({ tags: ["beer"] }),
			];

			const counts = computeTagCounts(posts);

			expect(counts).toEqual([
				{ tag: "beer", count: 2 },
				{ tag: "life", count: 1 },
			]);
		});
	});

	describe("Given the filterPostsByTag function", () => {
		test("When filtering by a tag, Then only posts with that tag are returned", () => {
			const posts = [
				createPostSummary({ tags: ["beer"] }),
				createPostSummary({ tags: ["life"] }),
				createPostSummary({ tags: ["beer", "life"] }),
			];

			const filtered = filterPostsByTag(posts, "beer");

			expect(filtered).toHaveLength(2);
		});

		test("When no tag is provided, Then all posts are returned", () => {
			const posts = [createPostSummary(), createPostSummary()];

			const filtered = filterPostsByTag(posts, undefined);

			expect(filtered).toHaveLength(2);
		});
	});

	describe("Given the sortPosts function", () => {
		test("When posts have different dates, Then it sorts by date descending", () => {
			const posts = [
				createPostSummary({ date: "2026-09-27", title: "A" }),
				createPostSummary({ date: "2026-09-28", title: "B" }),
			];

			const sorted = sortPosts(posts);

			expect(sorted[0].title).toBe("B");
			expect(sorted[1].title).toBe("A");
		});

		test("When dates are equal, Then it sorts by title ascending", () => {
			const posts = [
				createPostSummary({ date: "2026-09-28", title: "Z" }),
				createPostSummary({ date: "2026-09-28", title: "A" }),
			];

			const sorted = sortPosts(posts);

			expect(sorted[0].title).toBe("A");
			expect(sorted[1].title).toBe("Z");
		});

		test("When a post has no date, Then dated posts come first", () => {
			const posts = [
				createPostSummary({ date: null, title: "B" }),
				createPostSummary({ date: "2026-09-28", title: "A" }),
			];

			const sorted = sortPosts(posts);

			expect(sorted[0].title).toBe("A");
			expect(sorted[1].title).toBe("B");
		});

		test("When both posts have no date, Then it sorts by title ascending", () => {
			const posts = [
				createPostSummary({ date: null, title: "Z" }),
				createPostSummary({ date: null, title: "A" }),
			];

			const sorted = sortPosts(posts);

			expect(sorted[0].title).toBe("A");
			expect(sorted[1].title).toBe("Z");
		});
	});

	describe("Given the getAdjacentPosts function", () => {
		test("When the slug is in the middle of the list, Then it returns the previous and next posts", () => {
			const posts = [
				createPostSummary({
					slug: "newer",
					title: "Newer",
					date: "2026-09-29",
				}),
				createPostSummary({
					slug: "current",
					title: "Current",
					date: "2026-09-28",
				}),
				createPostSummary({
					slug: "older",
					title: "Older",
					date: "2026-09-27",
				}),
			];

			const { previous, next } = getAdjacentPosts(posts, "current");

			expect(previous?.slug).toBe("older");
			expect(next?.slug).toBe("newer");
		});

		test("When the slug is the oldest, Then previous is null", () => {
			const posts = [
				createPostSummary({
					slug: "newer",
					title: "Newer",
					date: "2026-09-29",
				}),
				createPostSummary({
					slug: "older",
					title: "Older",
					date: "2026-09-28",
				}),
			];

			const { previous, next } = getAdjacentPosts(posts, "older");

			expect(previous).toBeNull();
			expect(next?.slug).toBe("newer");
		});

		test("When the slug is the newest, Then next is null", () => {
			const posts = [
				createPostSummary({
					slug: "newer",
					title: "Newer",
					date: "2026-09-29",
				}),
				createPostSummary({
					slug: "older",
					title: "Older",
					date: "2026-09-28",
				}),
			];

			const { previous, next } = getAdjacentPosts(posts, "newer");

			expect(previous?.slug).toBe("older");
			expect(next).toBeNull();
		});

		test("When the slug is not found, Then both neighbors are null", () => {
			const posts = [
				createPostSummary({ slug: "only", title: "Only", date: "2026-09-29" }),
			];

			const { previous, next } = getAdjacentPosts(posts, "missing");

			expect(previous).toBeNull();
			expect(next).toBeNull();
		});

		test("When there is only one post, Then both neighbors are null", () => {
			const posts = [createPostSummary({ slug: "only", title: "Only" })];

			const { previous, next } = getAdjacentPosts(posts, "only");

			expect(previous).toBeNull();
			expect(next).toBeNull();
		});
	});

	describe("Given the getContentDir function", () => {
		test("When BLOG_CONTENT_DIR is not set, Then it defaults to the content directory", () => {
			const dir = getContentDir();
			expect(dir).toContain("content");
		});

		test("When BLOG_CONTENT_DIR is set, Then it uses that path", () => {
			const original = process.env.BLOG_CONTENT_DIR;
			process.env.BLOG_CONTENT_DIR = "/custom/path";

			const dir = getContentDir();

			expect(dir).toBe("/custom/path");

			process.env.BLOG_CONTENT_DIR = original;
		});
	});
});
