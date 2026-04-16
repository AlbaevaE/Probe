"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Term({
  children,
  def,
}: {
  children: ReactNode;
  def: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const ref = useRef<HTMLSpanElement>(null);

  const show = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setCoords({ top: r.top - 10, left: r.left + r.width / 2 });
    setOpen(true);
  };
  const hide = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <>
      <span
        ref={ref}
        className="cursor-pointer border-b border-dashed border-accent/60 text-fg hover:text-accent hover:border-accent"
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={() => (open ? hide() : show())}
      >
        {children}
      </span>
      {open && coords && (
        <span
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: "translate(-50%, -100%)",
            zIndex: 10000,
          }}
          className="pointer-events-none w-[min(320px,80vw)] rounded-md border border-border bg-fg px-3 py-2 text-sm leading-snug text-bg shadow-lg"
        >
          {def}
        </span>
      )}
    </>
  );
}
