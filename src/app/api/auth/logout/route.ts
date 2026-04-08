import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("fb_token");
  cookieStore.delete("fb_user");
  return NextResponse.json({ ok: true });
}
