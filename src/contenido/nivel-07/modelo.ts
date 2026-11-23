// ══ Nivel 7 · Estática: modelo de los problemas (tipos, constructores y fuerzas para dibujar), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { dosCuerdas, enPlano, fuerza, fuerzaPoleas, G, senCos, sumaMomentos, type FuerzaEnBarra, type Vec2 } from "@/lib/estatica";
import type { Carga } from "@/three/estatica/EscenaPalanca";

// ══ 7.1 Primera condición de equilibrio ───────
/** Paso y rango del ajuste de la fuerza desconocida (N). */
export const F_PASO = 5;
export const F_MIN = 5;
export const F_MAX = 200;

export type TipoEquilibrio = "colgado" | "piso" | "plano" | "cuerdas";
export type Incognita = "T" | "f" | "N" | "T1" | "T2";

export interface ProblemaEquilibrio {
  id: string;
  tipo: TipoEquilibrio;
  /** Peso del cuerpo (N). */
  W: number;
  /** Masa (kg), si el dato viene así (W = mg). */
  m: number | null;
  /** Piso: fuerza aplicada y su ángulo sobre la horizontal. Plano: inclinación. Cuerdas: ángulos de las cuerdas con la horizontal. */
  F: number;
  angulo: number;
  angulo2: number;
  incognita: Incognita;
  respuesta: number;
  pistas: [string, string];
}

/** Una fuerza para dibujar: nombre, vector (N) y si es la que ajusta el alumno. */
export interface FuerzaDib {
  nombre: string;
  vec: Vec2;
  color: string;
  incognita: boolean;
}

export const COLORES_FUERZA: Record<string, string> = { W: "#ff8a5c", T: "#86b2ff", T1: "#86b2ff", T2: "#b49cff", N: "#6fd6a8", f: "#f0b44c", F: "#ff9ecd" };

/** Valor de equilibrio de cada fuerza del problema (la incógnita incluida). */
function equilibrioDe(p: Omit<ProblemaEquilibrio, "respuesta" | "pistas" | "id">): Record<string, number> {
  if (p.tipo === "colgado") return { T: p.W };
  if (p.tipo === "plano") {
    const { paralela, normal } = enPlano(p.W, p.angulo);
    return { T: paralela, N: normal };
  }
  if (p.tipo === "cuerdas") {
    const [t1, t2] = dosCuerdas(p.W, p.angulo, p.angulo2);
    return { T1: t1, T2: t2 };
  }
  const [s, c] = senCos(p.angulo);
  return { f: p.F * c, N: p.W - p.F * s };
}

/** Fuerzas que actúan sobre el cuerpo cuando la incógnita vale `valor` (las demás, en su valor de equilibrio). */
export function fuerzasDe(p: ProblemaEquilibrio, valor: number): FuerzaDib[] {
  const eq = equilibrioDe(p);
  const v = (n: string) => (n === p.incognita ? valor : eq[n]);
  const f = (nombre: string, vec: Vec2): FuerzaDib => ({ nombre, vec, color: COLORES_FUERZA[nombre], incognita: nombre === p.incognita });
  const peso = f("W", [0, -p.W]);
  if (p.tipo === "colgado") return [f("T", [0, v("T")]), peso];
  if (p.tipo === "plano") return [f("T", fuerza(v("T"), p.angulo)), f("N", fuerza(v("N"), p.angulo + 90)), peso];
  if (p.tipo === "cuerdas") return [f("T1", fuerza(v("T1"), 180 - p.angulo)), f("T2", fuerza(v("T2"), p.angulo2)), peso];
  return [f("F", fuerza(p.F, p.angulo)), f("f", [-v("f"), 0]), f("N", [0, v("N")]), peso];
}

