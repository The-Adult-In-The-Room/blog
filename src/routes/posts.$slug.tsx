import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPost } from "../lib/posts";

export const Route = createFileRoute("/posts/$slug")({
	loader: async ({ params }) => {
		const post = await getPost({ data: params.slug });
		if (!post) throw notFound();
		return post;
	},
	component: PostPage,
});

function PostPage() {
	const post = Route.useLoaderData();

	return (
		<article className="page-wrap px-4 py-10 sm:py-14">
			<Link
				to="/"
				className="mb-6 inline-flex text-sm font-medium text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
			>
				← Back home
			</Link>

			<header className="mb-10 max-w-3xl">
				{post.date ? (
					<time
						dateTime={post.date}
						className="text-sm font-medium text-[var(--sea-ink-soft)]"
					>
						{post.date}
					</time>
				) : null}
				<h1 className="display-title mt-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
					{post.title}
				</h1>
			</header>

			<div
				className="prose prose-lg max-w-3xl dark:prose-invert"
				dangerouslySetInnerHTML={{ __html: post.content }}
			/>
		</article>
	);
}
