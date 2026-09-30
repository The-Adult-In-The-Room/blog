import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createPostSummary } from "../test-utils/fixtures";
import {
	clearPostCache,
	extractExcerpt,
	filenameToNumber,
	filenameToSlug,
	filenameToTitle,
	getPostFromDir,
	getPostsFromDir,
	normalizeTags,
	type PostSummary,
	readPostFile,
	readPostSummary,
	sortPosts,
} from "./posts";

describe("Given a filename with a numeric prefix", () => {
	test("When converting to a slug, Then the prefix and extension are removed and words become kebab-case", () => {
		expect(filenameToSlug("1_Hello_World.md")).toBe("hello-world");
	});

	test("When converting to a title, Then the prefix and extension are removed and words become title-case", () => {
		expect(filenameToTitle("1_Hello_World.md")).toBe("Hello World");
	});

	test("When extracting the number, Then the numeric prefix is returned", () => {
		expect(filenameToNumber("1_Hello_World.md")).toBe(1);
	});
});

describe("Given a filename without a numeric prefix", () => {
	test("When converting to a slug, Then the extension is removed and words become kebab-case", () => {
		expect(filenameToSlug("Hello_World.md")).toBe("hello-world");
	});

	test("When converting to a title, Then the extension is removed and words become title-case", () => {
		expect(filenameToTitle("Hello_World.md")).toBe("Hello World");
	});

	test("When extracting the number, Then null is returned", () => {
		expect(filenameToNumber("Hello_World.md")).toBeNull();
	});
});

describe("Given a filename with a full path", () => {
	test("When converting to a slug, Then only the basename is considered", () => {
		expect(filenameToSlug("/some/path/2_My_Post_Name.md")).toBe("my-post-name");
	});

	test("When converting to a title, Then only the basename is considered", () => {
		expect(filenameToTitle("/some/path/2_My_Post_Name.md")).toBe(
			"My Post Name",
		);
	});

	test("When extracting the number, Then only the basename is considered", () => {
		expect(filenameToNumber("/some/path/2_My_Post_Name.md")).toBe(2);
	});
});

describe("Given tag input in various formats", () => {
	test("When tags are provided as an array of strings, Then they are normalized to lowercase", () => {
		expect(normalizeTags(["Beer", "LIFE", "Code"])).toEqual([
			"beer",
			"life",
			"code",
		]);
	});

	test("When tags contain whitespace, Then it is trimmed", () => {
		expect(normalizeTags(["  Beer  ", "  Life  "])).toEqual(["beer", "life"]);
	});

	test("When tags are provided as a comma-separated string, Then they are split and normalized", () => {
		expect(normalizeTags("Beer, Life, Code")).toEqual(["beer", "life", "code"]);
	});

	test("When tags contain empty or whitespace-only entries, Then they are removed", () => {
		expect(normalizeTags(["beer", "", "  ", "life"])).toEqual(["beer", "life"]);
		expect(normalizeTags("beer,, life")).toEqual(["beer", "life"]);
	});

	test("When tags are null, undefined, or an empty array, Then an empty array is returned", () => {
		expect(normalizeTags(null)).toEqual([]);
		expect(normalizeTags(undefined)).toEqual([]);
		expect(normalizeTags([])).toEqual([]);
		expect(normalizeTags("")).toEqual([]);
	});

	test("When tags contain non-string values in an array, Then they are coerced to strings", () => {
		expect(normalizeTags(["beer", 42, "life"])).toEqual(["beer", "42", "life"]);
	});
});

