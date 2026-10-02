import type { Locator, Page, Response } from "@playwright/test";

export class NotFoundPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly message: Locator;
	readonly homeLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.locator("main h1");
		this.message = page.locator("main p");
		this.homeLink = page.getByRole("link", { name: /back home/i });
	}

	async navigateTo(path: string): Promise<Response | null> {
		return this.page.goto(path);
	}
}
