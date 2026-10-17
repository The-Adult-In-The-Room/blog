import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { cyclePalette } from "#/lib/palette";
import Footer from "../components/Footer";
import Header from "../components/Header";

import appCss from "../styles.css?url";

const SITE_DESCRIPTION =
	"Thoughts on code, brewing, and whatever nonsense is rattling around in my head.";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;var params=new URLSearchParams(window.location.search);var urlPalette=params.get('palette');var valid=['default','mono'];var palette;if(urlPalette&&valid.indexOf(urlPalette)!==-1){palette=urlPalette;window.localStorage.setItem('palette',palette)}else{var sp=window.localStorage.getItem('palette');palette=(sp&&valid.indexOf(sp)!==-1)?sp:'default'}if(palette==='default'){root.removeAttribute('data-palette')}else{root.setAttribute('data-palette',palette)}}catch(e){}})();`;

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
				title: "It's Giving Winning",
			},
			{
				name: "description",
				content: SITE_DESCRIPTION,
			},
			{
				property: "og:site_name",
				content: "It's Giving Winning",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:title",
				content: "It's Giving Winning",
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
				rel: "icon",
				type: "image/svg+xml",
				href: "/icon.svg",
			},
			{
				rel: "icon",
				type: "image/x-icon",
				href: "/favicon.ico",
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "alternate",
				type: "application/rss+xml",
				title: "It's Giving Winning",
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
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.shiftKey && event.key === "P") {
				const next = cyclePalette();
				const url = new URL(window.location.href);
				if (next === "default") {
					url.searchParams.delete("palette");
				} else {
					url.searchParams.set("palette", next);
				}
				window.history.replaceState({}, "", url.toString());
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col font-sans antialiased [overflow-wrap:anywhere] selection:bg-[var(--selection-bg)]">
				<Header />
				{children}
				<Footer />
				<Scripts />
			</body>
		</html>
	);
}
