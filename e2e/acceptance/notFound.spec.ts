import { expect, test } from "../fixtures/test";

test.describe("GIVEN an unknown route", () => {
	test("WHEN navigating to it, THEN it returns HTTP 404 and renders the 404 UI", async ({
		notFoundPage,
	}) => {
		const response = await notFoundPage.navigateTo("/this-page-does-not-exist");

		expect(response?.status()).toBe(404);
		await expect(notFoundPage.heading).toHaveText("404");
		await expect(notFoundPage.message).toHaveText("This page doesn't exist.");
		await expect(notFoundPage.homeLink).toBeVisible();
	});
});
