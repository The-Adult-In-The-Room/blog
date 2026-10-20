import type { Locator, Page } from "@playwright/test";

/**
 * A home page post card, reduced to the facts a content-agnostic assertion can
 * rely on. `href` is the raw attribute as server-rendered (for example
 * `/posts/some-slug`); pass it through `toPath` before comparing it against a
 * feed, which publishes absolute URLs.
 */
export type PostCardSummary = {
	title: string;
	href: string;
	tags: string[];
};

export class HomePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly descriptionMeta: Locator;
	readonly postCards: Locator;
	readonly tagCloud: Locator;
	readonly browseAllTagsLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.locator("h1");
		this.descriptionMeta = page.locator('meta[name="description"]');
		this.postCards = page.locator("main ul > li");
		this.tagCloud = page.locator('nav[aria-label="Filter posts by tag"]');
		this.browseAllTagsLink = page.getByRole("link", {
			name: "Browse all tags",
		});
	}

	async goto(): Promise<void> {
		await this.page.goto("/");
	}

	postLink(title: string): Locator {
		return this.page.getByRole("link", { name: title });
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

	tagLink(tag: string): Locator {
		return this.tagCloud.getByRole("link", { name: tag });
	}

	async tagLinkCount(tag: string): Promise<number> {
		const text = await this.tagLink(tag).textContent();
		const match = text?.match(/\d+$/);
		return match ? Number.parseInt(match[0], 10) : 0;
	}

	/**
	 * Every post card currently rendered, in document order. This is the oracle
	 * the regression suite measures the feeds against.
	 */
	async postCardSummaries(): Promise<PostCardSummary[]> {
		return this.postCards.evaluateAll((cards) =>
			cards.map((card) => ({
				title: card.querySelector("h3")?.textContent?.trim() ?? "",
				href: card.querySelector("a")?.getAttribute("href") ?? "",
				// The only spans in a card are the tags rendered by TagList; the
				// post number is a <p> and the date is a <time>.
				tags: Array.from(card.querySelectorAll("span")).map(
					(tag) => tag.textContent?.trim() ?? "",
				),
			})),
		);
	}
}
