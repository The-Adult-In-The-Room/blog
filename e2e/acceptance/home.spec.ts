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

	test("WHEN the page is loaded, THEN it renders a tag cloud with the expected tags and counts", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.tagCloud).toBeVisible();
		await expect(homePage.tagLink("beer")).toHaveText("beer3");
		await expect(homePage.tagLink("brewing")).toHaveText("brewing1");
		await expect(homePage.tagLink("code")).toHaveText("code1");
		await expect(homePage.tagLink("life")).toHaveText("life1");
		await expect(homePage.tagLink("patterns")).toHaveText("patterns1");
	});

	test("WHEN the browse-all-tags link is clicked, THEN it navigates to the tags index page", async ({
		homePage,
	}) => {
		await homePage.goto();

		await homePage.browseAllTagsLink.click();

		await expect(homePage.page).toHaveURL("/tags");
	});

	test("WHEN a specific tag in the cloud is clicked, THEN it navigates to that tag detail page", async ({
		homePage,
	}) => {
		await homePage.goto();

		await homePage.tagLink("beer").click();

		await expect(homePage.page).toHaveURL("/tags/beer");
	});
});
