import { getAllTags, type PostSummary } from "./posts";
import { escapeXml } from "./xml";

export function generateSitemap(baseUrl: string, posts: PostSummary[]): string {
	const origin = baseUrl.replace(/\/$/, "");
	const urls: string[] = [
		`<url><loc>${escapeXml(origin)}/</loc></url>`,
		`<url><loc>${escapeXml(origin)}/tags</loc></url>`,
	];

	for (const post of posts) {
		const loc = `${origin}/posts/${post.slug}`;
		const lastmod = post.date ? `<lastmod>${post.date}</lastmod>` : "";
		urls.push(`<url><loc>${escapeXml(loc)}</loc>${lastmod}</url>`);
	}

	for (const tag of getAllTags(posts)) {
		const loc = `${origin}/tags/${tag}`;
		urls.push(`<url><loc>${escapeXml(loc)}</loc></url>`);
	}

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		urls.join(""),
		"</urlset>",
	].join("");
}
