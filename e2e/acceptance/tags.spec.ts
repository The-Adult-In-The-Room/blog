import { expect, test } from "../fixtures/test";

const EXPECTED_TAGS = ["All", "beer", "brewing", "code", "life", "patterns"];

const BEER_POSTS = [
	"The story of Larry Bell",
	"Brewing Basics",
	"Another Beer Story",
];

test.describe("GIVEN the home page has posts with tags", () => {
	test("WHEN the page is loaded, THEN the tag filter renders All and every unique tag", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.tagFilter).toBeVisible();
		for (const label of EXPECTED_TAGS) {
			await expect(homePage.tagChip(label)).toBeVisible();
		}
	});

	test("WHEN a tag chip is clicked, THEN the URL updates and only matching posts are shown", async ({
		homePage,
	}) => {
		await homePage.goto();

		await test.step("Click the beer tag chip", async () => {
			await homePage.tagChip("beer").click();
		});

		await test.step("Then the URL reflects the active filter", async () => {
			await expect(homePage.page).toHaveURL(/\?tag=beer$/);
		});

		await test.step("Then every matching post card is visible", async () => {
			await expect(homePage.postCards).toHaveCount(BEER_POSTS.length);
			for (const title of BEER_POSTS) {
				await expect(homePage.postCard(title)).toBeVisible();
			}
		});
	});

	test("WHEN a tag is active, THEN that chip has aria-current=page and links home", async ({
		homePage,
	}) => {
		await homePage.gotoWithTag("beer");

		const activeChip = homePage.tagChip("beer");
		await expect(activeChip).toHaveAttribute("aria-current", "page");
		await expect(activeChip).toHaveAttribute("href", "/");

		await expect(homePage.tagChip("life")).toHaveAttribute(
			"href",
			"/?tag=life",
		);
	});

	test("WHEN the active tag chip is clicked, THEN the filter clears and the URL returns to /", async ({
		homePage,
	}) => {
		await homePage.gotoWithTag("beer");

		await homePage.tagChip("beer").click();

		await expect(homePage.page).toHaveURL("/");
		await expect(homePage.postCards).toHaveCount(5);
	});

	test("WHEN the All chip is clicked, THEN the active filter clears and the URL returns to /", async ({
		homePage,
	}) => {
		await homePage.gotoWithTag("beer");

		await homePage.tagChip("All").click();

		await expect(homePage.page).toHaveURL("/");
		await expect(homePage.postCards).toHaveCount(5);
	});

	test("WHEN navigating to an unknown tag, THEN an empty-state message is rendered", async ({
		homePage,
	}) => {
		await homePage.gotoWithTag("unknown");

		await expect(homePage.emptyState).toBeVisible();
		await expect(homePage.emptyState).toContainText("unknown");
		await expect(homePage.postCards).toHaveCount(0);
	});
});

test.describe("GIVEN a home page post card", () => {
	test("WHEN the card is rendered, THEN its tags are spans inside the single card link", async ({
		homePage,
	}) => {
		await homePage.goto();

		const card = homePage.postCard("The story of Larry Bell");
		await expect(card).toBeVisible();

		await expect(homePage.postCardLink("The story of Larry Bell")).toHaveCount(
			1,
		);
		await expect(homePage.postCardTags("The story of Larry Bell")).toHaveText([
			"beer",
			"life",
		]);
	});

	test("WHEN the card is clicked, THEN it navigates to the post page", async ({
		homePage,
		postPage,
	}) => {
		await homePage.goto();

		await homePage.postCardLink("The story of Larry Bell").click();

		await expect(homePage.page).toHaveURL("/posts/the-story-of-larry-bell");
		await expect(postPage.heading).toHaveText("The story of Larry Bell");
	});

	test("WHEN a post has no tags, THEN the card renders and does not contribute to the filter", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.postCard("Untagged Post")).toBeVisible();
		await expect(homePage.postCardTags("Untagged Post")).toHaveCount(0);
		await expect(homePage.tagFilter).not.toContainText("Untagged Post");
	});
});

test.describe("GIVEN a post detail page", () => {
	test("WHEN the page is loaded, THEN tags are rendered as links to the filtered homepage", async ({
		postPage,
	}) => {
		await postPage.goto("the-story-of-larry-bell");

		await expect(postPage.tagLink("beer")).toBeVisible();
		await expect(postPage.tagLink("life")).toBeVisible();
		await expect(postPage.tagLink("beer")).toHaveAttribute(
			"href",
			"/?tag=beer",
		);
	});

	test("WHEN a tag link is clicked, THEN it navigates to the filtered homepage", async ({
		homePage,
		postPage,
	}) => {
		await postPage.goto("the-story-of-larry-bell");

		await postPage.tagLink("life").click();

		await expect(homePage.page).toHaveURL(/\?tag=life$/);
		await expect(homePage.postCards).toHaveCount(1);
		await expect(homePage.postCard("The story of Larry Bell")).toBeVisible();
	});
});

test.describe("GIVEN multiple posts share a tag", () => {
	test("WHEN filtering by that tag, THEN all matching posts are shown in descending date order", async ({
		homePage,
	}) => {
		await homePage.gotoWithTag("beer");

		await expect(homePage.postCards).toHaveCount(3);
		await expect(homePage.postCards).toContainText([
			"The story of Larry Bell",
			"Brewing Basics",
			"Another Beer Story",
		]);

		const titles = await homePage.postCards.locator("h3").allTextContents();
		expect(titles).toEqual([
			"The story of Larry Bell",
			"Brewing Basics",
			"Another Beer Story",
		]);
	});
});
