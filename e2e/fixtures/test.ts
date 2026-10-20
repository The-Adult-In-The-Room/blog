import { test as base, chromium } from "@playwright/test";
import { FeedsPage } from "../pages/FeedsPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PostPage } from "../pages/PostPage";
import { TagsPage } from "../pages/TagsPage";
import { LIGHTPANDA_WS_ENDPOINT } from "./lightpanda";

export * from "@playwright/test";

export const test = base.extend<{
	feedsPage: FeedsPage;
	homePage: HomePage;
	notFoundPage: NotFoundPage;
	postPage: PostPage;
	tagsPage: TagsPage;
}>({
	browser: async (
		// biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature requires object destructuring.
		{},
		use,
	) => {
		const browser = await chromium.connectOverCDP(LIGHTPANDA_WS_ENDPOINT);
		await use(browser);
		await browser.close();
	},
	context: async ({ context }, use) => {
		// Exclude all e2e runs from Umami analytics.
		// https://docs.umami.is/docs/exclude-my-own-visits
		await context.addInitScript(() => {
			localStorage.setItem("umami.disabled", "1");
		});
		await use(context);
	},
	feedsPage: async ({ request }, use) => {
		await use(new FeedsPage(request));
	},
	homePage: async ({ page }, use) => {
		await use(new HomePage(page));
	},
	notFoundPage: async ({ page }, use) => {
		await use(new NotFoundPage(page));
	},
	postPage: async ({ page }, use) => {
		await use(new PostPage(page));
	},
	tagsPage: async ({ page }, use) => {
		await use(new TagsPage(page));
	},
});
