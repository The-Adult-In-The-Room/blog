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

	test("WHEN a post links to another post by markdown filename, THEN the link navigates to the rendered post route", async ({
		postPage,
	}) => {
		await postPage.goto("code-patterns");

		await test.step("Then the link points at the post route, not the markdown file", async () => {
			await expect(postPage.contentLink("Brewing Basics")).toHaveAttribute(
				"href",
				"/posts/brewing-basics",
			);
		});

		await test.step("When the link is clicked, then it navigates to the target post", async () => {
			await postPage.contentLink("Brewing Basics").click();
			await expect(postPage.page).toHaveURL("/posts/brewing-basics");
			await expect(postPage.heading).toHaveText("Brewing Basics");
		});
	});
});
