/**
 * Extracts the public origin from a request, respecting X-Forwarded headers.
 *
 * When deployed behind a reverse proxy (e.g., Railway), the request URL
 * reflects the internal hop (often http://), not the external scheme the
 * client used. This function reads X-Forwarded-Proto and X-Forwarded-Host
 * to reconstruct the public origin.
 *
 * Permissive behavior:
 * - Uses X-Forwarded-Proto if present, else falls back to request URL protocol
 * - Uses X-Forwarded-Host if present, else falls back to request URL host
 * - Takes the first entry from comma-separated header values (proxy chains)
 * - Trims whitespace from header values
 *
 * @param request - The incoming request
 * @returns The public origin (e.g., "https://example.com")
 */
export function getPublicOrigin(request: Request): string {
	const url = new URL(request.url);

	const protoHeader = request.headers.get("X-Forwarded-Proto");
	const hostHeader = request.headers.get("X-Forwarded-Host");

	// Parse protocol: use header if present, else use URL protocol
	const proto = protoHeader
		? protoHeader.split(",")[0].trim().replace(/:$/, "")
		: url.protocol.replace(/:$/, "");

	// Parse host: use header if present, else use URL host
	const host = hostHeader ? hostHeader.split(",")[0].trim() : url.host;

	return `${proto}://${host}`;
}
