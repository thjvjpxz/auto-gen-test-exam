import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://localhost:8000/api";
const COOKIE_NAME = "access_token";

type RouteParams = {
  params: Promise<{ proxy: string[] }>;
};

/**
 * Builds target URL from proxy path segments.
 */
function buildTargetUrl(
  proxy: string[],
  searchParams: URLSearchParams,
): string {
  const path = `/${proxy.join("/")}`;
  const queryString = searchParams.toString();
  return `${BACKEND_URL}${path}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Creates headers for proxied request, injecting auth token if present.
 */
function createProxyHeaders(
  originalHeaders: Headers,
  token: string | undefined,
): Headers {
  const headers = new Headers();

  originalHeaders.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey !== "host" &&
      lowerKey !== "connection" &&
      lowerKey !== "cookie"
    ) {
      headers.set(key, value);
    }
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

/**
 * Handles all HTTP methods for catch-all proxy route /api/[...proxy].
 * Forwards requests to FastAPI backend with token from HttpOnly cookie.
 */
async function proxyHandler(request: NextRequest, { params }: RouteParams) {
  const { proxy } = await params;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const targetUrl = buildTargetUrl(proxy, request.nextUrl.searchParams);
  const headers = createProxyHeaders(request.headers, token);

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        fetchOptions.body = await request.text();
      } else if (contentType.includes("multipart/form-data")) {
        fetchOptions.body = await request.arrayBuffer();
        headers.delete("content-type");
      } else {
        fetchOptions.body = await request.text();
      }
    }

    const backendResponse = await fetch(targetUrl, fetchOptions);
    const responseContentType =
      backendResponse.headers.get("content-type") || "";

    let response: NextResponse;

    if (
      backendResponse.status === 204 ||
      backendResponse.status === 205 ||
      backendResponse.status === 304
    ) {
      response = new NextResponse(null, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
      });
    } else {
      let responseBody: BodyInit;
      if (responseContentType.includes("application/json")) {
        responseBody = await backendResponse.text();
      } else {
        responseBody = await backendResponse.arrayBuffer();
      }

      response = new NextResponse(responseBody, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
      });
    }

    backendResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "transfer-encoding" &&
        lowerKey !== "connection" &&
        lowerKey !== "keep-alive" &&
        lowerKey !== "content-encoding" &&
        lowerKey !== "content-length"
      ) {
        response.headers.set(key, value);
      }
    });

    return response;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { detail: "Proxy error: Unable to reach backend" },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, routeParams: RouteParams) {
  return proxyHandler(request, routeParams);
}

export async function POST(request: NextRequest, routeParams: RouteParams) {
  return proxyHandler(request, routeParams);
}

export async function PUT(request: NextRequest, routeParams: RouteParams) {
  return proxyHandler(request, routeParams);
}

export async function PATCH(request: NextRequest, routeParams: RouteParams) {
  return proxyHandler(request, routeParams);
}

export async function DELETE(request: NextRequest, routeParams: RouteParams) {
  return proxyHandler(request, routeParams);
}
