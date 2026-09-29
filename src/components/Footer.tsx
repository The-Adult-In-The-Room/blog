export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-auto border-t border-[var(--line)] px-4 py-8 text-[var(--sea-ink-soft)]">
			<div className="page-wrap flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
				<p className="m-0 text-sm">
					&copy; {year} Raymond Cox. All rights reserved.
				</p>
				<p className="m-0 text-xs">Built with TanStack Start</p>
			</div>
		</footer>
	);
}
