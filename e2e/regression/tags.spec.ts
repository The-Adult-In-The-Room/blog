import { expect, test } from "../fixtures/test";
import type { TagsPage } from "../pages/TagsPage";

/**
 * Regression coverage for the deployed tag system.
 *
 * These assertions are deliberately content-agnostic. The deployed site serves
 * whatever lives in `content/`, which drifts on its own schedule, so no
 * assertion here may name a post or a tag. Instead each expectation is derived
 * from a *different* render path than the one under test - the tag index page
 * measures the tag detail page, the card markup measures the tag links - so the
 * specs stay falsifiable. Reading the served content and asserting it equals
 * itself would pass unconditionally and catch nothing.
 */

/** A tag the tag index page actually offers, i.e. any link on the tag index page. */
async function anOfferedTag(tagsPage: TagsPage): Promise<string> {
	const links = tagsPage.tagLinks;
	const count = await links.count();
	expect(
		count,
		"expected the tag index page to offer at least one tag link",
	).toBeGreaterThan(0);
	const labels = await links.allTextContents();
	// Strip the count suffix (e.g., "beer3" -> "beer")
	return labels[labels.length - 1].replace(/\s*\d+\s*$/, "").trim();
}

test.describe("GIVEN the deployed tag index page", () => {
	test("WHEN the page is loaded, THEN it lists every tag the home page cards carry", async ({
		homePage,
		tagsPage,
	}) => {
		await homePage.goto();
		const cards = await homePage.postCardSummaries();
		expect(cards.length).toBeGreaterThan(0);

		await tagsPage.goto();

		await test.step("Then there is at least one tag link", async () => {
			const tagCount = await tagsPage.tagLinks.count();
			expect(tagCount).toBeGreaterThan(0);
		});

		await test.step("Then the tag links match the union of the card tags", async () => {
			const cardTags = [...new Set(cards.flatMap((card) => card.tags))].sort();
			const linkLabels = await tagsPage.tagLinks.allTextContents();
			// Each link label includes the count, so extract just the tag name
			const linkTags = linkLabels
				.map((label) => label.replace(/\s*\d+\s*$/, "").trim())
				.sort();
			expect(linkTags).toEqual(cardTags);
		});
	});

	test("WHEN a tag link is clicked, THEN it navigates to the tag page showing matching posts", async ({
		homePage,
		tagsPage,
	}) => {
		await homePage.goto();
		const cards = await homePage.postCardSummaries();
		const cardTags = [...new Set(cards.flatMap((card) => card.tags))].sort();
		expect(cardTags.length).toBeGreaterThan(0);
		const tag = cardTags[cardTags.length - 1];

		await tagsPage.goto();
		await tagsPage.tagLink(tag).click();

		await test.step("Then the URL carries the tag", async () => {
			await expect(tagsPage.page).toHaveURL(`/tags/${tag}`);
		});

		await test.step("Then exactly the cards carrying that tag are shown", async () => {
			const expected = cards.filter((card) => card.tags.includes(tag));
			expect(expected.length).toBeGreaterThan(0);
			await expect(tagsPage.postCards).toHaveCount(expected.length);
		});
	});

	test("WHEN the page is loaded, THEN each tag count matches the number of posts on its detail page", async ({
		tagsPage,
	}) => {
		await tagsPage.goto();

		const labels = await tagsPage.tagLinks.allTextContents();
		expect(labels.length).toBeGreaterThan(0);

		for (const label of labels) {
			const match = label.match(/^(\D+)(\d+)$/);
			expect(match).not.toBeNull();
			const [, tag, count] = match as RegExpMatchArray;

			await tagsPage.gotoTag(tag);
			await expect(tagsPage.postCards).toHaveCount(Number.parseInt(count, 10));
		}
	});
});

test.describe("GIVEN the deployed tag detail page", () => {
	test("WHEN the page is loaded, THEN the active tag chip is marked current", async ({
		tagsPage,
	}) => {
		await tagsPage.goto();
		const tag = await anOfferedTag(tagsPage);

		await tagsPage.tagLink(tag).click();

		await expect(tagsPage.tagChip(tag)).toHaveAttribute("aria-current", "page");
	});

	test("WHEN another tag chip is clicked, THEN it navigates to that tag page", async ({
		tagsPage,
	}) => {
		await tagsPage.goto();
		const labels = await tagsPage.tagLinks.allTextContents();
		const tags = labels.map((l) => l.replace(/\s*\d+\s*$/, "").trim());
		expect(tags.length).toBeGreaterThanOrEqual(2);

		await tagsPage.tagLink(tags[0]).click();
		await tagsPage.tagChip(tags[1]).click();

		await expect(tagsPage.page).toHaveURL(`/tags/${tags[1]}`);
	});
});

test.describe("GIVEN a deployed tag page for a tag no post carries", () => {
	test("WHEN the page is loaded, THEN the empty state names the tag and no cards render", async ({
		tagsPage,
	}) => {
		await tagsPage.gotoTag("regression-tag-that-should-not-exist");

		await expect(tagsPage.emptyState).toBeVisible();
		await expect(tagsPage.emptyState).toContainText(
			"regression-tag-that-should-not-exist",
		);
		await expect(tagsPage.postCards).toHaveCount(0);
	});
});

test.describe("GIVEN a deployed post page", () => {
	test("WHEN the page is loaded, THEN its tags link to the tag pages", async ({
		homePage,
		tagsPage,
		postPage,
	}) => {
		await homePage.goto();
		const cards = await homePage.postCardSummaries();
		expect(cards.length).toBeGreaterThan(0);
		const card = cards.find((c) => c.tags.length > 0);
		if (!card) {
			test.info().annotations.push({
				type: "note",
				description: "no tagged post found; skipping",
			});
			return;
		}

		await postPage.gotoPath(card.href);
		await expect(postPage.heading).toHaveText(card.title);

		await test.step("Then the header tags match the tags the card advertised", async () => {
			expect(await postPage.tagLabels()).toEqual(card.tags);
		});

		await test.step("Then following a tag link shows this post under that tag", async () => {
			const tag = card.tags[0];
			await postPage.tagLink(tag).click();

			await expect(tagsPage.page).toHaveURL(`/tags/${tag}`);
			await expect(tagsPage.postCard(card.title)).toBeVisible();
		});
	});
});
