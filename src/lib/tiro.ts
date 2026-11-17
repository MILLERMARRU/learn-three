// ══ Física de tiros: caída libre y proyectiles con g = 10 m/s² y los ángulos notables del curso ───────
export const G = 10;

/** Punto y velocidad de salida; `angulo` en grados (90 = hacia arriba, −90 = hacia abajo, 0 = horizontal). */
export interface Lanzamiento {
  x0: number;
  y0: number;
  v: number;
  angulo: number;
}

/** Seno y coseno con los valores del curso (37° → 0,6 y 0,8) para que la simulación dé resultados exactos. */
export function senCos(grados: number): [number, number] {
  switch (grados) {
    case 0:
      return [0, 1];
    case 30:
      return [0.5, Math.sqrt(3) / 2];
    case 37:
      return [0.6, 0.8];
    case 45:
      return [Math.SQRT1_2, Math.SQRT1_2];
    case 53:
      return [0.8, 0.6];
    case 60:
      return [Math.sqrt(3) / 2, 0.5];
    case 90:
      return [1, 0];
    case -90:
      return [-1, 0];
    default: {
      const r = (grados * Math.PI) / 180;
      return [Math.sin(r), Math.cos(r)];
    }
  }
}

export function componentes(l: Lanzamiento): [number, number] {
  const [s, c] = senCos(l.angulo);
  return [l.v * c, l.v * s];
}

export function posicion(l: Lanzamiento, t: number) {
  const [vx, vy] = componentes(l);
  return { x: l.x0 + vx * t, y: l.y0 + vy * t - (G / 2) * t * t, vx, vy: vy - G * t };
}

/** Instante en que toca el suelo (y = 0). */
export function tSuelo(l: Lanzamiento): number {
  const [, vy] = componentes(l);
  return (vy + Math.sqrt(vy * vy + 2 * G * Math.max(0, l.y0))) / G;
}

export const alcance = (v: number, angulo: number) => {
  const [s, c] = senCos(angulo);
  return (2 * v * v * s * c) / G;
};

export const alturaMax = (v: number, angulo: number) => {
  const [s] = senCos(angulo);
  return (v * s) ** 2 / (2 * G);
};

export const redondear = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
