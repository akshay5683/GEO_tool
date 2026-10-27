import Link from "next/link";

const nav = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Methodology" },
];

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-semibold tracking-tight">
            AI Visibility <span className="text-brand">Engine</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hidden px-2 py-1 text-muted hover:text-foreground sm:inline">
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="px-2 py-1 text-muted hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-strong dark:text-zinc-950"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <p>AI Visibility Engine — sampled, source-linked AI search measurement.</p>
          <div className="flex gap-4">
            <Link href="/docs" className="hover:text-foreground">Methodology</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
