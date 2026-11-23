// ══ Gravitación universal: ley de Newton por proporciones, gravedad en la altura y en otros planetas, satélites y Kepler ───────
// El curso razona con proporciones (como en los exámenes de admisión): g₀ = 10 m/s² y R = 6400 km en la Tierra.

/** Gravedad en la superficie terrestre (m/s²). */
export const G0 = 10;
/** Radio terrestre (km). */
export const R_TIERRA = 6400;
/** Velocidad orbital rasante: √(g₀·R) = √(10 · 6,4·10⁶) m/s = 8 km/s. */
export const V_RASANTE = 8;

/** Quita el ruido de coma flotante (las respuestas del curso son exactas). */
const limpio = (x: number) => Math.round(x * 1e9) / 1e9;

/**
 * Nueva fuerza de atracción cuando las masas se multiplican por k₁ y k₂ y la distancia por kd:
 * F = G·m₁·m₂/d² → F' = F₀ · k₁·k₂ / kd².
 */
export function fuerzaProporcional(F0: number, k1: number, k2: number, kd: number): number {
  return limpio((F0 * k1 * k2) / (kd * kd));
}

/**
 * Gravedad (m/s²) a una altura h sobre un planeta de masa kM y radio kR (relativos a la Tierra).
 * La altura va en radios del propio planeta: g = g₀ · kM / kR² · (R / (R + h))².
 */
export function gravedad(kM: number, kR: number, hR = 0): number {
  return limpio(((G0 * kM) / (kR * kR)) * (1 / (1 + hR)) ** 2);
}

/** Tercera ley de Kepler: T² ∝ r³ → T₂ = T₁ · (r₂/r₁)^(3/2). */
export function periodoKepler(T1: number, r1: number, r2: number): number {
  return limpio(T1 * (r2 / r1) ** 1.5);
}

/** Velocidad orbital (km/s) a r radios del centro de la Tierra: v = √(g₀R²/r) = 8 / √r. */
export function velocidadOrbital(rR: number): number {
  return limpio(V_RASANTE / Math.sqrt(rR));
}

/** Ángulo recorrido (rad) por un satélite de período T al cabo de un tiempo t (mismas unidades). */
export const anguloOrbita = (T: number, t: number) => (T > 0 ? (2 * Math.PI * t) / T : 0);
