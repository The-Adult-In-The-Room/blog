import { expect, test } from "../fixtures/test";

test.describe("GIVEN the home page", () => {
	test("WHEN the page is loaded, THEN it renders the default title and description", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.page).toHaveTitle("It's Giving Winning");
		await expect(homePage.descriptionMeta).toHaveAttribute(
			"content",
			"Thoughts on code, brewing, and whatever nonsense is rattling around in my head.",
		);
	});

	test("WHEN the page is loaded, THEN it renders a tag cloud and a browse-all-tags link", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.tagCloud).toBeVisible();
		await expect(homePage.browseAllTagsLink).toBeVisible();
		await expect(homePage.browseAllTagsLink).toHaveAttribute("href", "/tags");
	});

	test("WHEN a tag in the cloud is clicked, THEN it navigates to the tag detail page", async ({
		homePage,
	}) => {
		await homePage.goto();

		await homePage.tagCloud.getByRole("link").first().click();

		await expect(homePage.page).toHaveURL(/\/tags\//);
	});
});
