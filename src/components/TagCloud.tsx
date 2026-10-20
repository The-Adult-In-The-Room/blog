import { Link } from "@tanstack/react-router";
import type { TagCount } from "../lib/posts";

type TagCloudProps = {
	tags: TagCount[];
	activeTag?: string;
	ariaLabel: string;
};

export default function TagCloud({
	tags,
	activeTag,
	ariaLabel,
}: TagCloudProps) {
	if (tags.length === 0) return null;

	return (
		<nav aria-label={ariaLabel} className="flex flex-wrap gap-2">
			{tags.map(({ tag, count }) => {
				const isActive = tag === activeTag;
				const className = `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition no-underline ${
					isActive
						? "border-[var(--accent-strong)] bg-[var(--surface-strong)] text-[var(--text-primary)]"
						: "border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--text-secondary)] hover:border-[var(--accent-strong)]/40 hover:text-[var(--text-primary)]"
				}`;

				return (
					<Link
						key={tag}
						to="/tags/$tag"
						params={{ tag }}
						className={className}
						aria-current={isActive ? "page" : undefined}
					>
						{tag}
						<span
							className="text-xs text-[var(--text-secondary)]/60"
							aria-hidden="true"
						>
							{count}
						</span>
					</Link>
				);
			})}
		</nav>
	);
}
