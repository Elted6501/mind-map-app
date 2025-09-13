import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mind Map App",
  description: "A collaborative mind mapping application built with Next.js",
  keywords: ["mind map", "brainstorming", "collaboration", "notes", "visualization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
