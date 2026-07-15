import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Package, Trees } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { getOrders, formatCOP, FURNITURE, WOODS, type Order } from "@/lib/smarttaller";

export const Route = createFileRoute("/analitica")({
  head: () => ({
    meta: [
      { title: "Analítica — SmartTaller" },
      { name: "description", content: "Métricas de negocio: pedidos, ganancia y materiales." },
    ],
  }),
  component: AnaliticaPage,
});

const COLORS = ["#7cc3e8", "#a8d8ea", "#c9e4f2", "#5aa9d4", "#8ecdea"];

function AnaliticaPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => setOrders(getOrders()), []);

  const totalRevenue = orders.reduce((s, o) => s + o.quote.total, 0);
  const totalProfit = orders.reduce((s, o) => s + o.quote.profit, 0);
  const avgMargin = orders.length
    ? (orders.reduce((s, o) => s + o.quote.profit / o.quote.total, 0) / orders.length) * 100
    : 0;

  const byFurniture = Object.keys(FURNITURE).map((k) => ({
    name: FURNITURE[k as keyof typeof FURNITURE].label,
    pedidos: orders.filter((o) => o.furniture === k).length,
  }));

  const byWood = Object.keys(WOODS).map((k) => ({
    name: WOODS[k as keyof typeof WOODS].label,
    value: orders.filter((o) => o.wood === k).length,
  }));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analítica de Negocio</h1>
        <p className="text-muted-foreground">Indicadores clave de producción y rentabilidad.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard icon={Package} label="Pedidos totales" value={String(orders.length)} />
        <StatCard icon={DollarSign} label="Ingresos" value={formatCOP(totalRevenue)} />
        <StatCard icon={TrendingUp} label="Ganancia" value={formatCOP(totalProfit)} />
        <StatCard icon={Trees} label="Margen prom." value={`${avgMargin.toFixed(1)}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Mueble más solicitado</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byFurniture}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="pedidos" fill="#7cc3e8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Madera más utilizada</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byWood}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {byWood.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {orders.length === 0 && (
        <Card className="p-6 mt-6 text-center text-sm text-muted-foreground">
          Aún no se han registrado pedidos. Ve a "Registrar Pedido" para comenzar.
        </Card>
      )}
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </div>
    </Card>
  );
}
