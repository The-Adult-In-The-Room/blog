import { expect, test } from "../fixtures/test";

/**
 * Regression coverage for the deployed post page.
 *
 * Verifies that internal markdown links between posts are correctly transformed
 * to post routes and navigate successfully. This test runs against the deployed
 * site with real content, not the test fixtures.
 */

test.describe("GIVEN a published post with internal markdown links", () => {
	test("WHEN an internal link is clicked, THEN it navigates to the target post", async ({
		postPage,
	}) => {
		await postPage.goto("i-cleaned-my-car");

		const rulesLink = postPage.contentLink("Rules of Engagement");
		await expect(rulesLink).toBeVisible();
		await expect(rulesLink).toHaveAttribute(
			"href",
			"https://its-giving-winning.com/posts/rules-of-engagement",
		);

		await rulesLink.click();

		await expect(postPage.page).toHaveURL("/posts/rules-of-engagement");
		await expect(postPage.heading).toHaveText("The rules of engagement");
	});
});
