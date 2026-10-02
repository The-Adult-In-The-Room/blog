import { expect, test } from "../fixtures/test";

test.describe("GIVEN the home page", () => {
	test("WHEN the page is loaded, THEN it renders the default title and description", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.page).toHaveTitle("Raymond Cox");
		await expect(homePage.descriptionMeta).toHaveAttribute(
			"content",
			"Thoughts on code, brewing, and whatever nonsense is rattling around in my head.",
		);
	});
});
