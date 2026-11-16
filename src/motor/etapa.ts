// ══ Motor de etapas (plantilla común a todos los niveles) ───────
// Rondas: guiado → pista → solo (o examen). Cada ítem se puntúa de 1 a 3
// según errores y pistas usadas; al final se convierten en estrellas.
import { useCallback, useEffect, useReducer, useRef } from "react";
import { guardarEtapa } from "@/lib/progreso";
import { sfx } from "@/lib/sonido";

export type Ronda = "guiado" | "pista" | "solo" | "examen";

export const INFO_RONDA: Record<Ronda, { n: string; titulo: string; corto: string; desc: string }> = {
  guiado: { n: "1", titulo: "Ronda 1 · Guiado", corto: "Guiado", desc: "La respuesta está en pantalla: escríbela encima para aprenderla." },
  pista: { n: "2", titulo: "Ronda 2 · Con pista", corto: "Pista", desc: "Ya no ves la respuesta. Ármala tú, con la pista a mano." },
  solo: { n: "3", titulo: "Ronda 3 · Solo", corto: "Solo", desc: "Sin ayuda. Si te trabas, cada pista cuesta una estrella." },
  examen: { n: "★", titulo: "Examen", corto: "Examen", desc: "Tipo admisión: una sola oportunidad por pregunta." },
};

export interface RondaDef<T> {
  ronda: Ronda;
  items: T[];
}

export interface Intento {
  correcto: boolean;
  errores: number;
  pistas: number;
}

export type Fase = "intro" | "jugando" | "exito" | "fallo" | "fin-ronda" | "fin";

interface Estado {
  fase: Fase;
  r: number;
  i: number;
  errores: number;
  pistas: number;
  res: Intento[][];
  faseId: number; // cambia en cada acierto/error: dispara animaciones 3D
}

type Accion =
  | { t: "continuar" }
  | { t: "acierto" }
  | { t: "error" }
  | { t: "pista" }
  | { t: "fallo" }
  | { t: "avanzar"; tamanos: number[] }
  | { t: "reiniciar"; rondas: number };

const inicial = (rondas: number, fase: Fase = "intro"): Estado => ({
  fase,
  r: 0,
  i: 0,
  errores: 0,
  pistas: 0,
  res: Array.from({ length: rondas }, () => []),
  faseId: 0,
});

function reductor(s: Estado, a: Accion): Estado {
  switch (a.t) {
    case "continuar":
      if (s.fase === "intro") return { ...s, fase: "jugando" };
      if (s.fase === "fin-ronda") return { ...s, fase: "jugando", r: s.r + 1, i: 0, errores: 0, pistas: 0 };
      return s;
    case "error":
      return s.fase === "jugando" ? { ...s, errores: s.errores + 1, faseId: s.faseId + 1 } : s;
    case "pista":
      return s.fase === "jugando" ? { ...s, pistas: s.pistas + 1 } : s;
    case "acierto":
    case "fallo": {
      if (s.fase !== "jugando") return s;
      const res = s.res.map((x) => [...x]);
      res[s.r][s.i] = { correcto: a.t === "acierto", errores: s.errores, pistas: s.pistas };
      return { ...s, res, fase: a.t === "acierto" ? "exito" : "fallo", faseId: s.faseId + 1 };
    }
    case "avanzar": {
      if (s.fase !== "exito" && s.fase !== "fallo") return s;
      if (s.i + 1 < a.tamanos[s.r]) return { ...s, fase: "jugando", i: s.i + 1, errores: 0, pistas: 0 };
      if (s.r + 1 < a.tamanos.length) return { ...s, fase: "fin-ronda" };
      return { ...s, fase: "fin" };
    }
    case "reiniciar":
      return { ...inicial(a.rondas, "jugando"), faseId: s.faseId + 1 };
  }
}

export const puntosDe = (x?: Intento) => (x?.correcto ? Math.max(1, 3 - x.errores - x.pistas) : 0);

