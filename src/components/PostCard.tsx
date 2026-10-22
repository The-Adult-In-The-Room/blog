import { Link } from "@tanstack/react-router";
import TagList from "#/components/TagList";
import type { PostSummary } from "#/lib/posts";

export type PostCardProps = {
	post: PostSummary;
	className?: string;
	variant?: "default" | "compact";
};

export default function PostCard({
	post,
	className = "",
	variant = "default",
}: PostCardProps) {
	const isCompact = variant === "compact";
	const padding = isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6";

	return (
		<Link
			to="/posts/$slug"
			params={{ slug: post.slug }}
			className={`group block rounded-2xl border border-[var(--line)] bg-[var(--surface)] no-underline transition hover:-translate-y-0.5 hover:border-[var(--accent-strong)]/30 hover:bg-[var(--surface-strong)] ${padding} ${className}`}
		>
			<article>
				<div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
					{Boolean(post.number) && <p>#{post.number}</p>}
					{post.date ? <time dateTime={post.date}>{post.date}</time> : null}
					{!isCompact && <TagList tags={post.tags} asLinks={false} />}
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
	);
}
