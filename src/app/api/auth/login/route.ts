import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://api.flagbridge.io";

export async function POST(request: Request) {
	const body = await request.json();

	const res = await fetch(`${API_URL}/v1/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ message: "Login failed" }));
		return NextResponse.json(error, { status: res.status });
	}

	const data = await res.json();

	const cookieStore = await cookies();
	cookieStore.set("fb_token", data.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});

	return NextResponse.json({ user: data.user });
}
