"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  Home,
  Loader2,
  LogOut,
  Search,
  User,
} from "lucide-react";

import { useUnreadNotificationsCount } from "@/features/notifications/hooks";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/features/auth/AuthProvider";
import api from "@/lib/axios";
import { useEffect } from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading, clearAuth } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  const unreadNotificationsQuery = useUnreadNotificationsCount(Boolean(user));
  const unreadCount = unreadNotificationsQuery.data ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Redirecting...
      </div>
    );
  }

  const showBackButton = pathname !== "/home";

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the API fails, clear the local auth state.
      clearAuth();
    } finally {
      clearAuth();
      router.push("/auth/login");
    }
  };

  const handleBack = () => {
    router.back();
  };

  interface NavItem {
    label: string;
    icon: React.ReactNode;
    href: string;
  }

  const navItems: NavItem[] = [
    {
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      href: "/home",
    },
    {
      label: "Search",
      icon: <Search className="h-5 w-5" />,
      href: "/search",
    },
    {
      label: "Notifications",
      icon: (
        <div className="relative">
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold leading-4 text-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      ),
      href: "/notifications",
    },
    {
      label: "Bookmarks",
      icon: <Bookmark className="h-5 w-5" />,
      href: "/bookmarks",
    },
    {
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      href: `/profile/${user?.id}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r px-4 py-6 md:flex md:flex-col">
          <div className="px-3 text-2xl font-bold tracking-tight">Zentro</div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.label === "Profile"
                  ? pathname.includes(`/profile`)
                  : pathname === item.href;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => router.push(item.href)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}

              <div className="font-semibold md:hidden">Zentro</div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {user && (
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{user.displayName}</p>

                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              )}

              {/* Profile menu */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open profile menu"
                  >
                    <User className="h-5 w-5" />
                    <span className="sr-only">Profile menu</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive data-[highlighted]:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4 stroke-destructive" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="px-4 py-6 pb-24 md:px-6 md:pb-6">{children}</div>
        </main>
      </div>

      {/* Mobile navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background md:hidden">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              item.label === "Profile"
                ? pathname.startsWith("/profile")
                : pathname === item.href;

            return (
              <Button
                key={item.href}
                variant="ghost"
                size="icon"
                className={
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground"
                }
                onClick={() => router.push(item.href)}
                aria-label={item.label}
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
