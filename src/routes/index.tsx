import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import TagFilter from "../components/TagFilter";
import TagList from "../components/TagList";
import { filterPostsByTag, getAllTags, getPosts } from "../lib/posts";

const homeSearchSchema = z.object({
	tag: z.string().optional().catch(undefined),
});

export async function homeLoader() {
	return getPosts();
}

export const Route = createFileRoute("/")({
	loader: homeLoader,
	validateSearch: homeSearchSchema,
	component: Home,
});

function Home() {
	const posts = Route.useLoaderData();
	const { tag } = Route.useSearch();
	const activeTag = tag?.toLowerCase().trim();

	const filteredPosts = filterPostsByTag(posts, activeTag);

	const allTags = getAllTags(posts);

	return (
		<main className="page-wrap px-4 py-12 sm:py-16">
			<section className="mb-12 max-w-2xl">
				<h1 className="display-title mb-2 text-2xl font-medium tracking-tight text-[var(--sea-ink-soft)] sm:text-3xl">
					Thoughts on code, brewing, and whatever nonsense is rattling around in
					my head.
				</h1>
			</section>

			<section className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
						Recent posts
					</h2>
					<TagFilter tags={allTags} activeTag={activeTag} />
				</div>

				{filteredPosts.length === 0 ? (
					activeTag ? (
						<p className="text-[var(--sea-ink-soft)]">
							No posts found with the tag “{activeTag}”.
						</p>
					) : (
						<p className="text-[var(--sea-ink-soft)]">No posts yet.</p>
					)
				) : (
					<ul className="m-0 space-y-4 p-0">
						{filteredPosts.map((post) => (
							<li key={post.slug} className="list-none">
								<Link
									to="/posts/$slug"
									params={{ slug: post.slug }}
									className="group block rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 no-underline transition hover:-translate-y-0.5 hover:border-[var(--lagoon-deep)]/30 hover:bg-[var(--surface-strong)] sm:p-6"
								>
									<article>
										<div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
											{Boolean(post.number) && <p>#{post.number}</p>}
											{post.date ? (
												<time dateTime={post.date}>{post.date}</time>
											) : null}
											<TagList tags={post.tags} asLinks={false} />
										</div>
										<h3 className="mt-1 text-xl font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
											{post.title}
										</h3>
										{Boolean(post.excerpt) && (
											<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
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
