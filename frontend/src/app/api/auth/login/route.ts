import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://localhost:8000/api";
const COOKIE_NAME = "access_token";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Handles POST /api/auth/login.
 * Proxies login request to FastAPI and sets HttpOnly cookie on success.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    const { access_token, ...restData } = data;

    const response = NextResponse.json(restData, { status: 200 });

    response.cookies.set(COOKIE_NAME, access_token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 },
    );
  }
}
