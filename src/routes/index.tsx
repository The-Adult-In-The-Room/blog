import { createFileRoute, Link } from "@tanstack/react-router";
import TagList from "../components/TagList";
import { getPosts, getTagCounts } from "../lib/posts";

export async function homeLoader() {
	const [posts, tagCounts] = await Promise.all([getPosts(), getTagCounts()]);
	return {
		posts,
		tagCounts,
	};
}

export const Route = createFileRoute("/")({
	loader: homeLoader,
	component: Home,
});

function Home() {
	const { posts, tagCounts } = Route.useLoaderData();

	return (
		<main className="page-wrap px-4 py-12 sm:py-16">
			<section className="mb-12 max-w-2xl">
				<h1 className="display-title mb-2 text-2xl font-medium tracking-tight text-[var(--text-secondary)] sm:text-3xl">
					Thoughts on code, brewing, and whatever nonsense is rattling around in
					my head.
				</h1>
			</section>

			<section className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
						Recent posts
					</h2>
					<Link
						to="/tags"
						className="text-sm font-medium text-[var(--text-secondary)] no-underline transition hover:text-[var(--text-primary)]"
					>
						Browse all tags →
					</Link>
				</div>

				{tagCounts.length > 0 && (
					<nav
						aria-label="Filter posts by tag"
						className="flex flex-wrap gap-1.5"
					>
						{tagCounts.map(({ tag, count }) => (
							<Link
								key={tag}
								to="/tags/$tag"
								params={{ tag }}
								className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)] no-underline transition hover:border-[var(--accent-strong)]/40 hover:text-[var(--text-primary)]"
							>
								{tag}
								<span
									className="text-[var(--text-secondary)]/60"
									aria-hidden="true"
								>
									{count}
								</span>
							</Link>
						))}
					</nav>
				)}

				{posts.length === 0 ? (
					<p className="text-[var(--text-secondary)]">No posts yet.</p>
				) : (
					<ul className="m-0 space-y-4 p-0">
						{posts.map((post) => (
							<li key={post.slug} className="list-none">
								<Link
									to="/posts/$slug"
									params={{ slug: post.slug }}
									className="group block rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 no-underline transition hover:-translate-y-0.5 hover:border-[var(--accent-strong)]/30 hover:bg-[var(--surface-strong)] sm:p-6"
								>
									<article>
										<div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
											{Boolean(post.number) && <p>#{post.number}</p>}
											{post.date ? (
												<time dateTime={post.date}>{post.date}</time>
											) : null}
											<TagList tags={post.tags} asLinks={false} />
										</div>
										<h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-strong)]">
											{post.title}
										</h3>
										{Boolean(post.excerpt) && (
											<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
												{post.excerpt}
											</p>
										)}
									</article>
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}
