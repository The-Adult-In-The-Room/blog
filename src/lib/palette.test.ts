// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	cyclePalette,
	getPalette,
	getPaletteFromURL,
	PALETTES,
	setPalette,
} from "./palette";

describe("Given the palette module", () => {
	beforeEach(() => {
		window.localStorage.clear();
		document.documentElement.removeAttribute("data-palette");
		document.documentElement.removeAttribute("data-theme");
		document.documentElement.classList.remove("light", "dark");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getPalette", () => {
		test("When no palette is stored, Then it returns 'default'", () => {
			expect(getPalette()).toBe("default");
		});

		test("When a valid palette is stored, Then it returns that palette", () => {
			window.localStorage.setItem("palette", "mono");
			expect(getPalette()).toBe("mono");
		});

		test("When an invalid palette is stored, Then it returns 'default'", () => {
			window.localStorage.setItem("palette", "neon");
			expect(getPalette()).toBe("default");
		});

		test("When localStorage has an empty string, Then it returns 'default'", () => {
			window.localStorage.setItem("palette", "");
			expect(getPalette()).toBe("default");
		});
	});

	describe("setPalette", () => {
		test("When set to 'default', Then it removes the data-palette attribute", () => {
			document.documentElement.setAttribute("data-palette", "mono");
			setPalette("default");
			expect(document.documentElement.hasAttribute("data-palette")).toBe(false);
		});

		test("When set to a named palette, Then it sets the data-palette attribute", () => {
			setPalette("mono");
			expect(document.documentElement.getAttribute("data-palette")).toBe(
				"mono",
			);
		});

		test("When set, Then it persists the value to localStorage", () => {
			setPalette("mono");
			expect(window.localStorage.getItem("palette")).toBe("mono");
		});

		test("When switching palettes, Then it replaces the previous attribute value", () => {
			setPalette("default");
			setPalette("mono");
			expect(document.documentElement.getAttribute("data-palette")).toBe(
				"mono",
			);
		});
	});

	describe("cyclePalette", () => {
		test("When starting from 'default', Then it cycles to the next palette", () => {
			const next = cyclePalette();
			expect(next).toBe(PALETTES[1]);
			expect(document.documentElement.getAttribute("data-palette")).toBe(
				PALETTES[1],
			);
		});

		test("When at the last palette, Then it wraps back to 'default'", () => {
			setPalette(PALETTES[PALETTES.length - 1]);
			const next = cyclePalette();
			expect(next).toBe("default");
		});

		test("When called repeatedly, Then it visits every palette in order", () => {
			const visited: string[] = [];
			for (let i = 0; i < PALETTES.length; i++) {
				visited.push(cyclePalette());
			}
			const unique = new Set(visited);
			expect(unique.size).toBe(PALETTES.length);
		});
	});

	describe("getPaletteFromURL", () => {
		test("When no palette param is present, Then it returns null", () => {
			vi.spyOn(window, "location", "get").mockReturnValue({
				search: "",
			} as Location);
			expect(getPaletteFromURL()).toBeNull();
		});

		test("When a valid palette param is present, Then it returns that palette", () => {
			vi.spyOn(window, "location", "get").mockReturnValue({
				search: "?palette=mono",
			} as Location);
			expect(getPaletteFromURL()).toBe("mono");
		});

		test("When an invalid palette param is present, Then it returns null", () => {
			vi.spyOn(window, "location", "get").mockReturnValue({
				search: "?palette=neon",
			} as Location);
			expect(getPaletteFromURL()).toBeNull();
		});

		test("When other params are present without palette, Then it returns null", () => {
			vi.spyOn(window, "location", "get").mockReturnValue({
				search: "?page=2&sort=date",
			} as Location);
			expect(getPaletteFromURL()).toBeNull();
		});
	});
});
