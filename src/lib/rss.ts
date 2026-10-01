import type { PostSummary } from "./posts";
import { escapeXml } from "./xml";

export const RSS_TITLE = "Raymond Cox";
export const RSS_DESCRIPTION =
	"Thoughts on code, brewing, and whatever nonsense is rattling around in my head.";

function toRfc822Date(date: string): string {
	return new Date(date).toUTCString();
}

export function generateRss(baseUrl: string, posts: PostSummary[]): string {
	const origin = baseUrl.replace(/\/$/, "");
	const items = posts
		.map((post) => {
			const link = `${origin}/posts/${post.slug}`;
			const pubDate = post.date
				? `<pubDate>${toRfc822Date(post.date)}</pubDate>`
				: "";
			return [
				"<item>",
				`<title>${escapeXml(post.title)}</title>`,
				`<link>${escapeXml(link)}</link>`,
				`<description>${escapeXml(post.excerpt)}</description>`,
				pubDate,
				`<guid>${escapeXml(link)}</guid>`,
				"</item>",
			].join("");
		})
		.join("");

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0">',
		"<channel>",
		`<title>${escapeXml(RSS_TITLE)}</title>`,
		`<link>${escapeXml(origin)}</link>`,
		`<description>${escapeXml(RSS_DESCRIPTION)}</description>`,
		"<language>en</language>",
		items,
		"</channel>",
		"</rss>",
	].join("");
}
