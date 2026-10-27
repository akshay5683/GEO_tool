"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui";

export type NavItem = { href: string; label: string };

const styles = {
  app: {
    base: "text-muted hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800",
    active: "bg-brand-soft font-medium text-brand-strong",
  },
  admin: {
    base: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
    active: "bg-amber-400/15 font-medium text-amber-300",
  },
};

type Props = { items: NavItem[]; variant: "app" | "admin" };

/** Highlights the current section. Overview links ("/dashboard", "/admin") match exactly. */
export function NavLinks(props: Props) {
  return <NavLinkList {...props} pathname={usePathname()} />;
}

/** Unhighlighted links; also the Suspense fallback while the pathname is resolved. */
export function NavLinkList({ items, variant, pathname = null }: Props & { pathname?: string | null }) {
  const roots = new Set(["/dashboard", "/admin"]);
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map((item) => {
        const active =
          pathname !== null &&
          (roots.has(item.href)
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "whitespace-nowrap rounded-md px-3 py-2 text-sm",
              active ? styles[variant].active : styles[variant].base,
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
