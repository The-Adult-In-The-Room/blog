import { expect, test } from "../fixtures/test";

test.describe("GIVEN the RSS feed endpoint", () => {
	test("WHEN requesting /rss.xml, THEN it returns valid RSS with the correct content type and channel items", async ({
		feedsPage,
	}) => {
		const rss = await feedsPage.fetchRss();

		expect(rss.status).toBe(200);
		expect(rss.contentType).toBe("application/rss+xml; charset=utf-8");
		expect(rss.channelTitle).toBe("Raymond Cox");
		expect(rss.items.length).toBeGreaterThan(0);
		expect(
			rss.items.some((item) => item.title === "The story of Larry Bell"),
		).toBe(true);
		expect(
			rss.items.some((item) =>
				item.link.includes("/posts/the-story-of-larry-bell"),
			),
		).toBe(true);
	});
});
