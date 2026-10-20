import { createFileRoute, Link } from "@tanstack/react-router";
import TagCloud from "../components/TagCloud";
import TagList from "../components/TagList";
import { filterPostsByTag, getPosts, getTagCounts } from "../lib/posts";

export async function tagLoader({ params }: { params: { tag: string } }) {
	const [posts, tagCounts] = await Promise.all([getPosts(), getTagCounts()]);
	const activeTag = params.tag.toLowerCase().trim();
	const filteredPosts = filterPostsByTag(posts, activeTag);

	return {
		tag: activeTag,
		posts: filteredPosts,
		tagCounts,
	};
}

export const Route = createFileRoute("/tags/$tag")({
	loader: tagLoader,
	component: TagPage,
});

function TagPage() {
	const { tag, posts, tagCounts } = Route.useLoaderData();

	return (
		<main className="page-wrap px-4 py-12 sm:py-16">
			<section className="mb-10 max-w-2xl">
				<div className="mb-4 flex items-center gap-2 text-sm">
					<Link
						to="/"
						className="text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)]"
					>
						Home
					</Link>
					<span className="text-[var(--text-secondary)]">/</span>
					<Link
						to="/tags"
						className="text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)]"
					>
						Tags
					</Link>
				</div>
				<h1 className="display-title mb-2 text-2xl font-medium tracking-tight text-[var(--text-secondary)] sm:text-3xl">
					Posts tagged &quot;{tag}&quot;
				</h1>
			</section>

			<section className="space-y-6">
				{tagCounts.length > 0 && (
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
							All tags
						</h2>
						<TagCloud
							tags={tagCounts}
							activeTag={tag}
							ariaLabel="Filter posts by tag"
						/>
					</div>
				)}

				{posts.length === 0 ? (
					<p className="text-[var(--text-secondary)]">
						No posts found with the tag &quot;{tag}&quot;.
					</p>
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
