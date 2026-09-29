import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="page-wrap flex items-center justify-between py-4">
				<Link
					to="/"
					className="text-base font-semibold tracking-tight text-[var(--sea-ink)] no-underline"
				>
					Raymond Cox
				</Link>

				<div className="flex items-center gap-4">
					<Link
						to="/"
						className="nav-link text-sm font-medium"
						activeProps={{ className: "nav-link is-active" }}
					>
						Home
					</Link>
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
