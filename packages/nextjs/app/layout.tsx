import type { Metadata } from "next";
import { cn } from "@/utils/cn";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitsplorer",
  description: "A whimsical blockchain analytics tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen">
      <body
        className={cn(
          `${inter.variable} antialiased`,
          "flex flex-col flex-1 h-full px-4 lg:px-[200px] bg-slate-100"
        )}
      >
        {children}
      </body>
    </html>
  );
}
