// ══ Progreso del alumno en localStorage ───────
import { useSyncExternalStore } from "react";

export interface ProgresoEtapa {
  estrellas: number;
  puntos: number;
  veces: number;
}
export type Progreso = Record<string, ProgresoEtapa>;

const CLAVE = "f3d:progreso";
const EVENTO = "f3d:progreso";
const VACIO: Progreso = {};
let crudoCache: string | null = null;
let cache: Progreso = VACIO;

function leer(): Progreso {
  let crudo: string | null = null;
  try {
    crudo = localStorage.getItem(CLAVE);
  } catch {}
  if (crudo !== crudoCache) {
    crudoCache = crudo;
    try {
      cache = crudo ? (JSON.parse(crudo) as Progreso) : VACIO;
    } catch {
      cache = VACIO;
    }
  }
  return cache;
}

function suscribir(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENTO, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENTO, cb);
  };
}

export function useProgreso(): Progreso {
  return useSyncExternalStore(suscribir, leer, () => VACIO);
}

export function guardarEtapa(clave: string, estrellas: number, puntos: number) {
  const actual = { ...leer() };
  const prev = actual[clave];
  actual[clave] = {
    estrellas: Math.max(prev?.estrellas ?? 0, estrellas),
    puntos: Math.max(prev?.puntos ?? 0, puntos),
    veces: (prev?.veces ?? 0) + 1,
  };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(actual));
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}
