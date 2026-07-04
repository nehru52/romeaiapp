"use client";

import { Bell, Check, LogOut, Menu, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "./sidebar-provider";

const NOTIF_STORAGE_KEY = "optimus_notifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotifications(notifs: Notification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
}

export function addNotification(title: string, message: string) {
  const notifs = loadNotifications();
  notifs.unshift({
    id: `n_${Date.now()}`,
    title,
    message,
    time: new Date().toLocaleString(),
    read: false,
  });
  if (notifs.length > 20) notifs.length = 20;
  saveNotifications(notifs);
}

export function Header() {
  const { toggle } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    setNotifications(loadNotifications());
    const onStorage = () => setNotifications(loadNotifications());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Refresh on focus (in case another tab added a notification)
  useEffect(() => {
    const onFocus = () => setNotifications(loadNotifications());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
    setNotifications([]);
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="flex-1" />

        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5">
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5">
                    Clear
                  </button>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Bell className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No notifications yet</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Content review alerts will appear here</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    onClick={() => {
                      const updated = notifications.map(x => x.id === n.id ? { ...x, read: true } : x);
                      saveNotifications(updated);
                      setNotifications(updated);
                      router.push("/generate");
                    }}
                    className={`flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer ${!n.read ? "bg-white/[0.03]" : ""}`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                      <span className="text-xs font-medium flex-1">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground ml-3.5">{n.message}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.name ?? "My Account"}
              {user?.email && (
                <p className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">
                  {user.email}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
