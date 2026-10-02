import type { Locator, Page } from "@playwright/test";

export class PostPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly descriptionMeta: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.locator("article h1");
		this.descriptionMeta = page.locator('meta[name="description"]');
	}

	async goto(slug: string): Promise<void> {
		await this.page.goto(`/posts/${slug}`);
	}

	tagLink(tag: string): Locator {
		return this.page.locator("article header").getByRole("link", { name: tag });
	}
}
