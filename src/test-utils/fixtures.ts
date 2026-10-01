import type { Post, PostSummary } from "../lib/posts";

export const beerPostSummary: PostSummary = {
	slug: "beer-post",
	title: "Beer Post",
	date: "2026-09-28",
	excerpt: "About beer.",
	tags: ["beer", "life"],
	number: 1,
	draft: false,
};

export const lifePostSummary: PostSummary = {
	slug: "life-post",
	title: "Life Post",
	date: "2026-09-27",
	excerpt: "About life.",
	tags: ["life"],
	number: 2,
	draft: false,
};

export const codePostSummary: PostSummary = {
	slug: "code-post",
	title: "Code Post",
	date: "2026-09-26",
	excerpt: "About code.",
	tags: ["code"],
	number: 3,
	draft: false,
};

export const helloWorldPostSummary: PostSummary = {
	slug: "hello-world",
	title: "Hello World",
	date: "2026-09-28",
	excerpt: "A greeting.",
	tags: ["life"],
	number: 1,
	draft: false,
};

export const allPostSummaries = [
	beerPostSummary,
	lifePostSummary,
	codePostSummary,
];

export function createPostSummary(
	overrides: Partial<PostSummary> = {},
): PostSummary {
	return {
		slug: "default-post",
		title: "Default Post",
		date: null,
		excerpt: "",
		tags: [],
		number: null,
		draft: false,
		...overrides,
	};
}

export function createPost(overrides: Partial<Post> = {}): Post {
	return {
		slug: "default-post",
		title: "Default Post",
		date: null,
		excerpt: "",
		content: "<p>Default content.</p>",
		tags: [],
		number: null,
		draft: false,
		...overrides,
	};
}
