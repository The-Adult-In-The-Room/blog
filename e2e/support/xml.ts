/**
 * Decodes XML entities in a string.
 * Handles the five predefined XML entities: &amp;, &lt;, &gt;, &quot;, &apos;
 *
 * This is a simplified decoder for test assertions. For production XML parsing,
 * use a proper XML parser.
 */
export function decodeXmlEntities(input: string): string {
	return input
		.replace(/&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&gt;/g, ">")
		.replace(/&lt;/g, "<")
		.replace(/&amp;/g, "&");
}
