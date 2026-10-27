import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/system", label: "System" },
  { href: "/dashboard", label: "← Dashboard" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppShell title="Admin" nav={nav}>
      {children}
    </AppShell>
  );
}
