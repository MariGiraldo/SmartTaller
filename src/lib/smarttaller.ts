// Sistema experto: cálculos de volumen y presupuesto, y planificación automatizada sencilla.

export type FurnitureType = "mesa" | "silla" | "escritorio";
export type WoodType = "pino" | "cedro" | "roble";

export interface WoodSpec {
  label: string;
  // costo por m³ (COP)
  costPerM3: number;
 // multiplicador aplicado a las horas base por tarea (madera más dura -> más lento)
  timeFactor: number;
}

export const WOODS: Record<WoodType, WoodSpec> = {
  pino: { label: "Pino", costPerM3: 1_200_000, timeFactor: 1.0 },
  cedro: { label: "Cedro", costPerM3: 2_100_000, timeFactor: 1.2 },
  roble: { label: "Roble", costPerM3: 3_400_000, timeFactor: 1.5 },
};

export const FURNITURE: Record<
  FurnitureType,
  { label: string; wastePct: number; laborBaseHours: number }
> = {
  mesa: { label: "Mesa", wastePct: 0.18, laborBaseHours: 14 },
  silla: { label: "Silla", wastePct: 0.22, laborBaseHours: 9 },
  escritorio: { label: "Escritorio", wastePct: 0.2, laborBaseHours: 18 },
};

export interface QuoteInput {
  furniture: FurnitureType;
  wood: WoodType;
  alto: number; // cm
  ancho: number; // cm
  largo: number; // cm
}

export interface Quote {
  volumeM3: number;
  materialCost: number;
  laborCost: number;
  overhead: number;
  subtotal: number;
  profit: number;
  total: number;
  laborHours: number;
}

const HOURLY_RATE = 22_000; // COP/HORA
const OVERHEAD_PCT = 0.12;
const PROFIT_PCT = 0.35;

export function calculateQuote(input: QuoteInput): Quote {
  const { furniture, wood, alto, ancho, largo } = input;
  const wSpec = WOODS[wood];
  const fSpec = FURNITURE[furniture];

  // Volumen geométrico en m³ con desperdicio
  const rawVolume = (alto / 100) * (ancho / 100) * (largo / 100);
  const volumeM3 = rawVolume * (1 + fSpec.wastePct);

  const materialCost = volumeM3 * wSpec.costPerM3;
  const laborHours = fSpec.laborBaseHours * wSpec.timeFactor;
  const laborCost = laborHours * HOURLY_RATE;
  const subtotal = materialCost + laborCost;
  const overhead = subtotal * OVERHEAD_PCT;
  const beforeProfit = subtotal + overhead;
  const profit = beforeProfit * PROFIT_PCT;
  const total = beforeProfit + profit;

  return {
    volumeM3,
    materialCost,
    laborCost,
    overhead,
    subtotal: beforeProfit,
    profit,
    total,
    laborHours,
  };
}

export interface PlannedTask {
  id: string;
  name: string;
  hours: number;
  day: number; // day offset
  status: "pendiente" | "en_progreso" | "completado";
}

const TASK_TEMPLATE = [
  { name: "Corte de tablones", ratio: 0.15 },
  { name: "Cepillado y dimensionado", ratio: 0.15 },
  { name: "Ruteado y detalles", ratio: 0.15 },
  { name: "Ensamble estructural", ratio: 0.2 },
  { name: "Lijado", ratio: 0.15 },
  { name: "Aplicación de laca / barniz", ratio: 0.15 },
  { name: "Control de calidad", ratio: 0.05 },
];

export function planTasks(quote: Quote, furniture: FurnitureType): PlannedTask[] {
  const total = quote.laborHours;
  const HOURS_PER_DAY = 6;
  let cumulative = 0;
  return TASK_TEMPLATE.map((t, i) => {
    const hours = +(total * t.ratio).toFixed(1);
    const day = Math.floor(cumulative / HOURS_PER_DAY);
    cumulative += hours;
    return {
      id: `t-${furniture}-${i}`,
      name: t.name,
      hours,
      day,
      status: "pendiente" as const,
    };
  });
}

export interface Order {
  id: string;
  createdAt: string;
  client: string;
  furniture: FurnitureType;
  wood: WoodType;
  alto: number;
  ancho: number;
  largo: number;
  quote: Quote;
  tasks: PlannedTask[];
}

const ORDERS_KEY = "smarttaller_orders";

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOrder(order: Order) {
  const all = getOrders();
  all.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
}

export function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}