/** Dirección en la que puede moverse el cuerpo si no hay equilibrio (null = en la dirección de la resultante). */
export function direccionLibre(p: ProblemaEquilibrio): Vec2 | null {
  if (p.tipo === "colgado") return [0, 1];
  if (p.tipo === "plano") return fuerza(1, p.angulo);
  if (p.tipo === "cuerdas") return null;
  return p.incognita === "N" ? [0, 1] : [1, 0];
}

export function crearEquilibrio(id: string, tipo: TipoEquilibrio, datos: { W?: number; m?: number; F?: number; angulo?: number; angulo2?: number }, incognita: Incognita, pistas: [string, string]): ProblemaEquilibrio {
  const W = datos.m != null ? datos.m * G : (datos.W ?? 0);
  const base = { tipo, W, m: datos.m ?? null, F: datos.F ?? 0, angulo: datos.angulo ?? 0, angulo2: datos.angulo2 ?? 0, incognita };
  const r = equilibrioDe(base)[incognita];
  // la incógnita es exacta y cae en el ajuste (múltiplo de 5 N): si no, falla al cargar
  if (Math.abs(r - Math.round(r)) > 1e-9 || Math.round(r) % F_PASO !== 0 || r < F_MIN || r > F_MAX) throw new Error(`7.1 ${id}: ${incognita} = ${r} fuera del ajuste`);
  return { id, ...base, respuesta: Math.round(r), pistas };
}

/** Escala de las flechas: la fuerza más grande del equilibrio mide ~1,65 u. */
export const escalaFuerzas = (p: ProblemaEquilibrio) => 1.65 / Math.max(...fuerzasDe(p, p.respuesta).map((f) => Math.hypot(f.vec[0], f.vec[1])));

/** Nombre con subíndice para el texto («T₁», «T₂»). */
export const nombreFuerza = (n: string) => n.replace("1", "₁").replace("2", "₂");

// ══ 7.2 Poleas fijas y móviles ───────
export interface ProblemaAparejo {
  id: string;
  /** Poleas móviles en cascada (0 = solo la polea fija). */
  moviles: number;
  /** Peso que se sostiene (N) y peso de cada polea móvil (N). */
  W: number;
  P: number;
  /** Fuerza con la que hay que tirar de la cuerda (N). */
  respuesta: number;
  pistas: [string, string];
}

export function crearAparejo(id: string, moviles: number, W: number, P: number, pistas: [string, string]): ProblemaAparejo {
  const F = fuerzaPoleas(W, moviles, P);
  // la fuerza es exacta y cae en el ajuste (múltiplo de 5 N): si no, falla al cargar
  if (Math.abs(F - Math.round(F)) > 1e-9 || Math.round(F) % F_PASO !== 0 || F < F_MIN || F > F_MAX) throw new Error(`7.2 ${id}: F = ${F} fuera del ajuste`);
  return { id, moviles, W, P, respuesta: Math.round(F), pistas };
}

// ══ 7.3 Momento de una fuerza ───────
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

export function crearMomento(id: string, datos: Datos, pistas: [string, string]): ProblemaMomento {
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

/** Lo que actúa sobre la barra, para dibujarlo (pesas, peso propio y la incógnita). */
export function cargasBarra(p: ProblemaMomento, v: number): Carga[] {
  const cs: Carga[] = p.pesas.map((q) => ({ x: q.x, F: q.W, tipo: "pesa" }));
  if (p.barra > 0) cs.push({ x: 0, F: p.barra, tipo: "barra" });
  if (p.tipo === "fuerza") cs.push({ x: p.fuerzaX, F: v, tipo: "mano", incognita: true });
  else if (p.movil) cs.push({ x: p.pivote + p.movil.lado * v, F: p.movil.W, tipo: "pesa", incognita: true });
  return cs;
}

/** Escala de las flechas de la barra: la fuerza más grande mide ~1,15 u. */
export const escalaBarra = (p: ProblemaMomento) => 1.15 / Math.max(...cargasBarra(p, p.respuesta).map((c) => c.F));

