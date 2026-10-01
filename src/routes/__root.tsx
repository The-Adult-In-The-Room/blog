import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import Footer from "../components/Footer";
import Header from "../components/Header";

import appCss from "../styles.css?url";

const SITE_DESCRIPTION =
	"Thoughts on code, brewing, and whatever nonsense is rattling around in my head.";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Raymond Cox",
			},
			{
				name: "description",
				content: SITE_DESCRIPTION,
			},
			{
				property: "og:site_name",
				content: "Raymond Cox",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:title",
				content: "Raymond Cox",
			},
			{
				property: "og:description",
				content: SITE_DESCRIPTION,
			},
			{
				name: "twitter:card",
				content: "summary",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "alternate",
				type: "application/rss+xml",
				title: "Raymond Cox",
				href: "/rss.xml",
			},
		],
	}),
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

function NotFound() {
	return (
		<main className="page-wrap flex flex-grow flex-col items-center justify-center px-4 py-20 text-center">
			<h1 className="display-title text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
				404
			</h1>
			<p className="mt-4 text-lg text-[var(--sea-ink-soft)]">
				This page doesn't exist.
			</p>
			<Link
				to="/"
				className="mt-6 inline-flex text-sm font-medium text-[var(--lagoon-deep)] no-underline hover:underline"
			>
				← Back home
			</Link>
		</main>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
				<Header />
				{children}
				<Footer />
				<Scripts />
			</body>
		</html>
	);
}
