import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { APP_NAME } from "@/lib/data/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans"
});

export const metadata: Metadata = {
  title: `${APP_NAME} | Project Management`,
  description: "Production-ready project management workspace built with Next.js and Supabase."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
