// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import TagList from "./TagList";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		search,
		className,
	}: {
		children: React.ReactNode;
		to: string;
		search?: { tag?: string };
		className?: string;
	}) => (
		<a
			href={search?.tag ? `${to}?tag=${search.tag}` : to}
			className={className}
		>
			{children}
		</a>
	),
}));

describe("Given a list of tags", () => {
	test("When rendered with default props, Then tags are rendered as links to the homepage filter", () => {
		render(<TagList tags={["beer", "code"]} />);

		const beerLink = screen.getByRole("link", { name: "beer" });
		const codeLink = screen.getByRole("link", { name: "code" });

		expect(beerLink).toHaveAttribute("href", "/?tag=beer");
		expect(codeLink).toHaveAttribute("href", "/?tag=code");
	});

	test("When asLinks is false, Then tags are rendered as non-clickable badges", () => {
		render(<TagList tags={["beer", "code"]} asLinks={false} />);

		expect(
			screen.queryByRole("link", { name: "beer" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: "code" }),
		).not.toBeInTheDocument();
		expect(screen.getByText("beer")).toBeInTheDocument();
		expect(screen.getByText("code")).toBeInTheDocument();
	});

	test("When tags are empty, Then nothing is rendered", () => {
		const { container } = render(<TagList tags={[]} />);
		expect(container.firstChild).toBeNull();
	});
});
