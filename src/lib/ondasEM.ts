// ══ Ondas electromagnéticas: c = λ·f, ley de Malus y radar (c = 3 × 10⁸ m/s) ───────

export const C = 3e8;

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0;

/** Longitud de onda (m) de una onda de frecuencia f (Hz): λ = c/f. */
export const longitudEM = (f: number) => limpio(C / f);

/** Frecuencia (Hz) de una onda de longitud λ (m): f = c/λ. */
export const frecuenciaEM = (lambda: number) => limpio(C / lambda);

/** cos² exactos de los ángulos del curso. */
export const COS2: Record<number, number> = { 0: 1, 30: 0.75, 37: 0.64, 45: 0.5, 53: 0.36, 60: 0.25, 90: 0 };

/** Ley de Malus: la intensidad que deja pasar un analizador girado θ, I = I₀·cos²θ. */
export const malus = (I0: number, theta: number) => limpio(I0 * COS2[theta]);

/** Distancia a un objeto por el eco de radar: d = c·t/2 (el pulso va y vuelve). */
export const distanciaRadar = (t: number) => limpio((C * t) / 2);

/** Región del espectro de una onda de longitud λ (m). */
export function regionEspectro(lambda: number): "radio" | "microondas" | "infrarrojo" | "visible" | "ultravioleta" | "rayos X" | "rayos gamma" {
  if (lambda >= 1e-3 * 300) return "radio"; // ≥ 30 cm (≤ 1 GHz)
  if (lambda >= 1e-3) return "microondas";
  if (lambda > 700e-9) return "infrarrojo";
  if (lambda >= 400e-9) return "visible";
  if (lambda >= 10e-9) return "ultravioleta";
  if (lambda >= 1e-11) return "rayos X";
  return "rayos gamma";
}
