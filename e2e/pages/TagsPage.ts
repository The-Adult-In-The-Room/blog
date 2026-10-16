import type { Locator, Page } from "@playwright/test";

export class TagsPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly tagLinks: Locator;
	readonly postCards: Locator;
	readonly emptyState: Locator;
	readonly tagChips: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.locator("h1");
		this.tagLinks = page.locator("nav[aria-label='All tags'] a");
		this.postCards = page.locator("main section.space-y-6 > ul > li");
		this.emptyState = page.getByText(/No posts found with the tag/);
		this.tagChips = page.locator("nav[aria-label='Filter posts by tag'] a");
	}

	async goto(): Promise<void> {
		await this.page.goto("/tags");
	}

	async gotoTag(tag: string): Promise<void> {
		await this.page.goto(`/tags/${encodeURIComponent(tag)}`);
	}

	tagLink(label: string): Locator {
		return this.tagLinks.filter({ hasText: new RegExp(`^${label}\\d*$`) });
	}

	tagChip(label: string): Locator {
		return this.tagChips.filter({ hasText: new RegExp(`^${label}$`) });
	}

	postCard(title: string): Locator {
		return this.page.locator("li", {
			has: this.page.locator("h3", { hasText: title }),
		});
	}
}
