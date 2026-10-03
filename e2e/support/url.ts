/**
 * Normalises a URL to its origin-independent path plus query string.
 *
 * The deployed site sits behind a proxy that forwards plain HTTP upstream, so
 * `/sitemap.xml` and `/rss.xml` publish `http://` absolute URLs even when the
 * site is reached over HTTPS. Comparing those against the `https://` URLs in the
 * rendered DOM would fail for reasons that have nothing to do with the
 * application, so every cross-surface comparison is done on paths only.
 */
export function toPath(url: string): string {
	const parsed = new URL(url, "http://placeholder.invalid");
	return `${parsed.pathname}${parsed.search}`;
}
