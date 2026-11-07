import { expect, test } from "../fixtures/test";

test.describe("GIVEN the home page", () => {
	test("WHEN it is scanned, THEN it has no detectable WCAG A or AA accessibility violations", async ({
		homePage,
		makeAxeBuilder,
	}, testInfo) => {
		await homePage.goto();

		const scan = await makeAxeBuilder().analyze();
		await testInfo.attach("axe-scan-home", {
			body: JSON.stringify(scan, null, 2),
			contentType: "application/json",
		});

		expect(scan.violations).toEqual([]);
	});
});

test.describe("GIVEN a published post page", () => {
	test("WHEN it is scanned, THEN it has no detectable WCAG A or AA accessibility violations", async ({
		postPage,
		makeAxeBuilder,
	}, testInfo) => {
		await postPage.goto("the-story-of-larry-bell");

		const scan = await makeAxeBuilder().analyze();
		await testInfo.attach("axe-scan-post", {
			body: JSON.stringify(scan, null, 2),
			contentType: "application/json",
		});

		expect(scan.violations).toEqual([]);
	});
});

test.describe("GIVEN the tags index page", () => {
	test("WHEN it is scanned, THEN it has no detectable WCAG A or AA accessibility violations", async ({
		tagsPage,
		makeAxeBuilder,
	}, testInfo) => {
		await tagsPage.goto();

		const scan = await makeAxeBuilder().analyze();
		await testInfo.attach("axe-scan-tags", {
			body: JSON.stringify(scan, null, 2),
			contentType: "application/json",
		});

		expect(scan.violations).toEqual([]);
	});
});

test.describe("GIVEN a tag detail page", () => {
	test("WHEN it is scanned, THEN it has no detectable WCAG A or AA accessibility violations", async ({
		tagsPage,
		makeAxeBuilder,
	}, testInfo) => {
		await tagsPage.gotoTag("beer");

		const scan = await makeAxeBuilder().analyze();
		await testInfo.attach("axe-scan-tag", {
			body: JSON.stringify(scan, null, 2),
			contentType: "application/json",
		});

		expect(scan.violations).toEqual([]);
	});
});

test.describe("GIVEN the 404 page", () => {
	test("WHEN it is scanned, THEN it has no detectable WCAG A or AA accessibility violations", async ({
		notFoundPage,
		makeAxeBuilder,
	}, testInfo) => {
		await notFoundPage.navigateTo("/this-page-does-not-exist");

		const scan = await makeAxeBuilder().analyze();
		await testInfo.attach("axe-scan-404", {
			body: JSON.stringify(scan, null, 2),
			contentType: "application/json",
		});

		expect(scan.violations).toEqual([]);
	});
});
