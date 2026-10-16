import { describe, expect, test } from "vitest";
import { getPublicOrigin } from "./public-origin";

describe("Given the getPublicOrigin function", () => {
	test("When no forwarded headers are present, Then it uses the request URL origin", () => {
		const request = new Request("https://example.com/path");
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://example.com");
	});

	test("When only X-Forwarded-Proto is present, Then it uses the header proto and URL host", () => {
		const request = new Request("http://example.com/path", {
			headers: { "X-Forwarded-Proto": "https" },
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://example.com");
	});

	test("When only X-Forwarded-Host is present, Then it uses the URL proto and header host", () => {
		const request = new Request("https://internal.example.com/path", {
			headers: { "X-Forwarded-Host": "public.example.com" },
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://public.example.com");
	});

	test("When both headers are present, Then it uses both", () => {
		const request = new Request("http://internal.example.com/path", {
			headers: {
				"X-Forwarded-Proto": "https",
				"X-Forwarded-Host": "public.example.com",
			},
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://public.example.com");
	});

	test("When X-Forwarded-Proto contains multiple values, Then it uses the first", () => {
		const request = new Request("http://example.com/path", {
			headers: { "X-Forwarded-Proto": "https, http, http" },
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://example.com");
	});

	test("When X-Forwarded-Host contains multiple values, Then it uses the first", () => {
		const request = new Request("https://internal.example.com/path", {
			headers: {
				"X-Forwarded-Host":
					"public.example.com, proxy1.example.com, proxy2.example.com",
			},
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://public.example.com");
	});

	test("When header values contain whitespace, Then it trims them", () => {
		const request = new Request("http://example.com/path", {
			headers: {
				"X-Forwarded-Proto": "  https  ",
				"X-Forwarded-Host": "  example.com  ",
			},
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://example.com");
	});

	test("When X-Forwarded-Proto has a trailing colon, Then it is removed", () => {
		const request = new Request("http://example.com/path", {
			headers: { "X-Forwarded-Proto": "https:" },
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://example.com");
	});

	test("When the URL includes a port, Then it is preserved when no X-Forwarded-Host is set", () => {
		const request = new Request("http://example.com:8080/path", {
			headers: { "X-Forwarded-Proto": "https" },
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://example.com:8080");
	});

	test("When X-Forwarded-Host includes a port, Then it is used", () => {
		const request = new Request("http://example.com/path", {
			headers: {
				"X-Forwarded-Proto": "https",
				"X-Forwarded-Host": "public.example.com:3000",
			},
		});
		const origin = getPublicOrigin(request);
		expect(origin).toBe("https://public.example.com:3000");
	});
});
