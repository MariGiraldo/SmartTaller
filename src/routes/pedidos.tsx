import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Armchair, Table, PencilRuler, Sparkles, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  calculateQuote,
  planTasks,
  saveOrder,
  formatCOP,
  WOODS,
  type FurnitureType,
  type WoodType,
  type Quote,
} from "@/lib/smarttaller";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Registrar Pedido — SmartTaller" },
      {
        name: "description",
        content: "Cotiza mobiliario a medida con cálculo automático de volumen y presupuesto.",
      },
    ],
  }),
  component: PedidosPage,
});

const FURNITURE_OPTIONS: { value: FurnitureType; label: string; icon: React.ElementType }[] = [
  { value: "mesa", label: "Mesa", icon: Table },
  { value: "silla", label: "Silla", icon: Armchair },
  { value: "escritorio", label: "Escritorio", icon: PencilRuler },
];

function PedidosPage() {
  const [furniture, setFurniture] = useState<FurnitureType>("mesa");
  const [wood, setWood] = useState<WoodType>("pino");
  const [client, setClient] = useState("");
  const [alto, setAlto] = useState("");
  const [ancho, setAncho] = useState("");
  const [largo, setLargo] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(alto), an = Number(ancho), l = Number(largo);
    if (!client.trim()) return toast.error("Ingresa el nombre del cliente");
    if (!(a > 0 && an > 0 && l > 0))
      return toast.error("Las dimensiones deben ser mayores a cero");
    const q = calculateQuote({ furniture, wood, alto: a, ancho: an, largo: l });
    setQuote(q);
    toast.success("Presupuesto calculado por el sistema experto");
  };

  const handleSave = () => {
    if (!quote) return;
    const tasks = planTasks(quote, furniture);
    saveOrder({
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      client,
      furniture,
      wood,
      alto: Number(alto),
      ancho: Number(ancho),
      largo: Number(largo),
      quote,
      tasks,
    });
    toast.success("Pedido guardado y enviado al carpintero");
    setClient("");
    setAlto("");
    setAncho("");
    setLargo("");
    setQuote(null);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Registrar Pedido</h1>
        <p className="text-muted-foreground">
          Captura los requerimientos del cliente para generar un presupuesto con IA.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 p-6">
          <form onSubmit={handleCalculate} className="space-y-6">
            <div>
              <Label className="mb-2 block">Tipo de mobiliario</Label>
              <Tabs value={furniture} onValueChange={(v) => setFurniture(v as FurnitureType)}>
                <TabsList className="grid grid-cols-3 w-full">
                  {FURNITURE_OPTIONS.map((f) => {
                    const Icon = f.icon;
                    return (
                      <TabsTrigger key={f.value} value={f.value} className="gap-2">
                        <Icon className="h-4 w-4" />
                        {f.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <Label className="mb-2 block">Dimensiones (cm)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="alto" className="text-xs text-muted-foreground">Alto</Label>
                  <Input id="alto" type="number" min="1" value={alto} onChange={(e) => setAlto(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ancho" className="text-xs text-muted-foreground">Ancho</Label>
                  <Input id="ancho" type="number" min="1" value={ancho} onChange={(e) => setAncho(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="largo" className="text-xs text-muted-foreground">Largo</Label>
                  <Input id="largo" type="number" min="1" value={largo} onChange={(e) => setLargo(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de madera</Label>
              <Select value={wood} onValueChange={(v) => setWood(v as WoodType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WOODS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label} — {formatCOP(v.costPerM3)}/m³
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Calcular con IA
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-primary/10 to-accent/20 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Presupuesto Formal</h2>
          </div>
          {!quote ? (
            <div className="text-sm text-muted-foreground py-12 text-center">
              Completa el formulario y presiona <span className="font-medium">Calcular</span> para
              ver el presupuesto con 35% de ganancia garantizada.
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <Row label="Volumen calculado" value={`${quote.volumeM3.toFixed(4)} m³`} />
              <Row label="Costo material" value={formatCOP(quote.materialCost)} />
              <Row label={`Mano de obra (${quote.laborHours.toFixed(1)}h)`} value={formatCOP(quote.laborCost)} />
              <Row label="Gastos indirectos (12%)" value={formatCOP(quote.overhead)} />
              <div className="border-t border-border pt-3">
                <Row label="Subtotal" value={formatCOP(quote.subtotal)} />
                <Row label="Ganancia (35%)" value={formatCOP(quote.profit)} highlight />
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatCOP(quote.total)}</span>
              </div>
              <Button onClick={handleSave} className="w-full mt-4" variant="default">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Guardar y planificar producción
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-semibold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
