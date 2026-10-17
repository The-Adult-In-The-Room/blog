export const PALETTES = ["default", "mono"] as const;
export type Palette = (typeof PALETTES)[number];

const STORAGE_KEY = "palette";

function isValidPalette(value: string | null): value is Palette {
	return value != null && (PALETTES as readonly string[]).includes(value);
}

export function getPalette(): Palette {
	if (typeof window === "undefined") {
		return "default";
	}

	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (isValidPalette(stored)) {
		return stored;
	}

	return "default";
}

export function setPalette(palette: Palette): void {
	const root = document.documentElement;

	if (palette === "default") {
		root.removeAttribute("data-palette");
	} else {
		root.setAttribute("data-palette", palette);
	}

	window.localStorage.setItem(STORAGE_KEY, palette);
}

export function cyclePalette(): Palette {
	const current = getPalette();
	const index = PALETTES.indexOf(current);
	const next = PALETTES[(index + 1) % PALETTES.length];
	setPalette(next);
	return next;
}

export function getPaletteFromURL(): Palette | null {
	if (typeof window === "undefined") {
		return null;
	}

	const params = new URLSearchParams(window.location.search);
	const value = params.get("palette");

	if (isValidPalette(value)) {
		return value;
	}

	return null;
}
