import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAWAII LAB Event Tracker",
  description:
    "KAWAII LAB.関連グループ（FRUITS ZIPPER / CANDY TUNE / SWEET STEADY / CUTIE STREET / MORE STAR）のイベント情報を自動収集して一覧表示します。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen text-gray-800">{children}</body>
    </html>
  );
}
