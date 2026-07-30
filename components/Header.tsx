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

  // The landing is the dark "observatory"; every other page is light.
  const dark = pathname === "/";

  return (
    <header
      className={
        dark
          ? "border-b border-white/10 bg-night"
          : "border-b border-fg/10 bg-bg/70 backdrop-blur"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline"
          >
            <span
              className={
                dark
                  ? "h-4 w-4 rounded-full border-4 border-coral"
                  : "h-3.5 w-3.5 rounded-full bg-accent"
              }
            />
            <span
              className={
                "font-display text-lg font-extrabold tracking-wide " +
                (dark ? "text-cream" : "text-fg")
              }
            >
              Probe
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/"
              className={
                "no-underline transition-colors " +
                (dark ? "text-cream hover:text-sun" : "text-muted hover:text-fg")
              }
            >
              {t("chapters")}
            </Link>
          </nav>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <a
            href="https://www.instagram.com/probe.learn?igsh=MTRqMGVzZzQyc2kxYw=="
            target="_blank"
            rel="noopener noreferrer"
            className={
              "transition-colors " +
              (dark ? "text-cream/80 hover:text-sun" : "text-muted hover:text-fg")
            }
            aria-label="Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <div
            className={
              "flex items-center gap-1 rounded-full p-1 text-xs font-semibold " +
              (dark ? "bg-white/10" : "bg-surface")
            }
          >
            {routing.locales.map((l) => (
              <button
                key={l}
                onClick={() => switchTo(l)}
                className={
                  "rounded-full px-3.5 py-1.5 uppercase transition-colors " +
                  (l === locale
                    ? dark
                      ? "bg-cream text-night"
                      : "bg-fg text-bg"
                    : dark
                      ? "text-cream hover:bg-white/10"
                      : "text-muted hover:text-fg")
                }
              >
                {l === "ru" ? "РУ" : "КЫ"}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
