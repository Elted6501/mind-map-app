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
    <html lang="en" className="h-full">
      <body className={`${inter.variable} antialiased h-full`}>
        <div id="root" className="h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
