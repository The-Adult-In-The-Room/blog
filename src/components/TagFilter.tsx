import { Link } from "@tanstack/react-router";

export default function TagFilter({
	tags,
	activeTag,
}: {
	tags: string[];
	activeTag?: string;
}) {
	if (tags.length === 0) return null;

	return (
		<nav aria-label="Filter posts by tag" className="flex flex-wrap gap-1.5">
			<TagFilterChip label="All" isActive={!activeTag} search={{}} />
			{tags.map((tag) => (
				<TagFilterChip
					key={tag}
					label={tag}
					isActive={activeTag === tag}
					search={{ tag }}
				/>
			))}
		</nav>
	);
}

function TagFilterChip({
	label,
	isActive,
	search,
}: {
	label: string;
	isActive: boolean;
	search: { tag?: string };
}) {
	const baseClass =
		"inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium transition";
	const activeClass =
		"border-[var(--lagoon-deep)] bg-[var(--surface-strong)] text-[var(--sea-ink)]";
	const inactiveClass =
		"border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon-deep)]/40 hover:text-[var(--sea-ink)]";

	return (
		<Link
			to="/"
			search={isActive ? {} : search}
			className={`${baseClass} ${isActive ? activeClass : inactiveClass} no-underline`}
			aria-current={isActive ? "page" : undefined}
		>
			{label}
		</Link>
	);
}
