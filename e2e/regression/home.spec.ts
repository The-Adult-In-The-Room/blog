import { expect, test } from "../fixtures/test";

/**
 * Regression coverage for the deployed home page and error boundary.
 *
 * The site title and description are build-time constants rather than content,
 * so asserting them here is content-agnostic. Some of this intentionally
 * overlaps `e2e/acceptance`: that suite proves the behaviour against the frozen
 * fixtures, this one proves the same behaviour survived deployment.
 */

test.describe("GIVEN the deployed home page", () => {
	test("WHEN the page is loaded, THEN it renders the site title, description, and heading", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.page).toHaveTitle("Raymond Cox");
		await expect(homePage.descriptionMeta).toHaveAttribute(
			"content",
			"Thoughts on code, brewing, and whatever nonsense is rattling around in my head.",
		);
		await expect(homePage.heading).toBeVisible();
	});
});

test.describe("GIVEN the deployed home page lists posts", () => {
	test("WHEN every card link is opened, THEN each post page renders that card's own title and tags", async ({
		homePage,
		postPage,
	}) => {
		await homePage.goto();
		const cards = await homePage.postCardSummaries();
		expect(cards.length).toBeGreaterThan(0);

		for (const card of cards) {
			await test.step(`Open ${card.href}`, async () => {
				await postPage.gotoPath(card.href);

				await expect(postPage.heading).toHaveText(card.title);
				expect(await postPage.tagLabels()).toEqual(card.tags);
			});
		}
	});
});

test.describe("GIVEN a route the deployment does not serve", () => {
	test("WHEN requesting it, THEN the 404 UI is served with HTTP 404", async ({
		notFoundPage,
	}) => {
		const response = await notFoundPage.navigateTo(
			"/regression-route-does-not-exist",
		);

		expect(response?.status()).toBe(404);
		await expect(notFoundPage.heading).toHaveText("404");
		await expect(notFoundPage.message).toHaveText("This page doesn't exist.");
		await expect(notFoundPage.homeLink).toBeVisible();
	});
});
