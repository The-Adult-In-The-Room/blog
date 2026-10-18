import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { getPosts, getTagCounts } from "../lib/posts";

export async function tagsLoader() {
	const posts = await getPosts();
	return getTagCounts(posts);
}

export const Route = createFileRoute("/tags")({
	loader: tagsLoader,
	component: TagsPage,
});

function TagsPage() {
	const tagCounts = Route.useLoaderData();
	const location = useRouterState({ select: (s) => s.location });

	// If we're at a child route (e.g., /tags/$tag), only render the Outlet
	const isChildRoute = location.pathname !== "/tags";

	if (isChildRoute) {
		return <Outlet />;
	}

	return (
		<main className="page-wrap px-4 py-12 sm:py-16">
			<section className="mb-10 max-w-2xl">
				<h1 className="display-title mb-2 text-2xl font-medium tracking-tight text-[var(--text-secondary)] sm:text-3xl">
					Tags
				</h1>
				<p className="text-[var(--text-secondary)]">Browse posts by topic.</p>
			</section>

			{tagCounts.length === 0 ? (
				<p className="text-[var(--text-secondary)]">No tags yet.</p>
			) : (
				<nav aria-label="All tags" className="flex flex-wrap gap-2">
					{tagCounts.map(({ tag, count }) => (
						<Link
							key={tag}
							to="/tags/$tag"
							params={{ tag }}
							className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-sm font-medium text-[var(--text-secondary)] no-underline transition hover:border-[var(--accent-strong)]/40 hover:text-[var(--text-primary)]"
						>
							{tag}
							<span
								className="text-xs text-[var(--text-secondary)]/60"
								aria-hidden="true"
							>
								{count}
							</span>
						</Link>
					))}
				</nav>
			)}
		</main>
	);
}
