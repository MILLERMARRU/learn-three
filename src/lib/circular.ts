// ══ Movimiento circunferencial: MCU, transmisión y aceleración centrípeta (unidades SI) ───────

/** Ángulo girado (rad) con ω constante: θ = ωt. */
export const angulo = (w: number, t: number) => w * t;

/** Periodo (s), lo que tarda una vuelta: T = 2π / ω. */
export const periodo = (w: number) => (2 * Math.PI) / w;

/** Frecuencia (vueltas por segundo): f = ω / 2π. */
export const frecuencia = (w: number) => w / (2 * Math.PI);

/** ω (rad/s) a partir de las revoluciones por minuto: ω = 2π · rpm / 60. */
export const omegaDeRpm = (rpm: number) => (2 * Math.PI * rpm) / 60;

/** Rapidez tangencial del borde: v = ωR. */
export const vTangencial = (w: number, R: number) => w * R;

/** Aceleración centrípeta: a꜀ = v² / R. */
export const aCentripeta = (v: number, R: number) => (v * v) / R;

/** Transmisión por faja o por contacto (engranajes): la rapidez del borde se conserva, ω₁R₁ = ω₂R₂. */
export const omegaTransmitida = (w1: number, R1: number, R2: number) => (w1 * R1) / R2;

/** Grados a partir de radianes. */
export const grados = (rad: number) => (rad * 180) / Math.PI;

const mcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mcd(b, a % b));

/**
 * Múltiplo de π como texto: fmtPi(n, d) = (n/d)·π simplificado.
 * fmtPi(2, 4) → "π/2" · fmtPi(6, 4) → "3π/2" · fmtPi(8, 4) → "2π" · fmtPi(3, 8) → "3π/8" · fmtPi(0, 4) → "0".
 */
export function fmtPi(n: number, d = 1): string {
  let num = n;
  let den = d;
  // admite numeradores fraccionarios (p. ej. k · t con t = 0,5)
  while (!Number.isInteger(Math.round(num * 1e9) / 1e9) && den < 1e6) {
    num *= 2;
    den *= 2;
  }
  num = Math.round(num);
  if (num === 0) return "0";
  const g = mcd(num, den);
  num /= g;
  den /= g;
  const signo = num < 0 ? "−" : "";
  const a = Math.abs(num);
  const cuerpo = `${a === 1 ? "" : a}π`;
  return `${signo}${cuerpo}${den === 1 ? "" : `/${den}`}`;
}

/** Ángulo en radianes como múltiplo de π con hasta dos decimales: 1.25π → "1,25π". */
export function fmtRadPi(rad: number): string {
  const k = Math.round((rad / Math.PI) * 100) / 100;
  if (k === 0) return "0";
  return `${String(k).replace(".", ",").replace("-", "−")}π`;
}
