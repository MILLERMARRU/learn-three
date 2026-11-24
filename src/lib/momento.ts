// ══ Cantidad de movimiento: impulso, conservación en choques y explosiones, coeficiente de restitución ───────
// Movimientos en una recta: las velocidades llevan signo (positivo = hacia la derecha).

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9 + 0; // + 0 convierte −0 en 0

/** Impulso de una fuerza constante (forma «rect») o que sube y baja linealmente («tri»): el área bajo F–t. */
export function impulso(F: number, dt: number, forma: "rect" | "tri" = "rect"): number {
  return limpio(F * dt * (forma === "tri" ? 0.5 : 1));
}

/** Teorema del impulso: I = m·v − m·v₀ → v = v₀ + I/m. */
export const velocidadTrasImpulso = (I: number, m: number, v0 = 0) => limpio(v0 + I / m);

/** Cantidad de movimiento: p = m·v. */
export const cantidadMovimiento = (m: number, v: number) => limpio(m * v);

/** Choque plástico: quedan pegados, v = (m₁v₁ + m₂v₂)/(m₁ + m₂). */
export const choquePlastico = (m1: number, v1: number, m2: number, v2: number) => limpio((m1 * v1 + m2 * v2) / (m1 + m2));

/** Explosión desde el reposo: m₁v₁ + m₂v₂ = 0 → v₂ = −m₁v₁/m₂. */
export const explosion = (m1: number, v1: number, m2: number) => limpio((-m1 * v1) / m2);

/**
 * Choque de frente con coeficiente de restitución e (1 = elástico, 0 = plástico):
 * se conserva la cantidad de movimiento y v₂' − v₁' = e·(v₁ − v₂).
 */
export function choque(m1: number, v1: number, m2: number, v2: number, e: number): { v1: number; v2: number } {
  const p = m1 * v1 + m2 * v2;
  return {
    v1: limpio((p - m2 * e * (v1 - v2)) / (m1 + m2)),
    v2: limpio((p + m1 * e * (v1 - v2)) / (m1 + m2)),
  };
}

/** Rebote contra el piso: sube hasta e²·h. */
export const alturaRebote = (h: number, e: number) => limpio(e * e * h);
