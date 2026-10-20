import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import TagCloud from "../components/TagCloud";
import { getTagCounts } from "../lib/posts";

export async function tagsLoader() {
	return getTagCounts();
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
				<TagCloud tags={tagCounts} ariaLabel="All tags" />
			)}
		</main>
	);
}
