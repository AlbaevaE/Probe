"use client";

import { usePathname } from "@/i18n/routing";

export function Footer() {
  const pathname = usePathname();
  // Match the Header: dark on the landing, light everywhere else.
  const dark = pathname === "/";

  return (
    <footer
      className={
        dark
          ? "border-t border-white/10 bg-night text-cream/50"
          : "border-t border-fg/10 bg-bg text-muted"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-6 text-[13px]">
        Elvira Albaeva © 2026
      </div>
    </footer>
  );
}
