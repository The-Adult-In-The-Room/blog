import { createFileRoute, Link } from "@tanstack/react-router";
import PostCard from "#/components/PostCard";
import TagCloud from "../components/TagCloud";
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

				<TagCloud tags={tagCounts} ariaLabel="Filter posts by tag" />

				{posts.length === 0 ? (
					<p className="text-[var(--text-secondary)]">No posts yet.</p>
				) : (
					<ul className="m-0 space-y-4 p-0">
						{posts.map((post) => (
							<li key={post.slug} className="list-none">
								<PostCard post={post} />
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}
