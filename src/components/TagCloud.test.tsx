// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import TagCloud from "./TagCloud";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		params,
		className,
		"aria-current": ariaCurrent,
	}: {
		children: React.ReactNode;
		to: string;
		params?: { tag?: string };
		className?: string;
		"aria-current"?: boolean | "page";
	}) => {
		const href = params?.tag ? to.replace("$tag", params.tag) : to;
		return (
			<a href={href} className={className} aria-current={ariaCurrent}>
				{children}
			</a>
		);
	},
}));

const tags = [
	{ tag: "beer", count: 2 },
	{ tag: "code", count: 1 },
];

describe("Given a tag cloud", () => {
	test("When rendered, Then each tag is a link with its count", () => {
		render(<TagCloud tags={tags} ariaLabel="All tags" />);

		const beerLink = screen.getByRole("link", { name: "beer" });
		const codeLink = screen.getByRole("link", { name: "code" });

		expect(beerLink).toHaveAttribute("href", "/tags/beer");
		expect(codeLink).toHaveAttribute("href", "/tags/code");
		expect(beerLink).toHaveTextContent("2");
		expect(codeLink).toHaveTextContent("1");
	});

	test("When an active tag is provided, Then it has aria-current and active styling", () => {
		render(
			<TagCloud tags={tags} activeTag="beer" ariaLabel="Filter posts by tag" />,
		);

		const beerLink = screen.getByRole("link", { name: "beer" });
		const codeLink = screen.getByRole("link", { name: "code" });

		expect(beerLink).toHaveAttribute("aria-current", "page");
		expect(codeLink).not.toHaveAttribute("aria-current");
	});

	test("When rendered, Then it uses medium padding and text", () => {
		render(<TagCloud tags={tags} ariaLabel="All tags" />);

		const link = screen.getByRole("link", { name: "beer" });
		expect(link.className).toContain("px-3");
		expect(link.className).toContain("py-1");
		expect(link.className).toContain("text-sm");
	});

	test("When tags are empty, Then nothing is rendered", () => {
		const { container } = render(<TagCloud tags={[]} ariaLabel="All tags" />);
		expect(container.firstChild).toBeNull();
	});
});
