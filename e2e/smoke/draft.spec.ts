import { expect, test } from "../fixtures/test";

const DRAFT_SLUG = "draft-test";
const DRAFT_TITLE = "Draft Test";

test.describe("GIVEN a draft post in a production build", () => {
	test("WHEN requesting the draft post URL, THEN it returns HTTP 404", async ({
		notFoundPage,
	}) => {
		const response = await notFoundPage.navigateTo(`/posts/${DRAFT_SLUG}`);

		expect(response?.status()).toBe(404);
		await expect(notFoundPage.heading).toHaveText("404");
	});

	test("WHEN viewing the RSS feed, THEN the draft post is not included", async ({
		feedsPage,
	}) => {
		const rss = await feedsPage.fetchRss();

		expect(rss.raw).not.toContain(DRAFT_TITLE);
		expect(
			rss.items.some((item) => item.link.includes(`/posts/${DRAFT_SLUG}`)),
		).toBe(false);
	});

	test("WHEN viewing the sitemap, THEN the draft post URL is not listed", async ({
		feedsPage,
	}) => {
		const sitemap = await feedsPage.fetchSitemap();

		expect(
			sitemap.locs.some((loc) => loc.includes(`/posts/${DRAFT_SLUG}`)),
		).toBe(false);
	});

	test("WHEN viewing the home page, THEN the draft post is not listed", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.postLink(DRAFT_TITLE)).not.toBeAttached();
	});
});
