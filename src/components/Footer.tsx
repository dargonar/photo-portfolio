"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-glass-bg backdrop-blur-md border-t border-outline-variant flex justify-center items-center gap-6 px-gutter p-4">
      <a
        href="mailto:pablo.tutino@gmail.com"
        className="hover:opacity-70 transition-opacity"
        aria-label="Email"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" ry="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </a>
      <a
        href="https://www.instagram.com/pablotutino"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-70 transition-opacity"
        aria-label="Instagram"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      </a>
      <Link
        href="/about"
        className="font-pt-mono text-[11px] tracking-widest hover:opacity-70 transition-opacity"
      >
        INFO
      </Link>
    </footer>
  );
}
