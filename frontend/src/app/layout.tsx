import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SchemaShift — Isolated PostgreSQL Migration Sandbox",
  description:
    "Safely test SQL migrations and slow queries inside disposable, isolated PostgreSQL containers before production.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-sage-mist text-forest-ink min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="py-6 border-t border-sage-green/20 text-center text-xs text-forest-ink/60">
          <p>SchemaShift Terrarium Engine — Isolated PostgreSQL Container Testing</p>
        </footer>
      </body>
    </html>
  );
}
