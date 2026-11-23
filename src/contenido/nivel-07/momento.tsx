// ══ Nivel 7 · Estática: contenido de la etapa 7.3, momento de una fuerza y segunda condición de equilibrio (ΣM = 0) ───────
import { sumaMomentos, type FuerzaEnBarra } from "@/lib/estatica";
import type { RondaDef } from "@/motor/etapa";
import { Op, Sub, V } from "@/ui/Formula";

/** Media longitud de la barra (m): va de −4 m a +4 m. */
export const MEDIA_BARRA = 4;

export interface ProblemaMomento {
  id: string;
  /** fuerza: F hacia abajo en `fuerzaX` · distancia: brazo de la pesa `movil` a un lado del apoyo. */
  tipo: "fuerza" | "distancia";
  /** Posición del apoyo (m). */
  pivote: number;
  /** Pesas conocidas: posición (m) y peso (N). */
  pesas: { x: number; W: number }[];
  /** Peso propio de la barra homogénea (N), aplicado en su centro (x = 0); 0 = barra ligera. */
  barra: number;
  /** Tipo fuerza: dónde tira la mano hacia abajo (m). */
  fuerzaX: number;
  /** Tipo distancia: peso de la pesa que se desplaza y lado del apoyo donde va (+1 derecha, −1 izquierda). */
  movil: { W: number; lado: 1 | -1 } | null;
  respuesta: number;
  paso: number;
  min: number;
  max: number;
  unidad: "N" | "m";
  pistas: [string, string];
}

/** Fuerzas verticales sobre la barra cuando la incógnita vale `valor`. */
export function fuerzasBarra(p: ProblemaMomento, valor: number): FuerzaEnBarra[] {
  const fs: FuerzaEnBarra[] = p.pesas.map((q) => ({ x: q.x, Fy: -q.W }));
  if (p.barra > 0) fs.push({ x: 0, Fy: -p.barra });
  if (p.tipo === "fuerza") fs.push({ x: p.fuerzaX, Fy: -valor });
  else if (p.movil) fs.push({ x: p.pivote + p.movil.lado * valor, Fy: -p.movil.W });
  return fs;
}

/** Momento neto respecto del apoyo (N·m, antihorario positivo). */
export const momentoNeto = (p: ProblemaMomento, valor: number) => sumaMomentos(fuerzasBarra(p, valor), p.pivote);

type Datos = Omit<ProblemaMomento, "id" | "respuesta" | "paso" | "min" | "max" | "unidad" | "pistas" | "barra" | "fuerzaX" | "movil"> & Partial<Pick<ProblemaMomento, "barra" | "fuerzaX" | "movil">>;

function momento(id: string, datos: Datos, pistas: [string, string]): ProblemaMomento {
  const base = { barra: 0, fuerzaX: 0, movil: null, ...datos };
  const esFuerza = base.tipo === "fuerza";
  const ajuste = esFuerza ? { paso: 5, min: 5, max: 200, unidad: "N" as const } : { paso: 0.5, min: 0.5, max: MEDIA_BARRA * 2, unidad: "m" as const };
  // ΣM es lineal en la incógnita: M(0) + pendiente · v = 0
  const prov = { id, ...base, respuesta: 0, pistas, ...ajuste };
  const m0 = momentoNeto(prov, 0);
  const pendiente = momentoNeto(prov, 1) - m0;
  const r = -m0 / pendiente;
  const pasos = r / ajuste.paso;
  const dentro = esFuerza || (base.movil !== null && Math.abs(base.pivote + base.movil.lado * r) <= MEDIA_BARRA + 1e-9);
  if (Math.abs(pasos - Math.round(pasos)) > 1e-9 || r < ajuste.min || r > ajuste.max || !dentro) throw new Error(`7.3 ${id}: incógnita = ${r} fuera del ajuste`);
  return { ...prov, respuesta: Math.round(pasos) * ajuste.paso };
}

export const RONDAS_MOMENTO: RondaDef<ProblemaMomento>[] = [
  {
    ronda: "guiado",
    items: [
      momento("g1", { tipo: "fuerza", pivote: 0, pesas: [{ x: -2, W: 60 }], fuerzaX: 3 }, ["Momento = fuerza × brazo (la distancia al apoyo). En equilibrio, los momentos de un lado igualan a los del otro.", "60 · 2 = F · 3 → F = 40 N."]),
      momento("g2", { tipo: "distancia", pivote: 0, pesas: [{ x: -1.5, W: 80 }], movil: { W: 40, lado: 1 } }, ["La pesa más liviana necesita un brazo mayor.", "80 · 1,5 = 40 · d → d = 3 m."]),
      momento("g3", { tipo: "fuerza", pivote: 0, pesas: [{ x: -3, W: 30 }, { x: -1, W: 20 }], fuerzaX: 2 }, ["Suma los momentos de todas las pesas del mismo lado.", "30 · 3 + 20 · 1 = 110 = F · 2 → F = 55 N."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      momento("p1", { tipo: "distancia", pivote: 0, pesas: [{ x: -2, W: 50 }], movil: { W: 25, lado: 1 } }, ["M = F · d en cada lado.", "50 · 2 = 25 · d → d = 4 m."]),
      momento("p2", { tipo: "fuerza", pivote: 0, pesas: [{ x: -1, W: 100 }], fuerzaX: 4 }, ["Un brazo largo multiplica la fuerza.", "100 · 1 = F · 4 → F = 25 N."]),
      momento("p3", { tipo: "fuerza", pivote: 0, pesas: [{ x: -2.5, W: 40 }, { x: 1, W: 20 }], fuerzaX: 2 }, ["Las pesas a cada lado del apoyo giran en sentidos opuestos.", "40 · 2,5 = 20 · 1 + F · 2 → F = 40 N."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      momento("s1", { tipo: "fuerza", pivote: -2, pesas: [{ x: -4, W: 100 }], barra: 40, fuerzaX: 4 }, ["La barra homogénea pesa: su peso actúa en el centro, a 2 m del apoyo.", "100 · 2 = 40 · 2 + F · 6 → F = 20 N."]),
      momento("s2", { tipo: "distancia", pivote: 0, pesas: [{ x: -2, W: 90 }], movil: { W: 60, lado: 1 } }, ["Iguala los momentos.", "90 · 2 = 60 · d → d = 3 m."]),
      momento("s3", { tipo: "fuerza", pivote: 0, pesas: [{ x: -3, W: 50 }, { x: -1, W: 30 }, { x: 2, W: 20 }], fuerzaX: 4 }, ["Tres pesas: suma con signo según el lado.", "50 · 3 + 30 · 1 = 20 · 2 + F · 4 → F = 35 N."]),
      momento("s4", { tipo: "fuerza", pivote: -1, pesas: [{ x: -4, W: 120 }], barra: 60, fuerzaX: 3 }, ["El peso de la barra (en el centro) queda a 1 m del apoyo.", "120 · 3 = 60 · 1 + F · 4 → F = 75 N."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_MOMENTO = (
  <>
    <V>M</V>
    <Op>=</Op>
    <V>F</V>
    <Op>·</Op>
    <V>d</V>
    <Op>·</Op>Σ<V>M</V>
    <Sub>apoyo</Sub>
    <Op>=</Op>0
  </>
);
