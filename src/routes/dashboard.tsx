import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle2, Circle, Loader2, Package } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrders, FURNITURE, WOODS, type Order, type PlannedTask } from "@/lib/smarttaller";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Carpintero — SmartTaller" },
      { name: "description", content: "Hoja de ruta diaria de manufactura para el carpintero." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const updateTaskStatus = (orderId: string, taskId: string, status: PlannedTask["status"]) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? { ...o, tasks: o.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)) }
        : o,
    );
    setOrders(updated);
    localStorage.setItem("smarttaller_orders", JSON.stringify(updated));
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mi Agenda de Producción</h1>
        <p className="text-muted-foreground">
          Hoja de ruta generada por el planificador automático.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No hay pedidos asignados. El administrador aún no ha registrado producciones.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdate={updateTaskStatus} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function OrderCard({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (orderId: string, taskId: string, status: PlannedTask["status"]) => void;
}) {
  const done = order.tasks.filter((t) => t.status === "completado").length;
  const progress = Math.round((done / order.tasks.length) * 100);

  // Group tasks by day
  const days = Array.from(new Set(order.tasks.map((t) => t.day))).sort();

  return (
    <Card className="overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold">{FURNITURE[order.furniture].label}</h2>
              <Badge variant="secondary">{WOODS[order.wood].label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Cliente: <span className="font-medium text-foreground">{order.client}</span> ·{" "}
              {order.alto}×{order.ancho}×{order.largo} cm · {order.quote.laborHours.toFixed(1)}h totales
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Progreso</div>
            <div className="text-2xl font-bold text-primary">{progress}%</div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {days.map((d) => (
            <div key={d} className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Día {d + 1}</span>
              </div>
              <div className="space-y-2">
                {order.tasks
                  .filter((t) => t.day === d)
                  .map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onCycle={() => {
                        const next: PlannedTask["status"] =
                          task.status === "pendiente"
                            ? "en_progreso"
                            : task.status === "en_progreso"
                              ? "completado"
                              : "pendiente";
                        onUpdate(order.id, task.id, next);
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function TaskRow({ task, onCycle }: { task: PlannedTask; onCycle: () => void }) {
  const Icon =
    task.status === "completado"
      ? CheckCircle2
      : task.status === "en_progreso"
        ? Loader2
        : Circle;
  const colorCls =
    task.status === "completado"
      ? "text-primary"
      : task.status === "en_progreso"
        ? "text-accent-foreground"
        : "text-muted-foreground";

  return (
    <Button
      variant="ghost"
      onClick={onCycle}
      className={`w-full justify-start text-left h-auto py-2 px-2 ${
        task.status === "completado" ? "opacity-60 line-through" : ""
      }`}
    >
      <Icon className={`h-4 w-4 mr-2 shrink-0 ${colorCls} ${task.status === "en_progreso" ? "animate-spin" : ""}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{task.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {task.hours}h
        </div>
      </div>
    </Button>
  );
}
