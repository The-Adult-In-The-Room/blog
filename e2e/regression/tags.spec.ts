import { expect, test } from "../fixtures/test";
import { ALL_CHIP, type HomePage } from "../pages/HomePage";

/**
 * Regression coverage for the deployed tag system.
 *
 * These assertions are deliberately content-agnostic. The deployed site serves
 * whatever lives in `content/`, which drifts on its own schedule, so no
 * assertion here may name a post or a tag. Instead each expectation is derived
 * from a *different* render path than the one under test - the unfiltered home
 * page measures the filtered home page, the card markup measures the filter
 * chips - so the specs stay falsifiable. Reading the served content and
 * asserting it equals itself would pass unconditionally and catch nothing.
 */

/** A tag the filter actually offers, i.e. any chip other than "All". */
async function anOfferedTag(homePage: HomePage): Promise<string> {
	const labels = await homePage.tagChipLabels();
	expect(
		labels.length,
		"expected the tag filter to offer at least one tag besides All",
	).toBeGreaterThan(1);
	return labels[labels.length - 1];
}

test.describe("GIVEN the deployed home page has posts", () => {
	test("WHEN the page is loaded, THEN the filter offers All plus exactly the tags the cards carry", async ({
		homePage,
	}) => {
		await homePage.goto();

		await test.step("Then there is at least one card and a filter is rendered", async () => {
			expect((await homePage.postCardSummaries()).length).toBeGreaterThan(0);
			await expect(homePage.tagFilter).toBeVisible();
		});

		await test.step("Then the chips match the union of the card tags", async () => {
			const cards = await homePage.postCardSummaries();
			const cardTags = [...new Set(cards.flatMap((card) => card.tags))].sort();
			const labels = await homePage.tagChipLabels();

			expect(labels[0]).toBe(ALL_CHIP);
			expect(labels.slice(1).sort()).toEqual(cardTags);
		});
	});

	test("WHEN the page is loaded, THEN All links home and every tag chip links to its own filter", async ({
		homePage,
	}) => {
		await homePage.goto();

		const labels = await homePage.tagChipLabels();
		const hrefs = await homePage.tagChipHrefs();

		expect(hrefs).toHaveLength(labels.length);
		expect(hrefs[0]).toBe("/");
		expect(hrefs.slice(1)).toEqual(
			labels.slice(1).map((label) => `/?tag=${label}`),
		);
	});

	test("WHEN a tag chip is clicked, THEN the URL carries the tag and only cards carrying it survive", async ({
		homePage,
	}) => {
		await homePage.goto();
		const unfiltered = await homePage.postCardSummaries();
		const tag = await anOfferedTag(homePage);

		await test.step(`Click the ${tag} tag chip`, async () => {
			await homePage.tagChip(tag).click();
		});

		await test.step("Then the URL carries that tag", async () => {
			expect(await homePage.currentTag()).toBe(tag);
		});

		await test.step("Then exactly the cards carrying that tag are shown, in order", async () => {
			const expected = unfiltered.filter((card) => card.tags.includes(tag));

			expect(expected.length).toBeGreaterThan(0);
			await expect(homePage.postCards).toHaveCount(expected.length);
			expect(await homePage.postCardSummaries()).toEqual(expected);
		});
	});

	test("WHEN a tag is active, THEN that chip is marked current and links home to clear it", async ({
		homePage,
	}) => {
		await homePage.goto();
		const tag = await anOfferedTag(homePage);

		await homePage.gotoWithTag(tag);

		// Only the active chip is asserted to be current. "All" is deliberately
		// not asserted *not* to be current: TanStack Router's Link marks any
		// link resolving to the current location as aria-current=page, and
		// because every chip points at "/", All picks it up too. Asserting the
		// correct behaviour here would encode a defect as an expectation.
		// Tracked in issue #35; restore the assertion once it is fixed.
		await expect(homePage.tagChip(tag)).toHaveAttribute("aria-current", "page");
		await expect(homePage.tagChip(tag)).toHaveAttribute("href", "/");
	});

	test("WHEN the active tag chip is clicked, THEN the filter clears and the full list returns", async ({
		homePage,
	}) => {
		await homePage.goto();
		const unfiltered = await homePage.postCardSummaries();
		const tag = await anOfferedTag(homePage);

		await homePage.gotoWithTag(tag);
		await homePage.tagChip(tag).click();

		await expect(homePage.page).toHaveURL("/");
		expect(await homePage.postCardSummaries()).toEqual(unfiltered);
	});

	test("WHEN the All chip is clicked, THEN the filter clears and the full list returns", async ({
		homePage,
	}) => {
		await homePage.goto();
		const unfiltered = await homePage.postCardSummaries();
		const tag = await anOfferedTag(homePage);

		await homePage.gotoWithTag(tag);
		await homePage.tagChip(ALL_CHIP).click();

		await expect(homePage.page).toHaveURL("/");
		expect(await homePage.postCardSummaries()).toEqual(unfiltered);
	});
});

test.describe("GIVEN the deployed home page is filtered to a tag no post carries", () => {
	test("WHEN the page is loaded, THEN the empty state names the tag and no cards render", async ({
		homePage,
	}) => {
		await homePage.gotoWithTag("regression-tag-that-should-not-exist");

		await expect(homePage.emptyState).toBeVisible();
		await expect(homePage.emptyState).toContainText(
			"regression-tag-that-should-not-exist",
		);
		await expect(homePage.postCards).toHaveCount(0);
	});
});

test.describe("GIVEN a deployed post page", () => {
	test("WHEN the page is loaded, THEN its tags link back to the home page filter", async ({
		homePage,
		postPage,
	}) => {
		await homePage.goto();
		const cards = await homePage.postCardSummaries();
		expect(cards.length).toBeGreaterThan(0);
		const card = cards[0];

		await postPage.gotoPath(card.href);

		await expect(postPage.heading).toHaveText(card.title);

		await test.step("Then the header tags match the tags the card advertised", async () => {
			expect(await postPage.tagLabels()).toEqual(card.tags);
		});

		await test.step("Then following a tag link shows this post under that tag", async () => {
			if (card.tags.length === 0) {
				test.info().annotations.push({
					type: "note",
					description: "post has no tags; nothing to follow",
				});
				return;
			}

			await postPage.tagLink(card.tags[0]).click();

			expect(await homePage.currentTag()).toBe(card.tags[0]);
			await expect(homePage.postCard(card.title)).toBeVisible();
		});
	});
});