export function estrellasDe(puntos: number, maximo: number) {
  if (maximo === 0) return 0;
  const r = puntos / maximo;
  return r >= 0.85 ? 3 : r >= 0.6 ? 2 : r > 0 ? 1 : 0;
}

export interface ConfigEtapa<T> {
  clave: string;
  rondas: RondaDef<T>[];
  avanceMs?: number;
}

export function useEtapa<T extends { id: string }>({ clave, rondas, avanceMs = 1500 }: ConfigEtapa<T>) {
  const [s, despachar] = useReducer(reductor, rondas.length, (n) => inicial(n));
  const timer = useRef<number | undefined>(undefined);
  const tamanos = rondas.map((r) => r.items.length);

  const programarAvance = useCallback(
    (ms: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => despachar({ t: "avanzar", tamanos }), ms);
    },
    // tamanos es estable mientras no cambien las rondas
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tamanos.join(",")],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const ronda = rondas[s.r];
  const item = ronda.items[s.i];
  // lista completa de ejercicios (todas las rondas) para el carrusel 3D
  const todos = rondas.flatMap((rd, r) => rd.items.map((it) => ({ item: it, r, clave: `${r}-${it.id}` })));
  const indiceGlobal = tamanos.slice(0, s.r).reduce((a, b) => a + b, 0) + s.i;
  const maximo = tamanos.reduce((a, b) => a + b, 0) * 3;
  const puntos = s.res.flat().reduce((a, x) => a + puntosDe(x), 0);
  const estrellas = estrellasDe(puntos, maximo);

  // estadísticas para el HUD: aciertos, % a la primera (sin errores ni pistas) y racha actual
  const respondidos = s.res.flat().filter(Boolean);
  const limpio = (x: Intento) => x.correcto && x.errores === 0 && x.pistas === 0;
  let racha = 0;
  for (let k = respondidos.length - 1; k >= 0 && limpio(respondidos[k]); k--) racha++;
  const stats = {
    aciertos: respondidos.filter((x) => x.correcto).length,
    total: tamanos.reduce((a, b) => a + b, 0),
    precision: respondidos.length ? Math.round((respondidos.filter(limpio).length / respondidos.length) * 100) : null,
    racha,
  };

  // al terminar la etapa se guarda el progreso
  useEffect(() => {
    if (s.fase === "fin") guardarEtapa(clave, estrellas, puntos);
    // solo cuando entra en "fin"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.fase]);

  return {
    ...s,
    ronda: ronda.ronda,
    info: INFO_RONDA[ronda.ronda],
    item,
    rondas,
    tamanoRonda: ronda.items.length,
    resRonda: s.res[s.r],
    puntos,
    maximo,
    estrellas,
    stats,
    todos,
    indiceGlobal,
    jugando: s.fase === "jugando",
    acierto: () => {
      if (s.fase !== "jugando") return;
      despachar({ t: "acierto" });
      sfx.acierto();
      window.setTimeout(sfx.polvo, 320);
      programarAvance(avanceMs);
    },
    fallo: (ms = avanceMs + 900) => {
      if (s.fase !== "jugando") return;
      despachar({ t: "fallo" });
      sfx.error();
      programarAvance(ms);
    },
    error: () => {
      despachar({ t: "error" });
      sfx.error();
    },
    /** Pide la siguiente pista; devuelve false si ya no quedan. */
    pedirPista: (max: number) => {
      if (s.fase !== "jugando" || s.pistas >= max) return false;
      despachar({ t: "pista" });
      sfx.pista();
      return true;
    },
    continuar: () => {
      if (s.fase === "fin-ronda") sfx.ronda();
      despachar({ t: "continuar" });
    },
    reiniciar: () => {
      window.clearTimeout(timer.current);
      despachar({ t: "reiniciar", rondas: rondas.length });
    },
  };
}

export type Motor<T extends { id: string }> = ReturnType<typeof useEtapa<T>>;
