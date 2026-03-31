import type { APIError } from "./types";

const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://api.flagbridge.io";

export class ApiError extends Error {
	status: number;
	code: string;

	constructor(status: number, code: string, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
}

async function getToken(): Promise<string | null> {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(/(?:^|; )fb_token=([^;]*)/);
	return match ? decodeURIComponent(match[1]) : null;
}

export async function api<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const token = await getToken();

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...((options.headers as Record<string, string>) || {}),
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const res = await fetch(`${API_URL}${path}`, {
		...options,
		headers,
	});

	if (res.status === 401) {
		if (typeof window !== "undefined") {
			window.location.href = "/login";
		}
		throw new ApiError(401, "unauthorized", "Unauthorized");
	}

	if (!res.ok) {
		const body: APIError = await res.json().catch(() => ({
			error: "unknown",
			message: res.statusText,
			status: res.status,
		}));
		throw new ApiError(res.status, body.error, body.message);
	}

	if (res.status === 204) return undefined as T;
	return res.json();
}
