import type { Metadata } from "next";
import { Lexend, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hệ Thống Thi CNTT Online",
    template: "%s | Hệ Thống Thi CNTT Online",
  },
  description:
    "Hệ thống thi trắc nghiệm và tự luận CNTT với AI tự động sinh đề và chấm điểm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} ${lexend.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
