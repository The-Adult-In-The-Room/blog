import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Footer from "#/components/Footer";
import Header from "#/components/Header";

import appCss from "#/styles.css?url";

const SITE_URL = "https://its-giving-winning.com";
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
				property: "og:url",
				content: SITE_URL,
			},
			{
				property: "og:image",
				content: `${SITE_URL}/og-image.png`,
			},
			{
				property: "og:image:alt",
				content: "It's Giving Winning - A blog about code, brewing, and life",
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:url",
				content: SITE_URL,
			},
			{
				name: "twitter:title",
				content: "It's Giving Winning",
			},
			{
				name: "twitter:description",
				content: SITE_DESCRIPTION,
			},
			{
				name: "twitter:image",
				content: `${SITE_URL}/og-image.png`,
			},
			{
				name: "twitter:image:alt",
				content: "It's Giving Winning - A blog about code, brewing, and life",
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
			<h1 className="display-title text-4xl font-bold text-[var(--text-primary)] sm:text-5xl">
				404
			</h1>
			<p className="mt-4 text-lg text-[var(--text-secondary)]">
				This page doesn't exist.
			</p>
			<Link
				to="/"
				className="mt-6 inline-flex text-sm font-medium text-[var(--accent-strong)] no-underline hover:underline"
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
				<script
					defer
					src="https://umami-production-46f9.up.railway.app/script.js"
					data-website-id="794b9d84-db40-4f55-ae64-231fdc1d4a59"
				/>
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col font-sans antialiased [overflow-wrap:anywhere] selection:bg-[var(--selection-bg)]">
				<Header />
				{children}
				<Footer />
				<Scripts />
				<TanStackDevtools
					plugins={[
						{
							name: "TanStack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
			</body>
		</html>
	);
}
