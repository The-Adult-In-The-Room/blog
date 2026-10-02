// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import TagFilter from "./TagFilter";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		search,
		className,
		"aria-current": ariaCurrent,
	}: {
		children: React.ReactNode;
		to: string;
		search?: { tag?: string };
		className?: string;
		"aria-current"?: "page" | undefined;
	}) => (
		<a
			href={search?.tag ? `${to}?tag=${search.tag}` : to}
			className={className}
			aria-current={ariaCurrent}
		>
			{children}
		</a>
	),
}));

describe("Given a list of available tags", () => {
	test("When rendered without an active tag, Then it renders All and every tag", () => {
		render(<TagFilter tags={["beer", "code"]} />);

		expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
			"href",
			"/",
		);
		expect(screen.getByRole("link", { name: "beer" })).toHaveAttribute(
			"href",
			"/?tag=beer",
		);
		expect(screen.getByRole("link", { name: "code" })).toHaveAttribute(
			"href",
			"/?tag=code",
		);
	});

	test("When a tag is active, Then that tag links home and has aria-current", () => {
		render(<TagFilter tags={["beer", "code"]} activeTag="beer" />);

		const activeLink = screen.getByRole("link", { name: "beer" });
		expect(activeLink).toHaveAttribute("href", "/");
		expect(activeLink).toHaveAttribute("aria-current", "page");

		expect(screen.getByRole("link", { name: "code" })).toHaveAttribute(
			"href",
			"/?tag=code",
		);
	});

	test("When a tag is active, Then All still links home to clear the filter", () => {
		render(<TagFilter tags={["beer", "code"]} activeTag="beer" />);

		expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
			"href",
			"/",
		);
	});

	test("When tags are empty, Then nothing is rendered", () => {
		const { container } = render(<TagFilter tags={[]} />);
		expect(container.firstChild).toBeNull();
	});
});
