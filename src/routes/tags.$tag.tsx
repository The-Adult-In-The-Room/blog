import { createFileRoute, Link } from "@tanstack/react-router";
import TagList from "../components/TagList";
import { getPosts } from "../lib/posts";

export const Route = createFileRoute("/tags/$tag")({
	loader: async ({ params }) => {
		const posts = await getPosts();
		const tag = params.tag.toLowerCase().trim();
		return { tag, posts: posts.filter((post) => post.tags.includes(tag)) };
	},
	component: TagPage,
});

function TagPage() {
	const { tag, posts } = Route.useLoaderData();

	return (
		<main className="page-wrap px-4 py-12 sm:py-16">
			<Link
				to="/"
				className="mb-6 inline-flex text-sm font-medium text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
			>
				← Back home
			</Link>

			<header className="mb-10">
				<h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
					Posts tagged “{tag}”
				</h1>
				<p className="mt-2 text-[var(--sea-ink-soft)]">
					{posts.length} {posts.length === 1 ? "post" : "posts"}
				</p>
			</header>

			{posts.length === 0 ? (
				<p className="text-[var(--sea-ink-soft)]">
					No posts found with this tag.
				</p>
			) : (
				<ul className="m-0 space-y-4 p-0">
					{posts.map((post) => (
						<li key={post.slug} className="list-none">
							<Link
								to="/posts/$slug"
								params={{ slug: post.slug }}
								className="group block rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 no-underline transition hover:-translate-y-0.5 hover:border-[var(--lagoon-deep)]/30 hover:bg-[var(--surface-strong)] sm:p-6"
							>
								<div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
									{post.number ? <span>#{post.number}</span> : null}
									{post.date ? (
										<time dateTime={post.date}>{post.date}</time>
									) : null}
									<TagList tags={post.tags} />
								</div>
								<h2 className="mt-1 text-xl font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
									{post.title}
								</h2>
								{post.excerpt ? (
									<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
										{post.excerpt}
									</p>
								) : null}
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
