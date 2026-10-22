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

	test("WHEN the post is neither the newest nor oldest, THEN it shows previous and next navigation links", async ({
		postPage,
	}) => {
		await postPage.goto("brewing-basics");

		await expect(postPage.previousPost).toBeVisible();
		await expect(postPage.nextPost).toBeVisible();
		await expect(postPage.previousPostLink()).toHaveText(/Code Patterns/i);
		await expect(postPage.nextPostLink()).toHaveText(
			/The story of Larry Bell/i,
		);
	});

	test("WHEN the newest post is viewed, THEN it only shows a previous post link", async ({
		postPage,
	}) => {
		await postPage.goto("the-story-of-larry-bell");

		await expect(postPage.previousPost).toBeVisible();
		await expect(postPage.nextPost).not.toBeVisible();
		await expect(postPage.previousPostLink()).toHaveText(/Brewing Basics/i);
	});

	test("WHEN the oldest post is viewed, THEN it only shows a next post link", async ({
		postPage,
	}) => {
		await postPage.goto("untagged-post");

		await expect(postPage.nextPost).toBeVisible();
		await expect(postPage.previousPost).not.toBeVisible();
		await expect(postPage.nextPostLink()).toHaveText(/Another Beer Story/i);
	});

	test("WHEN a next/previous card is clicked, THEN it navigates to that post", async ({
		postPage,
	}) => {
		await test.step("GIVEN the reader is on a post with both neighbors", async () => {
			await postPage.goto("brewing-basics");
		});

		await test.step("WHEN the previous post card is clicked, THEN the older post loads", async () => {
			await postPage.previousPostLink().click();
			await expect(postPage.heading).toHaveText("Code Patterns");
		});

		await test.step("WHEN the next post card is clicked, THEN the newer post loads", async () => {
			await postPage.nextPostLink().click();
			await expect(postPage.heading).toHaveText("Brewing Basics");
		});
	});
});
