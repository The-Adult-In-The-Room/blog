import { Link } from "@tanstack/react-router";

export default function TagList({ tags }: { tags: string[] }) {
	if (tags.length === 0) return null;

	return (
		<div className="flex min-w-0 flex-wrap items-center gap-1.5">
			{tags.map((tag) => (
				<Link
					key={tag}
					to="/tags/$tag"
					params={{ tag }}
					className="inline-flex rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon-deep)]/40 hover:text-[var(--sea-ink)]"
				>
					{tag}
				</Link>
			))}
		</div>
	);
}
