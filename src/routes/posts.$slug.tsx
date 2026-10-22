import { Markdown } from "@tanstack/markdown/react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import PostCard from "#/components/PostCard";
import TagList from "../components/TagList";
import { getAdjacentPosts, getPost, getPosts } from "../lib/posts";

export async function postLoader({ params }: { params: { slug: string } }) {
	const [post, posts] = await Promise.all([
		getPost({ data: params.slug }),
		getPosts(),
	]);
	if (!post) throw notFound();
	const { previous, next } = getAdjacentPosts(posts, post.slug);
	return { post, previous, next };
}

export const Route = createFileRoute("/posts/$slug")({
	loader: postLoader,
	head: ({ loaderData }) => {
		const post = loaderData?.post;
		const title = post?.title ?? "Post";
		const description = post?.excerpt ?? "";
		const meta = [
			{ title },
			{ name: "description", content: description },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:type", content: "article" },
			{ name: "twitter:card", content: "summary" },
		];

		if (post?.date) {
			meta.push({
				property: "article:published_time",
				content: post.date,
			});
		}

		return { meta };
	},
	component: PostPage,
});

function PostPage() {
	const { post, previous, next } = Route.useLoaderData();

	return (
		<article className="page-wrap px-4 py-10 sm:py-14">
			<Link
				to="/"
				className="mb-6 inline-flex text-sm font-medium text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)]"
			>
				← Back home
			</Link>

			<header className="mb-10 max-w-3xl">
				<div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
					{post.number ? (
						<span className="font-medium">#{post.number}</span>
					) : null}
					{post.date ? (
						<time dateTime={post.date} className="font-medium">
							{post.date}
						</time>
					) : null}
					<TagList tags={post.tags} />
				</div>
				<h1 className="display-title mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
					{post.title}
				</h1>
			</header>
			<div className="prose prose-lg max-w-3xl dark:prose-invert">
				<Markdown>{post.content}</Markdown>
			</div>

			{(previous || next) && (
				<nav aria-label="Post navigation" className="mt-16 max-w-3xl">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
						Continue reading
					</h2>
					<div className="grid gap-4 sm:grid-cols-2">
						{previous && (
							<div data-testid="previous-post">
								<span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
									← Previous
								</span>
								<PostCard
									post={previous}
									variant="compact"
									className="h-full"
								/>
							</div>
						)}
						{next && (
							<div data-testid="next-post">
								<span className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
									Next →
								</span>
								<PostCard post={next} variant="compact" className="h-full" />
							</div>
						)}
					</div>
				</nav>
			)}
		</article>
	);
}
