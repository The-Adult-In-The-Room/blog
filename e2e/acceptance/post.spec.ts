import { expect, test } from "../fixtures/test";

test.describe("GIVEN a published post", () => {
	test("WHEN navigating to the post page, THEN it renders a unique title and meta description", async ({
		postPage,
	}) => {
		await postPage.goto("the-story-of-larry-bell");

		await expect(postPage.page).toHaveTitle("The story of Larry Bell");
		await expect(postPage.descriptionMeta).toHaveAttribute(
			"content",
			"A bartender in Kalamazoo gets an orange thrown at her by the creator of Oberon.",
		);
		await expect(postPage.heading).toHaveText("The story of Larry Bell");
	});
});
