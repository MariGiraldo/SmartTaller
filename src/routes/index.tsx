import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) navigate({ to: "/login" });
    else navigate({ to: u.role === "admin" ? "/pedidos" : "/dashboard" });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Cargando SmartTaller…</div>
    </div>
  );
}
