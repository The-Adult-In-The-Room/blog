import { createFileRoute, Link } from "@tanstack/react-router";
import TagList from "../components/TagList";
import { getPosts } from "../lib/posts";

export const Route = createFileRoute("/")({
	loader: async () => getPosts(),
	component: Home,
});

function Home() {
	const posts = Route.useLoaderData();

	return (
		<main className="page-wrap px-4 py-12 sm:py-16">
			<section className="mb-12 max-w-2xl">
				<h1 className="display-title mb-2 text-2xl font-medium tracking-tight text-[var(--sea-ink-soft)] sm:text-3xl">
					Thoughts on code, brewing, and whatever nonsense is rattling around in
					my head.
				</h1>
			</section>

			<section className="space-y-6">
				<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
					Recent posts
				</h2>

				{posts.length === 0 ? (
					<p className="text-[var(--sea-ink-soft)]">No posts yet.</p>
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
										{post.date ? (
											<time dateTime={post.date}>{post.date}</time>
										) : null}
										<TagList tags={post.tags} />
									</div>
									<h3 className="mt-1 text-xl font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
										{post.title}
									</h3>
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
			</section>
		</main>
	);
}
