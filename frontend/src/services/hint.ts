import type {
  HintCatalogItem,
  HintPurchaseRequest,
  HintPurchaseResponse,
  PurchasedHint,
} from "@/types";

const BASE_URL = "/api/v1";

export async function getHintCatalog(
  examId: number,
): Promise<Record<string, HintCatalogItem[]>> {
  const res = await fetch(`${BASE_URL}/exams/${examId}/hints/catalog`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch hint catalog");
  }

  const data = await res.json();
  return data.hints || {};
}

export async function purchaseHint(
  attemptId: number,
  request: HintPurchaseRequest,
): Promise<HintPurchaseResponse> {
  const res = await fetch(`${BASE_URL}/attempts/${attemptId}/hints/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to purchase hint");
  }

  return res.json();
}

export async function getPurchasedHints(
  attemptId: number,
): Promise<PurchasedHint[]> {
  const res = await fetch(`${BASE_URL}/attempts/${attemptId}/hints`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch purchased hints");
  }

  const data = await res.json();
  return Array.isArray(data.hints) ? data.hints : [];
}
