// ══ Nivel 12 · Oscilaciones (MAS): modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { aceleracionMaxima, periodoPendulo, periodoResorte, velocidadEnX, velocidadMaxima } from "@/lib/oscilaciones";

/** Rango del ajuste de período en décimas de segundo (↑ ↓ de 0,1 en 0,1; ← → de 1 en 1). */
export const T10_MIN = 1;
export const T10_MAX = 200;

/** Valida que un período caiga en el ajuste de décimas y lo devuelve redondeado. */
function enDecimas(T: number, etapa: string, id: string): number {
  const d = T * 10;
  if (Math.abs(d - Math.round(d)) > 1e-9 || d < T10_MIN || d > T10_MAX) throw new Error(`${etapa} ${id}: T = ${T} fuera del ajuste`);
  return Math.round(d) / 10;
}

// ══ 12.1 Sistema masa-resorte ───────
export interface ProblemaResorte {
  id: string;
  /** Masa (kg) y constante del resorte (N/m). */
  m: number;
  k: number;
  /** Si el enunciado parte de otro resorte o masa conocidos: el período cambia en proporción. */
  base?: { m: number; k: number };
  respuesta: number;
  pistas: [string, string];
}

export function crearResorte(id: string, m: number, k: number, pistas: [string, string], base?: { m: number; k: number }): ProblemaResorte {
  return { id, m, k, base, respuesta: enDecimas(periodoResorte(m, k), "12.1", id), pistas };
}

/** Período con coma decimal: «1,2». */
export const fmtT = (T: number) => String(T).replace(".", ",");

// ══ 12.2 Péndulo simple ───────
export interface ProblemaPendulo {
  id: string;
  /** Largo del hilo (m) y gravedad del lugar (m/s²; 10 = π² en la Tierra). */
  L: number;
  g: number;
  /** Si el enunciado parte de otro péndulo conocido (mismo lugar): el período cambia en proporción. */
  base?: { L: number };
  respuesta: number;
  pistas: [string, string];
}

export function crearPendulo(id: string, L: number, g: number, pistas: [string, string], base?: { L: number }): ProblemaPendulo {
  return { id, L, g, base, respuesta: enDecimas(periodoPendulo(L, g), "12.2", id), pistas };
}

// ══ 12.3 MAS y movimiento circular ───────
/** Rango del ajuste (m/s o m/s²): ↑ ↓ de 1 en 1, ← → de 10 en 10. */
export const C_MIN = 0;
export const C_MAX = 60;

export interface ProblemaCirculo {
  id: string;
  /** Amplitud (m = radio del círculo de referencia) y frecuencia angular (rad/s). */
  A: number;
  w: number;
  /** v: velocidad máxima · a: aceleración máxima · vx: rapidez a la distancia x del centro. */
  tipo: "v" | "a" | "vx";
  x: number;
  respuesta: number;
  pistas: [string, string];
}

export function crearCirculo(id: string, tipo: ProblemaCirculo["tipo"], A: number, w: number, pistas: [string, string], x = 0): ProblemaCirculo {
  const r = tipo === "v" ? velocidadMaxima(A, w) : tipo === "a" ? aceleracionMaxima(A, w) : velocidadEnX(A, w, x);
  // la respuesta es un entero positivo dentro del ajuste: si no, falla al cargar
  if (!Number.isInteger(r) || r <= C_MIN || r > C_MAX) throw new Error(`12.3 ${id}: ${tipo} = ${r} fuera del ajuste`);
  return { id, A, w, tipo, x, respuesta: r, pistas };
}

/** Frecuencia angular que reproduce un valor propuesto (para el punto fantasma). */
export function omegaPropuesta(p: Pick<ProblemaCirculo, "A" | "tipo" | "x">, valor: number): number {
  if (p.tipo === "v") return valor / p.A;
  if (p.tipo === "a") return Math.sqrt(Math.max(0, valor) / p.A);
  return valor / Math.sqrt(p.A * p.A - p.x * p.x);
}
