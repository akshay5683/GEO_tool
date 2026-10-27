import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = { title: "Dashboard" };

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <AppShell title="Dashboard" nav={nav}>
      {children}
    </AppShell>
  );
}