describe("Given markdown body content", () => {
	test("When extracting an excerpt, Then the first paragraph is returned", () => {
		expect(extractExcerpt("First paragraph.\n\nSecond paragraph.")).toBe(
			"First paragraph.",
		);
	});

	test("When the content starts with a heading, Then the heading is ignored", () => {
		expect(extractExcerpt("# Title\n\nFirst paragraph.")).toBe(
			"First paragraph.",
		);
	});

	test("When the first paragraph exceeds 160 characters, Then it is truncated with an ellipsis", () => {
		const longParagraph = "a".repeat(200);
		expect(extractExcerpt(longParagraph)).toBe(`${"a".repeat(157)}...`);
	});

	test("When the content only contains headings, Then an empty string is returned", () => {
		expect(extractExcerpt("# One\n## Two")).toBe("");
	});

	test("When the content is empty, Then an empty string is returned", () => {
		expect(extractExcerpt("")).toBe("");
	});

	test("When a paragraph spans multiple lines, Then internal whitespace is collapsed", () => {
		expect(extractExcerpt("First\nline\nparagraph.\n\nSecond.")).toBe(
			"First line paragraph.",
		);
	});
});

describe("Given a temporary content directory", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-posts-test-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
		clearPostCache();
	});

	function writePost(filename: string, content: string): string {
		const filePath = path.join(tempDir, filename);
		fs.writeFileSync(filePath, content, "utf-8");
		return filePath;
	}

	describe("When reading a post file with full frontmatter", () => {
		test("Then the frontmatter values take precedence", async () => {
			const filePath = writePost(
				"1_Filename_Title.md",
				[
					"---",
					"title: Frontmatter Title",
					"date: 2026-09-28",
					"slug: frontmatter-slug",
					"excerpt: Frontmatter excerpt.",
					"tags: [beer, life]",
					"number: 42",
					"---",
					"Body content.",
				].join("\n"),
			);

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Frontmatter Title");
			expect(post.date).toBe("2026-09-28");
			expect(post.slug).toBe("frontmatter-slug");
			expect(post.excerpt).toBe("Frontmatter excerpt.");
			expect(post.tags).toEqual(["beer", "life"]);
			expect(post.number).toBe(42);
			expect(post.content).toContain("<p>Body content.</p>");
			expect(post).not.toHaveProperty("rawBody");
		});
	});

	describe("When reading a post file without frontmatter", () => {
		test("Then values are inferred from the filename", async () => {
			const filePath = writePost(
				"1_Hello_World.md",
				"First paragraph of the post.\n\nSecond paragraph.",
			);

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Hello World");
			expect(post.slug).toBe("hello-world");
			expect(post.number).toBe(1);
			expect(post.date).toBeNull();
			expect(post.tags).toEqual([]);
			expect(post.excerpt).toBe("First paragraph of the post.");
		});
	});

	describe("When reading a post file with partial frontmatter", () => {
		test("Then provided frontmatter values are used and missing values fallback to the filename", async () => {
			const filePath = writePost(
				"2_My_Post.md",
				["---", "title: Override Title", "---", "Body content."].join("\n"),
			);

			const post = await readPostFile(filePath);

			expect(post.title).toBe("Override Title");
			expect(post.slug).toBe("my-post");
			expect(post.number).toBe(2);
			expect(post.date).toBeNull();
		});
	});

	describe("When tags are provided as a comma-separated frontmatter string", () => {
		test("Then they are normalized to an array", async () => {
			const filePath = writePost(
				"post.md",
				["---", "tags: Beer, Life, Code", "---", "Body."].join("\n"),
			);

			const post = await readPostFile(filePath);

			expect(post.tags).toEqual(["beer", "life", "code"]);
		});
	});

	describe("When reading a post summary", () => {
		test("Then metadata is returned without rendered content", async () => {
			const filePath = writePost(
				"1_Hello_World.md",
				["---", "title: Summary Title", "---", "Body content."].join("\n"),
			);

			const summary = await readPostSummary(filePath);

			expect(summary).toEqual({
				slug: "hello-world",
				title: "Summary Title",
				date: null,
				excerpt: "Body content.",
				tags: [],
				number: 1,
			});
			expect(summary).not.toHaveProperty("content");
		});
	});

	describe("When frontmatter has an invalid date", () => {
		test("Then it throws a clear error identifying the file and field", async () => {
			const filePath = writePost(
				"post.md",
				["---", "date: not-a-date", "---", "Body."].join("\n"),
			);

			await expect(readPostFile(filePath)).rejects.toThrow(
				`Invalid frontmatter in ${filePath}: date: Invalid date: "not-a-date"`,
			);
		});
	});

	describe("When frontmatter date is a numeric timestamp", () => {
		test("Then it is normalized to an ISO date string", async () => {
			const filePath = writePost(
				"post.md",
				["---", "date: 1727654400000", "---", "Body."].join("\n"),
			);

			const post = await readPostFile(filePath);

			expect(post.date).toBe("2024-09-30");
		});
	});

	describe("When frontmatter has an invalid title type", () => {
		test("Then it throws a clear error identifying the field", async () => {
			const filePath = writePost(
				"post.md",
				["---", "title: 123", "---", "Body."].join("\n"),
			);

			await expect(readPostFile(filePath)).rejects.toThrow(/title:/);
			await expect(readPostFile(filePath)).rejects.toThrow(
				/expected string, received number/i,
			);
		});
	});

	describe("When frontmatter has an empty title", () => {
		test("Then it throws a clear error", async () => {
			const filePath = writePost(
				"post.md",
				["---", 'title: ""', "---", "Body."].join("\n"),
			);

			await expect(readPostFile(filePath)).rejects.toThrow(
				/Title must be a non-empty string/i,
			);
		});
	});

	describe("When frontmatter has an invalid slug", () => {
		test("Then it throws a clear error", async () => {
			const filePath = writePost(
				"post.md",
				["---", "slug: hello world", "---", "Body."].join("\n"),
			);

			await expect(readPostFile(filePath)).rejects.toThrow(
				/Slug must contain only lowercase letters, numbers, and hyphens/i,
			);
		});
	});

	describe("When frontmatter has an invalid number type", () => {
		test("Then it throws a clear error identifying the field", async () => {
			const filePath = writePost(
				"post.md",
				["---", "number: one", "---", "Body."].join("\n"),
			);

			await expect(readPostFile(filePath)).rejects.toThrow(/number:/);
			await expect(readPostFile(filePath)).rejects.toThrow(
				/expected number, received string/i,
			);
		});
	});

	describe("When frontmatter has a non-integer number", () => {
		test("Then it throws a clear error", async () => {
			const filePath = writePost(
				"post.md",
				["---", "number: 3.14", "---", "Body."].join("\n"),
			);

			await expect(readPostFile(filePath)).rejects.toThrow(
				/Number must be an integer/i,
			);
		});
	});

	describe("When frontmatter has invalid tags", () => {
		test("Then it throws a clear error identifying the field", async () => {
			const filePath = writePost(
				"post.md",
				["---", "tags: 42", "---", "Body."].join("\n"),
			);

			await expect(readPostFile(filePath)).rejects.toThrow(/tags:/);
			await expect(readPostFile(filePath)).rejects.toThrow(
				/Invalid frontmatter/i,
			);
		});
	});

	describe("When the same post file is read multiple times", () => {
		test("Then the file is only read from disk once", async () => {
			const filePath = writePost("1_Hello_World.md", "Body content.");
			const readFileSpy = vi.spyOn(fs.promises, "readFile");

			await readPostSummary(filePath);
			await readPostFile(filePath);

			expect(readFileSpy).toHaveBeenCalledTimes(1);
			expect(readFileSpy).toHaveBeenCalledWith(filePath, "utf-8");

			readFileSpy.mockRestore();
		});
	});

	describe("When listing posts from a directory", () => {
		test("Then only markdown files are read and returned as summaries", async () => {
			writePost("1_First.md", "First post body.");
			writePost("2_Second.md", "Second post body.");
			writePost("notes.txt", "This should be ignored.");

			const posts = await getPostsFromDir(tempDir);

			expect(posts).toHaveLength(2);
			expect(posts.map((p) => p.slug)).toEqual(["first", "second"]);
			expect(posts[0]).not.toHaveProperty("content");
		});

		test("Then posts are sorted by date descending regardless of numeric prefix", async () => {
			writePost(
				"1_Older.md",
				["---", "date: 2026-01-01", "---", "Older."].join("\n"),
			);
			writePost(
				"2_Newer.md",
				["---", "date: 2026-12-01", "---", "Newer."].join("\n"),
			);

			const posts = await getPostsFromDir(tempDir);

			expect(posts.map((p) => p.slug)).toEqual(["newer", "older"]);
		});

		test("Then posts without numbers are sorted by date descending", async () => {
			writePost(
				"Old.md",
				["---", "date: 2026-01-01", "---", "Old."].join("\n"),
			);
			writePost(
				"New.md",
				["---", "date: 2026-12-01", "---", "New."].join("\n"),
			);

			const posts = await getPostsFromDir(tempDir);

			expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
		});

		test("Then an empty directory returns an empty array", async () => {
			const posts = await getPostsFromDir(tempDir);
			expect(posts).toEqual([]);
		});
	});

	describe("When fetching a single post from a directory", () => {
		test("Then the matching post is returned", async () => {
			writePost("1_Target.md", "Target body.");
			writePost("2_Other.md", "Other body.");

			const post = await getPostFromDir(tempDir, "target");

			expect(post).not.toBeNull();
			expect(post?.title).toBe("Target");
		});

		test("Then null is returned when no post matches the slug", async () => {
			writePost("1_Only.md", "Only body.");

			const post = await getPostFromDir(tempDir, "missing");

			expect(post).toBeNull();
		});
	});
});

