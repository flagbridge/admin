import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.flagbridge.io";

export async function POST(request: Request) {
  const reqBody = await request.json();

  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  });

  if (!res.ok) {
    const errBody = await res
      .json()
      .catch(() => ({ error: { message: "Login failed" } }));
    const error = errBody.error || { message: "Login failed" };
    return NextResponse.json(error, { status: res.status });
  }

  const resBody = await res.json();
  const data = resBody.data || resBody;

  const cookieStore = await cookies();
  cookieStore.set("fb_token", data.token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("fb_user", JSON.stringify(data.user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ user: data.user });
}
