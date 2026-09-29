import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import TagList from "../components/TagList";
import { getPost } from "../lib/posts";

export async function postLoader({ params }: { params: { slug: string } }) {
	const post = await getPost({ data: params.slug });
	if (!post) throw notFound();
	return post;
}

export const Route = createFileRoute("/posts/$slug")({
	loader: postLoader,
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
				<div className="flex flex-wrap items-center gap-3 text-sm text-[var(--sea-ink-soft)]">
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
				<h1 className="display-title mt-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
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
