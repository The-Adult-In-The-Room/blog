import type { Locator, Page } from "@playwright/test";

export class HomePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly descriptionMeta: Locator;
	readonly tagFilter: Locator;
	readonly postCards: Locator;
	readonly emptyState: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.locator("h1");
		this.descriptionMeta = page.locator('meta[name="description"]');
		this.tagFilter = page.locator("nav[aria-label='Filter posts by tag']");
		this.postCards = page.locator("main ul > li");
		this.emptyState = page.getByText(/No posts found with the tag/);
	}

	async goto(): Promise<void> {
		await this.page.goto("/");
	}

	async gotoWithTag(tag: string): Promise<void> {
		await this.page.goto(`/?tag=${encodeURIComponent(tag)}`);
	}

	postLink(title: string): Locator {
		return this.page.getByRole("link", { name: title });
	}

	tagChip(label: string): Locator {
		return this.tagFilter.getByRole("link", { name: label });
	}

	postCard(title: string): Locator {
		return this.page.locator("li", {
			has: this.page.locator("h3", { hasText: title }),
		});
	}

	postCardLink(title: string): Locator {
		return this.postCard(title).locator("a");
	}

	postCardTags(title: string): Locator {
		return this.postCard(title).locator("span");
	}
}
