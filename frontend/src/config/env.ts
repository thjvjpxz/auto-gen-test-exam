export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000",
  APP_NAME: "Hệ Thống Thi CNTT Online",
  IS_DEV: process.env.NODE_ENV === "development",
} as const;
