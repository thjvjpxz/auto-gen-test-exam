import type { UserProgression, CoinTransactionListResponse } from "@/types";

const BASE_URL = "/api/v1";

export async function getProgression(): Promise<UserProgression> {
  const res = await fetch(`${BASE_URL}/me/progression`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch progression");
  }

  return res.json();
}

export async function getCoinTransactions(
  limit = 20,
  offset = 0,
): Promise<CoinTransactionListResponse> {
  const res = await fetch(
    `${BASE_URL}/me/coin-transactions?limit=${limit}&offset=${offset}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch coin transactions");
  }

  return res.json();
}
