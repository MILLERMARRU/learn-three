// ══ Nivel 14 · Hidrostática: modelo de los problemas (tipos y constructores), sin rondas ni textos ───────
// El hero y la vista del examen importan solo este módulo, así el inicio no arrastra el contenido de las etapas.
import { fuerzaPrensa, G, presionAbsoluta, presionManometrica, profundidadFlotacion } from "@/lib/fluidos";

/** Valida que la respuesta sea un entero positivo dentro de [min, max]. */
function enAjuste(r: number, min: number, max: number, etapa: string, id: string): number {
  if (Math.abs(r - Math.round(r)) > 1e-9 || r <= min || r > max) throw new Error(`${etapa} ${id}: ${r} fuera del ajuste`);
  return Math.round(r);
}

/** Líquidos del curso: nombre, densidad (kg/m³) y color. */
export const LIQUIDOS = {
  agua: { nombre: "agua", rho: 1000, color: "#4f8fd1" },
  mar: { nombre: "agua de mar", rho: 1030, color: "#3aa39a" },
  aceite: { nombre: "aceite", rho: 800, color: "#d9a441" },
  mercurio: { nombre: "mercurio", rho: 13600, color: "#a9b4c0" },
  glicerina: { nombre: "glicerina", rho: 1250, color: "#b9a4e0" },
} as const;
export type Liquido = keyof typeof LIQUIDOS;

// ══ 14.1 Presión hidrostática ───────
/** Rango del ajuste de presión (kPa): ↑ ↓ de 1 en 1, ← → de 10 en 10. */
export const P_MIN = 0;
export const P_MAX = 200;

export interface ProblemaPresion {
  id: string;
  liquido: Liquido;
  /** Profundidad (m) y si se pide la presión absoluta (con la atmosférica de 100 kPa). */
  h: number;
  absoluta: boolean;
  /** Presión en kPa. */
  respuesta: number;
  pistas: [string, string];
}

export function crearPresion(id: string, liquido: Liquido, h: number, absoluta: boolean, pistas: [string, string]): ProblemaPresion {
  const rho = LIQUIDOS[liquido].rho;
  const P = (absoluta ? presionAbsoluta(rho, h) : presionManometrica(rho, h)) / 1000;
  return { id, liquido, h, absoluta, respuesta: enAjuste(P, P_MIN, P_MAX, "14.1", id), pistas };
}

// ══ 14.2 Principio de Pascal (prensa hidráulica) ───────
/** Paso y rango del ajuste de fuerza (N): ↑ ↓ de 10 en 10, ← → de 100 en 100. */
export const F_PASO = 10;
export const F_MIN = 10;
export const F_MAX = 1000;

export interface ProblemaPrensa {
  id: string;
  /** Masa del auto (kg) sobre el émbolo grande. */
  masa: number;
  /** Cómo da los émbolos el enunciado: áreas en m², áreas en cm² o radios en cm. */
  dato: "m2" | "cm2" | "radio";
  /** Valores del émbolo chico y del grande, en la unidad del dato. */
  a1: number;
  a2: number;
  /** Fuerza en el émbolo chico (N). */
  respuesta: number;
  pistas: [string, string];
}

export function crearPrensa(id: string, masa: number, dato: ProblemaPrensa["dato"], a1: number, a2: number, pistas: [string, string]): ProblemaPrensa {
  // con radios, las áreas van con el cuadrado (π se simplifica en el cociente)
  const [A1, A2] = dato === "radio" ? [a1 * a1, a2 * a2] : [a1, a2];
  const F = fuerzaPrensa(masa * G, A1, A2);
  if (Math.abs(F - Math.round(F)) > 1e-9 || Math.round(F) % F_PASO !== 0 || F < F_MIN || F > F_MAX) throw new Error(`14.2 ${id}: F = ${F} fuera del ajuste`);
  return { id, masa, dato, a1, a2, respuesta: Math.round(F), pistas };
}

// ══ 14.3 Principio de Arquímedes (flotación) ───────
/** Rango del ajuste de la profundidad sumergida (cm): ↑ ↓ de 1 en 1, ← → de 10 en 10. */
export const H_MIN = 1;
export const H_MAX = 60;

/** Materiales de los bloques: nombre y color (el cubo de las rondas «solo» no dice su material). */
export const MATERIALES = {
  madera: { nombre: "madera", color: "#b88a5a" },
  corcho: { nombre: "corcho", color: "#d2b48c" },
  hielo: { nombre: "hielo", color: "#cfe8f3" },
  laton: { nombre: "latón", color: "#c9a640" },
  plastico: { nombre: "plástico", color: "#e07a6c" },
  cubo: { nombre: "cubo", color: "#9aa4b1" },
} as const;
export type Material = keyof typeof MATERIALES;

export interface ProblemaFlotacion {
  id: string;
  liquido: Liquido;
  material: Material;
  /** Altura del bloque (cm) y su densidad (kg/m³). */
  H: number;
  rhoC: number;
  /** Solo en los cubos de las rondas «solo»: la masa (kg); entonces H es la arista y ρ se calcula. */
  masa?: number;
  /** Profundidad sumergida (cm). */
  respuesta: number;
  pistas: [string, string];
}

function validarFlotacion(p: Omit<ProblemaFlotacion, "respuesta">): ProblemaFlotacion {
  const h = profundidadFlotacion(p.H, p.rhoC, LIQUIDOS[p.liquido].rho);
  // debe flotar (h < H) y la respuesta debe ser un entero del ajuste
  if (h >= p.H) throw new Error(`14.3 ${p.id}: el bloque se hunde`);
  return { ...p, respuesta: enAjuste(h, H_MIN - 1, H_MAX, "14.3", p.id) };
}

/** Bloque de un material con su densidad: h = H·ρ_c/ρ_l. */
export function crearFlotacion(id: string, liquido: Liquido, material: Material, rhoC: number, H: number, pistas: [string, string]): ProblemaFlotacion {
  return validarFlotacion({ id, liquido, material, H, rhoC, pistas });
}

/** Cubo de arista L (cm) y masa m (kg): primero ρ = m/L³. */
export function crearCubo(id: string, liquido: Liquido, arista: number, masa: number, pistas: [string, string]): ProblemaFlotacion {
  // sin redondear ρ: profundidadFlotacion ya limpia el resultado (redondear aquí deja 24,99999999 en vez de 25)
  const rhoC = masa / (arista / 100) ** 3;
  return validarFlotacion({ id, liquido, material: "cubo", H: arista, rhoC, masa, pistas });
}

/** Número con coma decimal: «0,25». */
export const fmtF = (n: number) => String(n).replace(".", ",");
