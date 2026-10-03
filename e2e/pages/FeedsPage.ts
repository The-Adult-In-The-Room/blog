import type { APIRequestContext } from "@playwright/test";

type RssItem = {
	title: string;
	link: string;
	description: string;
};

type RssFeed = {
	status: number;
	contentType: string | null;
	channelTitle: string;
	channelLink: string;
	items: RssItem[];
	raw: string;
};

type Sitemap = {
	status: number;
	contentType: string | null;
	locs: string[];
	raw: string;
};

export class FeedsPage {
	constructor(readonly request: APIRequestContext) {}

	/** Status code for an in-site path, resolved against the configured base URL. */
	async statusFor(path: string): Promise<number> {
		const response = await this.request.get(path);
		return response.status();
	}

	async fetchRss(): Promise<RssFeed> {
		const response = await this.request.get("/rss.xml");
		const raw = await response.text();
		const status = response.status();
		const contentType = response.headers()["content-type"] ?? null;

		const channelBlock = raw.match(/<channel>(.*?)<\/channel>/s)?.[1] ?? "";
		const channelTitle = channelBlock.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
		const channelLink = channelBlock.match(/<link>(.*?)<\/link>/)?.[1] ?? "";

		const items: RssItem[] = [];
		for (const [, block] of raw.matchAll(/<item>(.*?)<\/item>/gs)) {
			items.push({
				title: block.match(/<title>(.*?)<\/title>/)?.[1] ?? "",
				link: block.match(/<link>(.*?)<\/link>/)?.[1] ?? "",
				description:
					block.match(/<description>(.*?)<\/description>/)?.[1] ?? "",
			});
		}

		return { status, contentType, channelTitle, channelLink, items, raw };
	}

	async fetchSitemap(): Promise<Sitemap> {
		const response = await this.request.get("/sitemap.xml");
		const raw = await response.text();
		const status = response.status();
		const contentType = response.headers()["content-type"] ?? null;
		const locs = [...raw.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => loc);

		return { status, contentType, locs, raw };
	}
}
