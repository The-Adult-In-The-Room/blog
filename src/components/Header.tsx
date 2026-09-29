import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="page-wrap flex items-center justify-between py-4">
				<Link
					to="/"
					className="text-base font-semibold tracking-tight text-[var(--sea-ink)] no-underline transition hover:text-[var(--lagoon-deep)]"
				>
					Raymond Cox
				</Link>

				<ThemeToggle />
			</nav>
		</header>
	);
}
