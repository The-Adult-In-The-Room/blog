import { z } from "zod";

const frontmatterDateSchema = z
	.union([z.string(), z.number(), z.date()])
	.transform((value, ctx) => {
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) {
			ctx.addIssue(`Invalid date: ${JSON.stringify(value)}`);
			return z.NEVER;
		}
		return date.toISOString().slice(0, 10);
	});

export const postFrontmatterSchema = z.object({
	title: z.string().min(1, "Title must be a non-empty string").optional(),
	date: frontmatterDateSchema.optional(),
	slug: z
		.string()
		.min(1, "Slug must be a non-empty string")
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug must contain only lowercase letters, numbers, and hyphens",
		)
		.optional(),
	excerpt: z.string().optional(),
	tags: z
		.union([z.string(), z.array(z.union([z.string(), z.number()]))])
		.optional(),
	number: z.number().int("Number must be an integer").optional(),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
