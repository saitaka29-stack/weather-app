import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "お天気カレンダー",
  description: "OpenWeatherMap API を使った天気予報アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
