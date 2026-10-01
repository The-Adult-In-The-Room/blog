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
	head: ({ loaderData }) => {
		const post = loaderData;
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
