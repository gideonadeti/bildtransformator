import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async () => {
  const cookieStore = await cookies();

  // Clear the refreshToken cookie
  cookieStore.delete("refreshToken");

  return NextResponse.json({ success: true });
};
