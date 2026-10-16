import { expect, test } from "../fixtures/test";

const EXPECTED_TAGS = ["beer", "brewing", "code", "life", "patterns"];

const BEER_POSTS = [
	"The story of Larry Bell",
	"Brewing Basics",
	"Another Beer Story",
];

test.describe("GIVEN the tags index page", () => {
	test("WHEN the page is loaded, THEN every unique tag is listed as a link", async ({
		tagsPage,
	}) => {
		await tagsPage.goto();

		await expect(tagsPage.heading).toBeVisible();
		await expect(tagsPage.heading).toHaveText("Tags");

		for (const tag of EXPECTED_TAGS) {
			await expect(tagsPage.tagLink(tag)).toBeVisible();
		}
	});

	test("WHEN a tag link is clicked, THEN it navigates to the tag page", async ({
		tagsPage,
	}) => {
		await tagsPage.goto();

		await tagsPage.tagLink("beer").click();

		await expect(tagsPage.page).toHaveURL("/tags/beer");
		await expect(tagsPage.heading).toContainText("beer");
	});
});

test.describe("GIVEN a tag page", () => {
	test("WHEN the page is loaded, THEN only matching posts are shown", async ({
		tagsPage,
	}) => {
		await tagsPage.gotoTag("beer");

		await expect(tagsPage.heading).toContainText("beer");

		for (const title of BEER_POSTS) {
			await expect(tagsPage.postCard(title)).toBeVisible();
		}
		await expect(tagsPage.postCards).toHaveCount(BEER_POSTS.length);
	});

	test("WHEN the page is loaded, THEN all tag chips are shown with the active one marked", async ({
		tagsPage,
	}) => {
		await tagsPage.gotoTag("beer");

		const activeChip = tagsPage.tagChip("beer");
		await expect(activeChip).toHaveAttribute("aria-current", "page");

		await expect(tagsPage.tagChip("life")).toBeVisible();
		await expect(tagsPage.tagChip("life")).not.toHaveAttribute(
			"aria-current",
			"page",
		);
	});

	test("WHEN another tag chip is clicked, THEN it navigates to that tag page", async ({
		tagsPage,
	}) => {
		await tagsPage.gotoTag("beer");

		await tagsPage.tagChip("life").click();

		await expect(tagsPage.page).toHaveURL("/tags/life");
	});

	test("WHEN navigating to an unknown tag, THEN an empty-state message is rendered", async ({
		tagsPage,
	}) => {
		await tagsPage.gotoTag("unknown");

		await expect(tagsPage.emptyState).toBeVisible();
		await expect(tagsPage.emptyState).toContainText("unknown");
		await expect(tagsPage.postCards).toHaveCount(0);
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

	test("WHEN a post has no tags, THEN the card renders without tag badges", async ({
		homePage,
	}) => {
		await homePage.goto();

		await expect(homePage.postCard("Untagged Post")).toBeVisible();
		await expect(homePage.postCardTags("Untagged Post")).toHaveCount(0);
	});
});

test.describe("GIVEN a post detail page", () => {
	test("WHEN the page is loaded, THEN tags are rendered as links to the tag page", async ({
		postPage,
	}) => {
		await postPage.goto("the-story-of-larry-bell");

		await expect(postPage.tagLink("beer")).toBeVisible();
		await expect(postPage.tagLink("life")).toBeVisible();
		await expect(postPage.tagLink("beer")).toHaveAttribute(
			"href",
			"/tags/beer",
		);
		await expect(postPage.tagLink("life")).toHaveAttribute(
			"href",
			"/tags/life",
		);
	});

	test("WHEN a tag link is clicked, THEN it navigates to the tag page", async ({
		tagsPage,
		postPage,
	}) => {
		await postPage.goto("the-story-of-larry-bell");

		await postPage.tagLink("life").click();

		await expect(tagsPage.page).toHaveURL("/tags/life");
		await expect(tagsPage.postCards).toHaveCount(1);
		await expect(tagsPage.postCard("The story of Larry Bell")).toBeVisible();
	});
});

test.describe("GIVEN multiple posts share a tag", () => {
	test("WHEN visiting that tag page, THEN all matching posts are shown in descending date order", async ({
		tagsPage,
	}) => {
		await tagsPage.gotoTag("beer");

		await expect(tagsPage.postCards).toHaveCount(3);
		await expect(tagsPage.postCards).toContainText([
			"The story of Larry Bell",
			"Brewing Basics",
			"Another Beer Story",
		]);

		const titles = await tagsPage.postCards.locator("h3").allTextContents();
		expect(titles).toEqual([
			"The story of Larry Bell",
			"Brewing Basics",
			"Another Beer Story",
		]);
	});
});
