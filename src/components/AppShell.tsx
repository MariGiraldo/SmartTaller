import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, ClipboardList, Hammer } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, logout, verifySession, type AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Fast path: local decode to avoid UI flicker.
    const local = getCurrentUser();
    if (!local) {
      navigate({ to: "/login" });
      return;
    }
    setUser(local);
    // Real verification against the server — invalidates on expiry.
    verifySession().then((verified) => {
      if (cancelled) return;
      if (!verified) {
        toast.error("Tu sesión ha expirado. Ingresa nuevamente.");
        navigate({ to: "/login" });
      } else {
        setUser(verified);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, pathname]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const nav = user.role === "admin"
    ? [
        { to: "/pedidos", label: "Registrar Pedido", icon: ClipboardList },
        { to: "/analitica", label: "Analítica", icon: LayoutDashboard },
      ]
    : [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Hammer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold leading-tight">SmartTaller</div>
              <div className="text-xs text-muted-foreground">
                {user.role === "admin" ? "Panel Administrador" : "Panel Carpintero"}
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
