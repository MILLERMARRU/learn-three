// ══ Álgebra de dimensiones ───────
// Una dimensión es un mapa base → exponente. Ej.: fuerza = { M: 1, L: 1, T: -2 }

export const BASES = ["M", "L", "T", "θ", "I", "J", "N"] as const;
export type Base = (typeof BASES)[number];
export type Dim = Partial<Record<Base, number>>;

export interface InfoBase {
  nombre: string;
  unidad: string;
  simboloUnidad: string;
  color: string;
  tecla: string;
}

export const INFO_BASE: Record<Base, InfoBase> = {
  M: { nombre: "masa", unidad: "kilogramo", simboloUnidad: "kg", color: "#ff8a5c", tecla: "M" },
  L: { nombre: "longitud", unidad: "metro", simboloUnidad: "m", color: "#86b2ff", tecla: "L" },
  T: { nombre: "tiempo", unidad: "segundo", simboloUnidad: "s", color: "#6fd6a8", tecla: "T" },
  θ: { nombre: "temperatura", unidad: "kelvin", simboloUnidad: "K", color: "#f0b44c", tecla: "O" },
  I: { nombre: "intensidad de corriente", unidad: "ampere", simboloUnidad: "A", color: "#f2479f", tecla: "I" },
  J: { nombre: "intensidad luminosa", unidad: "candela", simboloUnidad: "cd", color: "#f4efe6", tecla: "J" },
  N: { nombre: "cantidad de sustancia", unidad: "mol", simboloUnidad: "mol", color: "#b49cff", tecla: "N" },
};

// ══ Teclado → símbolo ───────
/** Convierte una tecla en el carácter que se escribe en la respuesta (o null si no aplica). */
export function teclaACaracter(key: string): string | null {
  if (key.length !== 1 && key !== "θ") return null;
  const k = key.toUpperCase();
  if (k === "O" || k === "Q" || key === "θ") return "θ";
  if ((BASES as readonly string[]).includes(k)) return k;
  if (/^[0-9]$/.test(key)) return key;
  if (key === "-" || key === "−") return "-";
  return null;
}

// ══ Operaciones ───────
export function limpiar(d: Dim): Dim {
  const out: Dim = {};
  for (const b of BASES) if (d[b]) out[b] = d[b];
  return out;
}

export function mul(a: Dim, b: Dim): Dim {
  const out: Dim = {};
  for (const k of BASES) {
    const v = (a[k] ?? 0) + (b[k] ?? 0);
    if (v) out[k] = Math.round(v * 1e6) / 1e6;
  }
  return out;
}

export function pot(a: Dim, n: number): Dim {
  const out: Dim = {};
  for (const k of BASES) if (a[k]) out[k] = (a[k] as number) * n;
  return limpiar(out);
}

export function div(a: Dim, b: Dim): Dim {
  return mul(a, pot(b, -1));
}

export function iguales(a: Dim, b: Dim): boolean {
  return BASES.every((k) => Math.abs((a[k] ?? 0) - (b[k] ?? 0)) < 1e-9);
}

export function esAdimensional(d: Dim): boolean {
  return BASES.every((k) => !d[k]);
}

/** Texto canónico para teclear: "MLT-2", "L3", "1" (adimensional). */
export function canonica(d: Dim): string {
  const partes = BASES.filter((b) => d[b]).map((b) => b + (d[b] === 1 ? "" : String(d[b])));
  return partes.length ? partes.join("") : "1";
}

// ══ Parseo de lo tecleado ───────
export interface Token {
  base: Base | "1";
  exp: string; // texto crudo del exponente: "", "-", "-2", "3"
}

export interface Parseo {
  dim: Dim;
  tokens: Token[];
  valido: boolean; // listo para comprobar
  adimensional: boolean; // escribió "1"
  vacio: boolean;
}

export function parsear(s: string): Parseo {
  const tokens: Token[] = [];
  let valido = true;
  for (const ch of s) {
    if ((BASES as readonly string[]).includes(ch)) {
      tokens.push({ base: ch as Base, exp: "" });
    } else if (ch === "-" || /[0-9]/.test(ch)) {
      const ult = tokens[tokens.length - 1];
      if (!ult) {
        if (ch === "1") tokens.push({ base: "1", exp: "" });
        else valido = false;
      } else if (ult.base === "1") {
        valido = false;
      } else if (ch === "-" && ult.exp.length > 0) {
        valido = false;
      } else {
        ult.exp += ch;
      }
    }
  }
  const dim: Dim = {};
  let unidad = false;
  for (const t of tokens) {
    if (t.base === "1") {
      unidad = true;
      continue;
    }
    // "-" a medias se previsualiza como -1, pero no es válido para comprobar
    if (t.exp === "-") valido = false;
    const n = t.exp === "" ? 1 : t.exp === "-" ? -1 : Number(t.exp);
    if (!Number.isFinite(n) || n === 0) valido = false;
    dim[t.base] = (dim[t.base] ?? 0) + (Number.isFinite(n) ? n : 0);
  }
  if (unidad && tokens.length > 1) valido = false;
  return {
    dim: limpiar(dim),
    tokens,
    valido: valido && tokens.length > 0,
    adimensional: unidad && tokens.length === 1,
    vacio: tokens.length === 0,
  };
}

// ══ Formato bonito ───────
const SUP: Record<string, string> = {
  "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", ".": "·",
};

export function sup(s: string): string {
  return [...s].map((c) => SUP[c] ?? c).join("");
}

/** "M L T⁻²" (o "1" si es adimensional). */
export function formato(d: Dim): string {
  const partes = BASES.filter((b) => d[b]).map((b) => b + (d[b] === 1 ? "" : sup(String(d[b]))));
  return partes.length ? partes.join("") : "1";
}

/** Exponentes fraccionarios legibles: 0.5 → ½, -1.5 → −3⁄2. */
export function fraccion(n: number): string {
  const s = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (Number.isInteger(a)) return s + a;
  if (Math.abs(a - 0.5) < 1e-9) return s + "½";
  const num = Math.round(a * 2);
  return `${s}${num}⁄2`;
}

/** Diagnóstico corto de qué está mal (para la retroalimentación). */
export function diagnostico(escrito: Dim, correcto: Dim): string[] {
  const msgs: string[] = [];
  for (const b of BASES) {
    const e = escrito[b] ?? 0;
    const c = correcto[b] ?? 0;
    if (e === c) continue;
    if (c === 0) msgs.push(`Te sobra ${b}`);
    else if (e === 0) msgs.push(`Falta ${b} (${INFO_BASE[b].nombre})`);
    else msgs.push(`Revisa el exponente de ${b}`);
  }
  return msgs;
}
