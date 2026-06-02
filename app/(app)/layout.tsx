import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/dashboard" className="brand" aria-label="Pith dashboard">
            <span className="brand-mark">
              <BookOpenText size={19} />
            </span>
            <span className="brand-text">Pith</span>
          </Link>
          <nav className="nav-actions" aria-label="Primary navigation">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="button secondary" type="button">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