describe("Given a list of post summaries", () => {
	test("When posts have numbers and dates, Then they are sorted by date descending", () => {
		const posts: PostSummary[] = [
			createPostSummary({
				slug: "older",
				title: "Older",
				number: 1,
				date: "2026-01-01",
			}),
			createPostSummary({
				slug: "newer",
				title: "Newer",
				number: 2,
				date: "2026-12-01",
			}),
		];

		expect(sortPosts(posts).map((p) => p.slug)).toEqual(["newer", "older"]);
	});

	test("When posts share the same date, Then they are sorted by title ascending", () => {
		const posts: PostSummary[] = [
			createPostSummary({ slug: "b", title: "Beta", date: "2026-06-01" }),
			createPostSummary({ slug: "a", title: "Alpha", date: "2026-06-01" }),
		];

		expect(sortPosts(posts).map((p) => p.slug)).toEqual(["a", "b"]);
	});

	test("When posts have no numbers but have dates, Then they are sorted by date descending", () => {
		const posts: PostSummary[] = [
			createPostSummary({ slug: "old", title: "Old", date: "2026-01-01" }),
			createPostSummary({ slug: "new", title: "New", date: "2026-12-01" }),
		];

		expect(sortPosts(posts).map((p) => p.slug)).toEqual(["new", "old"]);
	});

	test("When one post has a date and another does not, Then the dated post comes first", () => {
		const posts: PostSummary[] = [
			createPostSummary({ slug: "undated", title: "Undated" }),
			createPostSummary({ slug: "dated", title: "Dated", date: "2026-06-01" }),
		];

		expect(sortPosts(posts).map((p) => p.slug)).toEqual(["dated", "undated"]);
	});

	test("When posts have neither numbers nor dates, Then they are sorted by title ascending", () => {
		const posts: PostSummary[] = [
			createPostSummary({ slug: "b", title: "Beta" }),
			createPostSummary({ slug: "a", title: "Alpha" }),
		];

		expect(sortPosts(posts).map((p) => p.slug)).toEqual(["a", "b"]);
	});

	test("When sorting, Then the original array is not mutated", () => {
		const posts: PostSummary[] = [
			createPostSummary({ slug: "b", title: "B", number: 2 }),
			createPostSummary({ slug: "a", title: "A", number: 1 }),
		];

		sortPosts(posts);

		expect(posts.map((p) => p.slug)).toEqual(["b", "a"]);
	});
});
