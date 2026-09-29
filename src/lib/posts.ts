import fs from "node:fs";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import matter from "gray-matter";
import { marked } from "marked";

export type Post = {
	slug: string;
	title: string;
	date: string | null;
	excerpt: string;
	content: string;
	tags: string[];
};

export type PostSummary = Pick<
	Post,
	"slug" | "title" | "date" | "excerpt" | "tags"
>;

const CONTENT_DIR = path.resolve("content");

function filenameToSlug(filename: string): string {
	const base = path.basename(filename, path.extname(filename));
	// Strip optional numeric prefix like "1_"
	return base.replace(/^\d+_/, "").replace(/_/g, "-").toLowerCase();
}

function filenameToTitle(filename: string): string {
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

function extractExcerpt(body: string): string {
	const paragraphs = body
		.replace(/^#{1,6}\s+.+$/gm, "")
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);

	if (paragraphs.length === 0) return "";

	const first = paragraphs[0].replace(/\s+/g, " ");
	return first.length > 160 ? `${first.slice(0, 157)}...` : first;
}

function normalizeTags(input: unknown): string[] {
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

async function readPostFile(filePath: string): Promise<Post> {
	const raw = await fs.promises.readFile(filePath, "utf-8");
	const { data, content: body } = matter(raw);
	const slug = data.slug ?? filenameToSlug(filePath);
	const title = data.title ?? filenameToTitle(filePath);
	const date = data.date
		? new Date(data.date).toISOString().slice(0, 10)
		: null;
	const excerpt = data.excerpt ?? extractExcerpt(body);
	const content = await marked(body);
	const tags = normalizeTags(data.tags);

	return { slug, title, date, excerpt, content, tags };
}

export const getPosts = createServerFn({ method: "GET" }).handler(
	async (): Promise<PostSummary[]> => {
		const files = await fs.promises.readdir(CONTENT_DIR);
		const posts = await Promise.all(
			files
				.filter((file) => file.endsWith(".md"))
				.map((file) => readPostFile(path.join(CONTENT_DIR, file))),
		);

		return posts
			.map(({ slug, title, date, excerpt, tags }) => ({
				slug,
				title,
				date,
				excerpt,
				tags,
			}))
			.sort((a, b) => {
				if (a.date && b.date) return b.date.localeCompare(a.date);
				if (a.date) return -1;
				if (b.date) return 1;
				return a.title.localeCompare(b.title);
			});
	},
);

export const getPost = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(async ({ data: slug }): Promise<Post | null> => {
		const files = await fs.promises.readdir(CONTENT_DIR);
		const file = files.find(
			(f) => f.endsWith(".md") && filenameToSlug(f) === slug,
		);

		if (!file) return null;

		return readPostFile(path.join(CONTENT_DIR, file));
	});
