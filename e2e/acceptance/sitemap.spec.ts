import { expect, test } from "../fixtures/test";

test.describe("GIVEN the XML sitemap endpoint", () => {
	test("WHEN requesting /sitemap.xml, THEN it returns valid XML with home, post, and tag URLs", async ({
		feedsPage,
	}) => {
		const sitemap = await feedsPage.fetchSitemap();

		expect(sitemap.status).toBe(200);
		expect(sitemap.contentType).toBe("application/xml; charset=utf-8");
		expect(sitemap.raw).toContain(
			'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		);
		expect(sitemap.locs.some((loc) => loc.endsWith("/"))).toBe(true);
		expect(
			sitemap.locs.some((loc) =>
				loc.includes("/posts/the-story-of-larry-bell"),
			),
		).toBe(true);
		expect(sitemap.locs.some((loc) => loc.includes("/?tag=beer"))).toBe(true);
		expect(sitemap.locs.some((loc) => loc.includes("/?tag=life"))).toBe(true);
	});
});
