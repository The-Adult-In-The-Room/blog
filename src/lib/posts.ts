import fs from "node:fs";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";
import type { Link, Parent, Root } from "mdast";
import type { Plugin } from "unified";
import {
	type PostFrontmatter,
	postFrontmatterSchema,
} from "#/schemas/postFrontmatter";
import { renderMarkdown } from "./markdown";

export type Post = {
	slug: string;
	title: string;
	date: string | null;
	excerpt: string;
	content: string;
	tags: string[];
	number: number | null;
	draft: boolean;
};

export type PostSummary = Pick<
	Post,
	"slug" | "title" | "date" | "excerpt" | "tags" | "number" | "draft"
>;

export const CONTENT_DIR = process.env.BLOG_CONTENT_DIR
	? path.resolve(process.env.BLOG_CONTENT_DIR)
	: path.resolve("content");

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

function parseFrontmatter(data: unknown, filePath: string): PostFrontmatter {
	const result = postFrontmatterSchema.safeParse(data);
	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("; ");
		throw new Error(`Invalid frontmatter in ${filePath}: ${issues}`);
	}
	return result.data;
}

type ParsedPost = {
	slug: string;
	title: string;
	date: string | null;
	excerpt: string;
	rawBody: string;
	tags: string[];
	number: number | null;
	draft: boolean;
};

const postCache = new Map<string, ParsedPost>();
const slugMapCache = new Map<string, ReadonlyMap<string, string>>();

export function clearPostCache(): void {
	postCache.clear();
	slugMapCache.clear();
}

async function parsePostFile(filePath: string): Promise<ParsedPost> {
	const cached = postCache.get(filePath);
	if (cached) return cached;

	const raw = await fs.promises.readFile(filePath, "utf-8");
	const { data, content: rawBody } = matter(raw);
	const frontmatter = parseFrontmatter(data, filePath);

	const slug = frontmatter.slug ?? filenameToSlug(filePath);
	const title = frontmatter.title ?? filenameToTitle(filePath);
	const date = frontmatter.date ?? null;
	const excerpt = frontmatter.excerpt ?? extractExcerpt(rawBody);
	const tags = normalizeTags(frontmatter.tags);
	const number = frontmatter.number ?? filenameToNumber(filePath);

	const draft = frontmatter.draft ?? false;

	const parsed: ParsedPost = {
		slug,
		title,
		date,
		excerpt,
		rawBody,
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

async function buildSlugMap(
	contentDir: string,
): Promise<ReadonlyMap<string, string>> {
	const cached = slugMapCache.get(contentDir);
	if (cached) return cached;

	const files = await fs.promises.readdir(contentDir);
	const map = new Map<string, string>();

	await Promise.all(
		files
			.filter((file) => file.endsWith(".md"))
			.map(async (file) => {
				const filePath = path.join(contentDir, file);
				try {
					const { slug } = await parsePostFile(filePath);
					map.set(file, slug);
				} catch {
					// Skip files with invalid frontmatter; they cannot be linked reliably.
				}
			}),
	);

	slugMapCache.set(contentDir, map);
	return map;
}

function visitLinks(tree: Root, visitor: (link: Link) => void): void {
	function walk(node: Parent | Link): void {
		if (node.type === "link") {
			visitor(node as Link);
			return;
		}

		if ("children" in node && Array.isArray(node.children)) {
			for (const child of node.children) {
				walk(child as Parent | Link);
			}
		}
	}

	walk(tree);
}

function resolveInternalMarkdownLink(
	url: string,
	slugMap: ReadonlyMap<string, string>,
): string | undefined {
	const hashIndex = url.indexOf("#");
	const [pathPart, hash] =
		hashIndex === -1
			? [url, ""]
			: [url.slice(0, hashIndex), url.slice(hashIndex)];

	if (!pathPart.endsWith(".md")) return undefined;

	const filename = pathPart.startsWith("./") ? pathPart.slice(2) : pathPart;
	if (filename.includes("/")) return undefined;

	const slug = slugMap.get(filename);
	if (!slug) return undefined;

	return `/posts/${slug}${hash}`;
}

function createRemarkPostLinks(
	slugMap: ReadonlyMap<string, string>,
): Plugin<[], Root> {
	return function remarkPostLinks() {
		return (tree: Root) => {
			visitLinks(tree, (node) => {
				const resolved = resolveInternalMarkdownLink(node.url, slugMap);
				if (resolved) node.url = resolved;
			});
		};
	};
}

export async function readPostSummary(filePath: string): Promise<PostSummary> {
	const { slug, title, date, excerpt, tags, number, draft } =
		await parsePostFile(filePath);
	return { slug, title, date, excerpt, tags, number, draft };
}

export async function readPostFile(filePath: string): Promise<Post> {
	const { rawBody, ...metadata } = await parsePostFile(filePath);
	const contentDir = path.dirname(filePath);
	const slugMap = await buildSlugMap(contentDir);
	const content = await renderMarkdown(rawBody, [
		createRemarkPostLinks(slugMap),
	]);
	return { ...metadata, content };
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

export function getTagCounts(posts: PostSummary[]): TagCount[] {
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
	async (): Promise<PostSummary[]> => getPostsFromDir(CONTENT_DIR),
);

export const getTags = createServerFn({ method: "GET" }).handler(
	async (): Promise<TagCount[]> => {
		const posts = await getPostsFromDir(CONTENT_DIR);
		return getTagCounts(posts);
	},
);

export const getPost = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(
		async ({ data: slug }): Promise<Post | null> =>
			getPostFromDir(CONTENT_DIR, slug),
	);
/* c8 ignore stop */
