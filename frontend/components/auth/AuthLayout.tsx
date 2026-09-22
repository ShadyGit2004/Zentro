import GuestGuard from "@/components/auth/GuestGuard";
import ZentroLogo from "@/components/brand/ZentroLogo";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  heroHeading: React.ReactNode;
  heroPara: React.ReactNode;
}

export default function AuthLayout({
  children,
  heroHeading,
  heroPara,
}: AuthLayoutProps) {
  return (    
    <GuestGuard>
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/">
            <div className="mb-6 flex items-center justify-center gap-2">
              <ZentroLogo className="h-9 w-9 text-foreground" />
              <span className="text-2xl font-bold tracking-tight">Zentro</span>
            </div>
          </Link>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {heroHeading}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">{heroPara}</p>
        </div>

        {children}
      </div>
    </main>    
    </GuestGuard>
  );
}
