import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Hammer, Lock, User } from "lucide-react";
import { login, getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Ingreso — SmartTaller" },
      { name: "description", content: "Acceso seguro al taller inteligente SmartTaller." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) navigate({ to: u.role === "admin" ? "/pedidos" : "/dashboard" });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = login(username, password);
      setLoading(false);
      if (!user) {
        toast.error("Credenciales inválidas");
        return;
      }
      toast.success(`Bienvenido, ${user.name}`);
      navigate({ to: user.role === "admin" ? "/pedidos" : "/dashboard" });
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 mb-3">
            <Hammer className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SmartTaller</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manufactura inteligente para carpintería artesanal
          </p>
        </div>
        <Card className="p-6 shadow-lg border-primary/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  placeholder="admin"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Ingresar"}
            </Button>
          </form>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Cuentas de prueba:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-secondary/60 p-2">
                <div className="font-medium">Administrador</div>
                <div className="text-muted-foreground">admin / admin123</div>
              </div>
              <div className="rounded-md bg-secondary/60 p-2">
                <div className="font-medium">Carpintero</div>
                <div className="text-muted-foreground">carpintero / carpintero123</div>
              </div>
            </div>
          </div>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Autenticación protegida con JWT · Sesión persistente
        </p>
      </div>
    </div>
  );
}
