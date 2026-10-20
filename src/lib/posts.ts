import fs from "node:fs";
import path from "node:path";
import type { MarkdownDocument } from "@tanstack/markdown";
import { parseMarkdown } from "@tanstack/markdown/parser";
import { createServerFn } from "@tanstack/react-start";
import type { PostFrontmatter } from "#/schemas/postFrontmatter";
import { postFrontmatterSchema } from "#/schemas/postFrontmatter";

export type Post = {
	slug: string;
	title: string;
	date: string | null;
	excerpt: string;
	content: MarkdownDocument;
	tags: string[];
	number: number | null;
	draft: boolean;
};

export type PostSummary = Pick<
	Post,
	"slug" | "title" | "date" | "excerpt" | "tags" | "number" | "draft"
>;

export function getContentDir(): string {
	return process.env.BLOG_CONTENT_DIR
		? path.resolve(process.env.BLOG_CONTENT_DIR)
		: path.resolve("content");
}

export function filenameToSlug(filename: string): string {
	const base = path.basename(filename, path.extname(filename));
	// Strip optional numeric prefix like "1_"
	return base.replace(/^\d+_/, "").replace(/_/g, "-").toLowerCase();
}

export function filenameToTitle(filename: string): string {
	const base = path.basename(filename, path.extname(filename));
	const words = base
		.replace(/^\d+_/, "")
		.replace(/_/g, " ")
		.split(" ")
		.map((word) =>
			word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "",
		);
	return words.join(" ");
}

export function filenameToNumber(filename: string): number | null {
	const base = path.basename(filename, path.extname(filename));
	const match = base.match(/^(\d+)_/);
	return match ? Number.parseInt(match[1], 10) : null;
}

export function extractExcerpt(body: string): string {
	const paragraphs = body
		.replace(/^#{1,6}\s+.+$/gm, "")
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);

	if (paragraphs.length === 0) return "";

	const first = paragraphs[0].replace(/\s+/g, " ");
	return first.length > 160 ? `${first.slice(0, 157)}...` : first;
}

export function normalizeTags(input: unknown): string[] {
	if (Array.isArray(input)) {
		return input
			.map((tag) => String(tag).toLowerCase().trim())
			.filter((tag) => tag.length > 0);
	}

	if (typeof input === "string" && input.length > 0) {
		return input
			.split(",")
			.map((tag) => tag.toLowerCase().trim())
			.filter(Boolean);
	}

	return [];
}

type ParsedPost = {
	slug: string;
	title: string;
	date: string | null;
	excerpt: string;
	document: MarkdownDocument;
	tags: string[];
	number: number | null;
	draft: boolean;
};

const postCache = new Map<string, ParsedPost>();

export function clearPostCache(): void {
	postCache.clear();
	clearTagCountsCache();
}

async function parsePostFile(filePath: string): Promise<ParsedPost> {
	const cached = postCache.get(filePath);
	if (cached) return cached;

	const raw = await fs.promises.readFile(filePath, "utf-8");
	const document = parseMarkdown(raw, {
		frontmatter: true,
		headingIds: true,
	});

	// Extract and validate frontmatter from the parsed document
	let frontmatter: PostFrontmatter = {};
	if (document.frontmatter) {
		try {
			const matter = (await import("gray-matter")).default;
			const { data } = matter(`---\n${document.frontmatter}\n---`);
			const result = postFrontmatterSchema.safeParse(data);
			if (result.success) {
				frontmatter = result.data;
			}
		} catch {
			// If YAML parsing fails, use empty frontmatter
			frontmatter = {};
		}
	}

	const slug = frontmatter.slug ?? filenameToSlug(filePath);
	const title = frontmatter.title ?? filenameToTitle(filePath);
	const date = frontmatter.date ?? null;
	// Extract excerpt from document content (without frontmatter)
	const bodyContent = raw.replace(/^---[\s\S]*?---\r?\n/, "").trim();
	const excerpt = frontmatter.excerpt ?? extractExcerpt(bodyContent);
	const tags = normalizeTags(frontmatter.tags);
	const number = frontmatter.number ?? filenameToNumber(filePath);
	const draft = frontmatter.draft ?? false;

	const parsed: ParsedPost = {
		slug,
		title,
		date,
		excerpt,
		document,
		tags,
		number,
		draft,
	};
	postCache.set(filePath, parsed);
	return parsed;
}
function isProduction(): boolean {
	return process.env.NODE_ENV === "production" || import.meta.env.PROD;
}

function isPublished(post: { draft: boolean }): boolean {
	return !post.draft || !isProduction();
}

export async function readPostSummary(filePath: string): Promise<PostSummary> {
	const { slug, title, date, excerpt, tags, number, draft } =
		await parsePostFile(filePath);
	return { slug, title, date, excerpt, tags, number, draft };
}

export async function readPostFile(filePath: string): Promise<Post> {
	const { document, ...metadata } = await parsePostFile(filePath);
	return { ...metadata, content: document };
}

export function getAllTags(posts: PostSummary[]): string[] {
	const tagSet = new Set<string>();
	for (const post of posts) {
		for (const tag of post.tags) {
			tagSet.add(tag);
		}
	}
	return Array.from(tagSet).sort();
}

export type TagCount = {
	tag: string;
	count: number;
};

export function computeTagCounts(posts: PostSummary[]): TagCount[] {
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return Array.from(counts.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => a.tag.localeCompare(b.tag));
}

let cachedTagCounts: TagCount[] | null = null;

export function clearTagCountsCache(): void {
	cachedTagCounts = null;
}

export function filterPostsByTag(
	posts: PostSummary[],
	tag: string | undefined,
): PostSummary[] {
	if (!tag) return posts;
	const normalized = tag.toLowerCase().trim();
	return posts.filter((post) => post.tags.includes(normalized));
}

export function sortPosts(posts: PostSummary[]): PostSummary[] {
	return [...posts].sort((a, b) => {
		if (a.date && b.date) {
			const dateComparison = b.date.localeCompare(a.date);
			if (dateComparison !== 0) return dateComparison;
			return a.title.localeCompare(b.title);
		}
		if (a.date) return -1;
		if (b.date) return 1;
		return a.title.localeCompare(b.title);
	});
}

export async function getPostsFromDir(
	contentDir: string,
): Promise<PostSummary[]> {
	const files = await fs.promises.readdir(contentDir);
	const posts = await Promise.all(
		files
			.filter((file) => file.endsWith(".md"))
			.map((file) => readPostSummary(path.join(contentDir, file))),
	);

	return sortPosts(posts.filter(isPublished));
}

export async function getPostFromDir(
	contentDir: string,
	slug: string,
): Promise<Post | null> {
	const files = await fs.promises.readdir(contentDir);
	const file = files.find(
		(f) => f.endsWith(".md") && filenameToSlug(f) === slug,
	);

	if (!file) return null;

	const post = await readPostFile(path.join(contentDir, file));
	return isPublished(post) ? post : null;
}

/* c8 ignore start */
export const getPosts = createServerFn({ method: "GET" }).handler(
	async (): Promise<PostSummary[]> => getPostsFromDir(getContentDir()),
);

export const getPost = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(
		async ({ data: slug }): Promise<Post | null> =>
			getPostFromDir(getContentDir(), slug),
	);

export const getTagCounts = createServerFn({ method: "GET" }).handler(
	async (): Promise<TagCount[]> => {
		if (cachedTagCounts) return cachedTagCounts;
		const posts = await getPosts();
		cachedTagCounts = computeTagCounts(posts);
		return cachedTagCounts;
	},
);
/* c8 ignore stop */
