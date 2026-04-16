import type { ReactNode } from "react";
import clsx from "clsx";

type Variant = "insight" | "info" | "warning";

const ICONS: Record<Variant, string> = {
  insight: "✦",
  info: "i",
  warning: "!",
};

export function Callout({
  children,
  title,
  variant = "insight",
}: {
  children: ReactNode;
  title?: string;
  variant?: Variant;
}) {
  return (
    <div
      className={clsx(
        "my-6 flex gap-4 rounded-lg border-l-4 bg-surface/70 p-4",
        variant === "insight" && "border-accent",
        variant === "info" && "border-muted",
        variant === "warning" && "border-[#a83216]",
      )}
    >
      <div
        className={clsx(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-serif text-sm",
          variant === "insight" && "bg-accent/15 text-accent",
          variant === "info" && "bg-muted/15 text-muted",
          variant === "warning" && "bg-[#a83216]/15 text-[#a83216]",
        )}
      >
        {ICONS[variant]}
      </div>
      <div className="flex flex-col gap-1">
        {title && (
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">
            {title}
          </div>
        )}
        <div className="text-fg/90">{children}</div>
      </div>
    </div>
  );
}
