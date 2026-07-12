"use client";

import {
  CalendarDays,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-provider";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggle } = useSidebar();
  const { logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden",
          isOpen ? "block" : "hidden",
        )}
        onClick={toggle}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background",
          "transition-transform duration-300 ease-in-out",
          "border-r border-border/50",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center border-b border-border/50 px-4">
          <span className="text-lg font-display tracking-tight"><span className="text-gradient-brand">Optimus</span> AI</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-3">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-foreground/[0.04]",
                    pathname === item.href || (item.href === "/users" && pathname.startsWith("/users"))
                      ? "bg-foreground/[0.04] text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 group-hover:text-brand-indigo transition-colors duration-300" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-border/50 p-3">
            <nav className="grid gap-1">
              {/* Settings — collapsible */}
              <div>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-foreground/[0.04] transition-colors",
                    isSettingsActive ? "bg-foreground/[0.04] text-foreground font-semibold" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-auto transition-transform duration-200",
                    settingsOpen && "rotate-180",
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-200",
                  settingsOpen ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0",
                )}>
                  <div className="pl-4 space-y-1 pb-1">
                    {[
                      { name: "Profile", href: "/settings/profile" },
                      { name: "Security", href: "/settings/security" },
                      { name: "Notifications", href: "/settings/communication" },
                      { name: "Subscription", href: "/settings/permissions" },
                    ].map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        onClick={() => toggle()}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.04] hover:text-foreground",
                          pathname === subItem.href
                            ? "bg-foreground/[0.04] text-foreground font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Help */}
              <Link
                href="/settings/profile"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors",
                )}
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help</span>
              </Link>
            </nav>
            <div className="mt-1 pt-1 border-t border-border/50">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Content", href: "/users", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];
