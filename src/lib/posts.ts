import fs from "node:fs";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";
import { renderMarkdown } from "./markdown";

export type Post = {
	slug: string;
	title: string;
	date: string | null;
	excerpt: string;
	content: string;
	tags: string[];
	number: number | null;
};

export type PostSummary = Pick<
	Post,
	"slug" | "title" | "date" | "excerpt" | "tags" | "number"
>;

export const CONTENT_DIR = path.resolve("content");

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

export async function readPostFile(filePath: string): Promise<Post> {
	const raw = await fs.promises.readFile(filePath, "utf-8");
	const { data, content: body } = matter(raw);
	const slug = data.slug ?? filenameToSlug(filePath);
	const title = data.title ?? filenameToTitle(filePath);
	const date = data.date
		? new Date(data.date).toISOString().slice(0, 10)
		: null;
	const excerpt = data.excerpt ?? extractExcerpt(body);
	const content = await renderMarkdown(body);
	const tags = normalizeTags(data.tags);
	const number = data.number ?? filenameToNumber(filePath);

	return { slug, title, date, excerpt, content, tags, number };
}

export function sortPosts(posts: PostSummary[]): PostSummary[] {
	return [...posts].sort((a, b) => {
		if (a.number && b.number) return a.number - b.number;
		if (a.date && b.date) return b.date.localeCompare(a.date);
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
			.map((file) => readPostFile(path.join(contentDir, file))),
	);

	return sortPosts(
		posts.map(({ slug, title, date, excerpt, tags, number }) => ({
			slug,
			title,
			date,
			excerpt,
			tags,
			number,
		})),
	);
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

	return readPostFile(path.join(contentDir, file));
}

/* c8 ignore start */
export const getPosts = createServerFn({ method: "GET" }).handler(
	async (): Promise<PostSummary[]> => getPostsFromDir(CONTENT_DIR),
);

export const getPost = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(
		async ({ data: slug }): Promise<Post | null> =>
			getPostFromDir(CONTENT_DIR, slug),
	);
/* c8 ignore stop */
