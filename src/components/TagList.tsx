import { Link } from "@tanstack/react-router";

export default function TagList({
	tags,
	asLinks = true,
}: {
	tags: string[];
	asLinks?: boolean;
}) {
	if (tags.length === 0) return null;

	return (
		<div className="flex min-w-0 flex-wrap items-center gap-1.5">
			{tags.map((tag) => {
				const className =
					"inline-flex rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--sea-ink-soft)] transition hover:border-[var(--lagoon-deep)]/40 hover:text-[var(--sea-ink)]";

				return asLinks ? (
					<Link
						key={tag}
						to="/"
						search={{ tag }}
						className={`${className} no-underline`}
					>
						{tag}
					</Link>
				) : (
					<span key={tag} className={className}>
						{tag}
					</span>
				);
			})}
		</div>
	);
}
