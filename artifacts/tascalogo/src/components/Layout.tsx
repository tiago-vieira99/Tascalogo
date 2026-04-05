import React from "react";
import { Link, useLocation } from "wouter";
import { Map, List, Star, BarChart3, UtensilsCrossed, LogOut, User } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  const navItems = [
    { href: "/", label: "Mapa", icon: Map },
    { href: "/restaurants", label: "O Meu Catálogo", icon: List },
    { href: "/wishlist", label: "Wishlist", icon: Star },
    { href: "/stats", label: "Estatísticas", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 lg:w-72 bg-card border-r border-border/60 shrink-0 flex flex-col shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-10">
        <div className="p-6 md:p-8">
          <Link href="/" className="flex items-center gap-3 text-primary group cursor-pointer">
            <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Tascálogo</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">O teu roteiro</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 pb-4 overflow-y-auto flex flex-row md:flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex-1 md:flex-none">
                <span className={cn(
                  "flex items-center flex-col md:flex-row gap-2 md:gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}>
                  <Icon className={cn("w-5 h-5", isActive ? "opacity-100" : "opacity-70")} />
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom of sidebar */}
        {isLoaded && user && (
          <div className="px-4 pb-6 border-t border-border/40 pt-4 mt-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50 mb-2">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "Utilizador"}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.fullName || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Utilizador"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4 opacity-70" />
              <span className="hidden sm:inline">Terminar sessão</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
