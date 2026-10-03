import type { Locator, Page } from "@playwright/test";

export class PostPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly descriptionMeta: Locator;
	/** Every tag link in the post header. The "Back home" link sits outside it. */
	readonly allTagLinks: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.locator("article h1");
		this.descriptionMeta = page.locator('meta[name="description"]');
		this.allTagLinks = page.locator("article header").getByRole("link");
	}

	async goto(slug: string): Promise<void> {
		await this.page.goto(`/posts/${slug}`);
	}

	async gotoPath(path: string): Promise<void> {
		await this.page.goto(path);
	}

	tagLink(tag: string): Locator {
		return this.page.locator("article header").getByRole("link", { name: tag });
	}

	/** Tag link labels in render order, decoded from the DOM. */
	async tagLabels(): Promise<string[]> {
		const labels = await this.allTagLinks.allTextContents();
		return labels.map((label) => label.trim());
	}
}
