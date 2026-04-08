import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Casi Bros | Project Center",
  description: "Production-ready project management workspace built with Next.js and Supabase."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
