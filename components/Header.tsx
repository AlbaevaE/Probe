"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: string) => {
    router.replace(pathname, { locale: next as (typeof routing.locales)[number] });
  };

  return (
    <header className="border-b border-border/60 bg-bg/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight no-underline">
          {t("brand")}
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <a
            href="https://www.instagram.com/probe.learn?igsh=MTRqMGVzZzQyc2kxYw=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-fg transition-colors"
            aria-label="Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs">
            {routing.locales.map((l) => (
              <button
                key={l}
                onClick={() => switchTo(l)}
                className={
                  "rounded-full px-3.5 py-1.5 uppercase " +
                  (l === locale
                    ? "bg-accent/20 text-fg"
                    : "text-muted hover:text-fg")
                }
              >
                {l}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
