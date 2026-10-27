import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { NavLinkList, NavLinks, type NavItem } from "@/components/nav-links";
import { Skeleton, cx } from "@/components/ui";
import { getCurrentContext } from "@/server/auth/session";

export type { NavItem };
type Variant = "app" | "admin";

async function AccountBox({ variant }: { variant: Variant }) {
  // The page itself reports failures through its error boundary; the sidebar
  // just omits the account details rather than taking the whole layout down.
  const ctx = await getCurrentContext().catch((error) => {
    unstable_rethrow(error);
    return null;
  });
  if (!ctx) return null;
  const admin = variant === "admin";
  return (
    <div className={cx("flex flex-col gap-3 border-t pt-4 text-sm", admin ? "border-zinc-800" : "border-border")}>
      <div className="min-w-0">
        <p className="truncate font-medium">{ctx.name}</p>
        <p className={cx("truncate text-xs", admin ? "text-zinc-400" : "text-muted")}>
          {admin ? ctx.email : ctx.organizationName}
        </p>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {!admin && ctx.systemRole === "admin" ? (
          <Link href="/admin" className="text-xs text-brand hover:underline">Admin panel</Link>
        ) : null}
        <form action={logoutAction}>
          <button
            type="submit"
            className={cx("text-xs", admin ? "text-zinc-400 hover:text-zinc-100" : "text-muted hover:text-foreground")}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminBanner() {
  return (
    <div className="flex items-center justify-between gap-4 bg-amber-400 px-4 py-2 text-sm text-zinc-950">
      <p>
        <span className="font-semibold tracking-wide">ADMIN MODE</span>
        <span className="hidden sm:inline"> · Changes here affect every customer organization.</span>
      </p>
      <Link href="/dashboard" className="shrink-0 font-medium underline underline-offset-2 hover:no-underline">
        Exit to dashboard
      </Link>
    </div>
  );
}

export function AppShell({
  title,
  nav,
  variant = "app",
  children,
}: {
  title: string;
  nav: NavItem[];
  variant?: Variant;
  children: ReactNode;
}) {
  const admin = variant === "admin";
  return (
    <div className="flex flex-1 flex-col">
      {admin ? <AdminBanner /> : null}
      <div className="flex flex-1 flex-col md:flex-row">
        <aside
          className={cx(
            "flex flex-col gap-6 border-b p-4 md:w-60 md:shrink-0 md:border-b-0 md:border-r",
            admin ? "border-zinc-800 bg-zinc-950 text-zinc-100" : "border-border bg-surface",
          )}
        >
          <Link href={admin ? "/admin" : "/"} className="flex items-center gap-2 font-semibold tracking-tight">
            <span>
              AI Visibility <span className={admin ? "text-amber-400" : "text-brand"}>Engine</span>
            </span>
            {admin ? (
              <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-zinc-950">
                ADMIN
              </span>
            ) : (
              <span className="text-xs font-normal text-muted">{title}</span>
            )}
          </Link>
          <Suspense fallback={<NavLinkList items={nav} variant={variant} />}>
            <NavLinks items={nav} variant={variant} />
          </Suspense>
          <div className="mt-auto hidden md:block">
            <Suspense fallback={<Skeleton className="h-12" />}>
              <AccountBox variant={variant} />
            </Suspense>
          </div>
        </aside>
        <main className={cx("min-w-0 flex-1 px-4 py-8 sm:px-8", admin && "bg-zinc-100 dark:bg-zinc-900")}>
          <div className="mx-auto max-w-5xl">
            <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
          </div>
        </main>
      </div>
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
