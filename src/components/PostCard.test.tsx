// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { beerPostSummary, createPostSummary } from "#/test-utils/fixtures";
import PostCard from "./PostCard";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		params,
		className,
	}: {
		children: React.ReactNode;
		to: string;
		params?: { slug?: string };
		className?: string;
	}) => {
		const href = params?.slug ? to.replace("$slug", params.slug) : to;
		return (
			<a href={href} className={className}>
				{children}
			</a>
		);
	},
}));

describe("Given a post summary", () => {
	test("When rendered, Then it links to the post and displays title and excerpt", () => {
		render(<PostCard post={beerPostSummary} />);

		const link = screen.getByRole("link", { name: /Beer Post/i });
		expect(link).toHaveAttribute("href", "/posts/beer-post");
		expect(
			screen.getByRole("heading", { name: "Beer Post" }),
		).toBeInTheDocument();
		expect(screen.getByText("About beer.")).toBeInTheDocument();
	});

	test("When rendered, Then it displays number, date, and tags", () => {
		render(<PostCard post={beerPostSummary} />);

		expect(screen.getByText("#1")).toBeInTheDocument();
		expect(screen.getByText("2026-09-28")).toBeInTheDocument();
		expect(screen.getByText("beer")).toBeInTheDocument();
		expect(screen.getByText("life")).toBeInTheDocument();
	});

	test("When number, date, excerpt, or tags are missing, Then they are omitted", () => {
		const post = createPostSummary({
			slug: "minimal",
			title: "Minimal Post",
			date: null,
			excerpt: "",
			number: null,
			tags: [],
		});

		render(<PostCard post={post} />);

		const link = screen.getByRole("link", { name: "Minimal Post" });
		expect(link).toHaveAttribute("href", "/posts/minimal");
		expect(screen.queryByText(/^#\d+/)).not.toBeInTheDocument();
		expect(screen.queryByText("2026")).not.toBeInTheDocument();
		expect(screen.queryByText("Minimal Post")).toBeInTheDocument();
	});

	test("When a className is provided, Then it is applied to the link", () => {
		render(<PostCard post={beerPostSummary} className="extra-class" />);

		const link = screen.getByRole("link", { name: /Beer Post/i });
		expect(link.className).toContain("extra-class");
	});

	test("When rendered as compact, Then it drops tags and uses compact padding", () => {
		render(<PostCard post={beerPostSummary} variant="compact" />);

		const link = screen.getByRole("link", { name: /Beer Post/i });
		expect(link).toHaveAttribute("href", "/posts/beer-post");
		expect(link.className).toContain("p-4");
		expect(
			screen.getByRole("heading", { name: "Beer Post" }),
		).toBeInTheDocument();
		expect(screen.getByText("#1")).toBeInTheDocument();
		expect(screen.getByText("2026-09-28")).toBeInTheDocument();
		expect(screen.queryByText("beer")).not.toBeInTheDocument();
		expect(screen.queryByText("life")).not.toBeInTheDocument();
	});
});
