import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { Skeleton } from "@/components/ui";
import { getCurrentContext } from "@/server/auth/session";

export type NavItem = { href: string; label: string };

async function AccountBox() {
  // The page itself reports failures through its error boundary; the sidebar
  // just omits the account details rather than taking the whole layout down.
  const ctx = await getCurrentContext().catch((error) => {
    unstable_rethrow(error);
    return null;
  });
  if (!ctx) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{ctx.name}</p>
        <p className="truncate text-xs text-muted">{ctx.organizationName}</p>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {ctx.systemRole === "admin" ? (
          <Link href="/admin" className="text-xs text-brand hover:underline">Admin panel</Link>
        ) : null}
        <form action={logoutAction}>
          <button type="submit" className="text-xs text-muted hover:text-foreground">Sign out</button>
        </form>
      </div>
    </div>
  );
}

export function AppShell({ title, nav, children }: { title: string; nav: NavItem[]; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex flex-col gap-6 border-b border-border bg-surface p-4 md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <Link href="/" className="font-semibold tracking-tight">
          AI Visibility <span className="text-brand">Engine</span>
          <span className="ml-2 text-xs font-normal text-muted">{title}</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden md:block">
          <Suspense fallback={<Skeleton className="h-12" />}>
            <AccountBox />
          </Suspense>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="mt-4 h-40" />
    </div>
  );
}
