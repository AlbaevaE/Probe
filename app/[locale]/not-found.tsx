import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3 pt-20 text-center">
      <div className="text-6xl font-semibold">404</div>
      <p className="text-muted">—</p>
      <Link href="/" className="text-accent">
        ← home
      </Link>
    </div>
  );
}
