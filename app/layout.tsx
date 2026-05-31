import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pith",
  description: "Turn blog links into beautiful structured notes and PDFs."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div className="topbar-inner">
              <Link href="/dashboard" className="brand" aria-label="Pith dashboard">
                <span className="brand-mark">
                  <BookOpenText size={19} />
                </span>
                <span>Pith</span>
              </Link>
              <nav className="nav-actions" aria-label="Primary navigation">
                <span>Dev workspace</span>
                <Link className="button secondary" href="/dashboard">
                  Dashboard
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
