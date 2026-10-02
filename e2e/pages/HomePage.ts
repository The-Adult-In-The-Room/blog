import type { Locator, Page } from "@playwright/test";

export class HomePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly descriptionMeta: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.locator("h1");
		this.descriptionMeta = page.locator('meta[name="description"]');
	}

	async goto(): Promise<void> {
		await this.page.goto("/");
	}

	postLink(title: string): Locator {
		return this.page.getByRole("link", { name: title });
	}
}
