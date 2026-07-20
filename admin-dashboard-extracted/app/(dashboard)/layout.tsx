import type React from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="p-4 md:p-6 lg:p-8 fade-in-up">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
