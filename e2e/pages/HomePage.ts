import type { Locator, Page } from "@playwright/test";

/**
 * Label of the catch-all chip. `TagFilter` renders it first, ahead of every
 * tag, so `tagChipLabels()` and `tagChipHrefs()` are aligned on it at index 0.
 */
export const ALL_CHIP = "All";

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
	readonly tagFilter: Locator;
	readonly tagChips: Locator;
	readonly postCards: Locator;
	readonly emptyState: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.locator("h1");
		this.descriptionMeta = page.locator('meta[name="description"]');
		this.tagFilter = page.locator("nav[aria-label='Filter posts by tag']");
		this.tagChips = this.tagFilter.getByRole("link");
		this.postCards = page.locator("main ul > li");
		this.emptyState = page.getByText(/No posts found with the tag/);
	}

	async goto(): Promise<void> {
		await this.page.goto("/");
	}

	async gotoWithTag(tag: string): Promise<void> {
		await this.page.goto(`/?tag=${encodeURIComponent(tag)}`);
	}

	/** The tag currently applied by the URL, decoded, or null when unfiltered. */
	async currentTag(): Promise<string | null> {
		return new URL(this.page.url()).searchParams.get("tag");
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

	/**
	 * Every post card currently rendered, in document order. This is the oracle
	 * the regression suite measures the tag filter and the feeds against.
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

	/** Chip labels in render order. The first is always the "All" chip. */
	async tagChipLabels(): Promise<string[]> {
		const labels = await this.tagChips.allTextContents();
		return labels.map((label) => label.trim());
	}

	/**
	 * Chip hrefs as server-rendered, aligned with `tagChipLabels`.
	 */
	async tagChipHrefs(): Promise<string[]> {
		return this.tagChips.evaluateAll((chips) =>
			chips.map((chip) => chip.getAttribute("href") ?? ""),
		);
	}
}
