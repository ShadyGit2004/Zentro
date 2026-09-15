"use client";

import { useRouter } from "next/navigation";
import { Bell, Home, LogOut, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";
import api from "@/lib/axios";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuth();

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r px-4 py-6 md:flex md:flex-col">
          <div className="px-3 text-2xl font-bold tracking-tight">Zentro</div>

          <nav className="mt-8 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => router.push("/home")}
            >
              <Home className="h-5 w-5" />
              Home
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => router.push("/search")}
            >
              <Search className="h-5 w-5" />
              Search
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => router.push("/notifications")}
            >
              <Bell className="h-5 w-5" />
              Notifications
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => router.push(`/profile/${user?._id}`)}
            >
              <User className="h-5 w-5" />
              Profile
            </Button>
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
            <div className="font-semibold md:hidden">Zentro</div>

            <div className="ml-auto flex items-center gap-3">
              {user && (
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{user.displayName}</p>

                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/profile/${user?._id}`)}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </div>
          </header>

          <div className="px-4 py-6 md:px-6">{children}</div>
        </main>
      </div>

      {/* Mobile navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background md:hidden">
        <div className="flex h-16 items-center justify-around">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/home")}
          >
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/search")}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/profile/${user?._id}`)}
          >
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
