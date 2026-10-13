import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { PluggableList } from "unified";
import { unified } from "unified";

export async function renderMarkdown(
	body: string,
	remarkPlugins: PluggableList = [],
): Promise<string> {
	const result = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkPlugins)
		.use(remarkRehype, { allowDangerousHtml: false })
		.use(rehypeSanitize)
		.use(rehypeStringify)
		.process(body);

	return String(result);
}
