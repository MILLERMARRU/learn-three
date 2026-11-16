// ══ Nivel 1 · Etapa 1.2: principio de homogeneidad dimensional ───────
import type { ReactNode } from "react";
import type { Dim } from "@/lib/dim";
import type { RondaDef } from "@/motor/etapa";
import { Op, Sup, V } from "@/ui/Formula";

export interface ProblemaPHD {
  id: string;
  contexto: string;
  ecuacion: ReactNode;
  variables: { s: ReactNode; nombre: string; dim: Dim }[];
  incognita: ReactNode;
  referencia: { etiqueta: ReactNode; dim: Dim };
  termino: { etiqueta: ReactNode; cofactor: Dim; cofactorTxt: ReactNode };
  respuesta: Dim;
  pistas: [string, string];
  nota?: string;
}

const pos = { s: <V>x</V>, nombre: "posición", dim: { L: 1 } };
const tiempo = { s: <V>t</V>, nombre: "tiempo", dim: { T: 1 } };
const vel = { s: <V>v</V>, nombre: "velocidad", dim: { L: 1, T: -1 } };
const fuerza = { s: <V>F</V>, nombre: "fuerza", dim: { M: 1, L: 1, T: -2 } };

const P: Record<string, ProblemaPHD> = {
  mruvA: {
    id: "mruvA", contexto: "Posición de un móvil",
    ecuacion: <><V>x</V><Op>=</Op><V>A</V><V>t</V><Op>+</Op><V>B</V><V>t</V><Sup>2</Sup></>,
    variables: [pos, tiempo], incognita: <V>A</V>,
    referencia: { etiqueta: <V>x</V>, dim: { L: 1 } },
    termino: { etiqueta: <><V>A</V><V>t</V></>, cofactor: { T: 1 }, cofactorTxt: "T" },
    respuesta: { L: 1, T: -1 },
    pistas: ["Cada sumando debe tener la dimensión de x, es decir L.", "[A]·T = L  →  [A] = L ÷ T"],
  },
  vA: {
    id: "vA", contexto: "Velocidad que cambia con el tiempo",
    ecuacion: <><V>v</V><Op>=</Op><V>A</V><Op>+</Op><V>B</V><V>t</V></>,
    variables: [vel, tiempo], incognita: <V>A</V>,
    referencia: { etiqueta: <V>v</V>, dim: { L: 1, T: -1 } },
    termino: { etiqueta: <V>A</V>, cofactor: {}, cofactorTxt: "1" },
    respuesta: { L: 1, T: -1 },
    pistas: ["A está sola en su sumando: debe medir lo mismo que v.", "[A] = [v]"],
  },
  energiaA: {
    id: "energiaA", contexto: "Energía de un cuerpo en movimiento",
    ecuacion: <><V>E</V><Op>=</Op><V>A</V><V>v</V><Sup>2</Sup></>,
    variables: [{ s: <V>E</V>, nombre: "energía", dim: { M: 1, L: 2, T: -2 } }, vel], incognita: <V>A</V>,
    referencia: { etiqueta: <V>E</V>, dim: { M: 1, L: 2, T: -2 } },
    termino: { etiqueta: <><V>A</V><V>v</V><Sup>2</Sup></>, cofactor: { L: 2, T: -2 }, cofactorTxt: "L²T⁻²" },
    respuesta: { M: 1 },
    pistas: ["A por v² debe dar una energía.", "[A]·L²T⁻² = ML²T⁻²  →  todo se cancela menos M"],
  },
  mruvB: {
    id: "mruvB", contexto: "Posición de un móvil",
    ecuacion: <><V>x</V><Op>=</Op><V>A</V><V>t</V><Op>+</Op><V>B</V><V>t</V><Sup>2</Sup></>,
    variables: [pos, tiempo], incognita: <V>B</V>,
    referencia: { etiqueta: <V>x</V>, dim: { L: 1 } },
    termino: { etiqueta: <><V>B</V><V>t</V><Sup>2</Sup></>, cofactor: { T: 2 }, cofactorTxt: "T²" },
    respuesta: { L: 1, T: -2 },
    pistas: ["B·t² también debe medir L.", "[B]·T² = L  →  [B] = L ÷ T²"],
  },
  vB: {
    id: "vB", contexto: "Velocidad que cambia con el tiempo",
    ecuacion: <><V>v</V><Op>=</Op><V>A</V><Op>+</Op><V>B</V><V>t</V></>,
    variables: [vel, tiempo], incognita: <V>B</V>,
    referencia: { etiqueta: <V>v</V>, dim: { L: 1, T: -1 } },
    termino: { etiqueta: <><V>B</V><V>t</V></>, cofactor: { T: 1 }, cofactorTxt: "T" },
    respuesta: { L: 1, T: -2 },
    pistas: ["B·t debe medir lo mismo que v.", "[B]·T = LT⁻¹  →  [B] = LT⁻²"],
  },
  resorte: {
    id: "resorte", contexto: "Ley del resorte",
    ecuacion: <><V>F</V><Op>=</Op><V>k</V><V>x</V></>,
    variables: [fuerza, { s: <V>x</V>, nombre: "deformación", dim: { L: 1 } }], incognita: <V>k</V>,
    referencia: { etiqueta: <V>F</V>, dim: { M: 1, L: 1, T: -2 } },
    termino: { etiqueta: <><V>k</V><V>x</V></>, cofactor: { L: 1 }, cofactorTxt: "L" },
    respuesta: { M: 1, T: -2 },
    pistas: ["k por una longitud debe dar una fuerza.", "[k]·L = MLT⁻²  →  la L se cancela"],
  },
  presion: {
    id: "presion", contexto: "Presión dentro de un líquido",
    ecuacion: <><V>p</V><Op>=</Op><V>p</V><sub className="fx-sub">0</sub><Op>+</Op><V>A</V><V>h</V></>,
    variables: [{ s: <V>p</V>, nombre: "presión", dim: { M: 1, L: -1, T: -2 } }, { s: <V>h</V>, nombre: "profundidad", dim: { L: 1 } }], incognita: <V>A</V>,
    referencia: { etiqueta: <V>p</V>, dim: { M: 1, L: -1, T: -2 } },
    termino: { etiqueta: <><V>A</V><V>h</V></>, cofactor: { L: 1 }, cofactorTxt: "L" },
    respuesta: { M: 1, L: -2, T: -2 },
    pistas: ["A·h debe medir lo mismo que una presión.", "[A]·L = ML⁻¹T⁻²  →  [A] = ML⁻²T⁻²"],
  },
  seno: {
    id: "seno", contexto: "Una oscilación",
    ecuacion: <><V>y</V><Op>=</Op><V>R</V> sen(<V>ω</V><V>t</V>)</>,
    variables: [{ s: <V>y</V>, nombre: "posición", dim: { L: 1 } }, tiempo], incognita: <V>ω</V>,
    referencia: { etiqueta: "1", dim: {} },
    termino: { etiqueta: <><V>ω</V><V>t</V></>, cofactor: { T: 1 }, cofactorTxt: "T" },
    respuesta: { T: -1 },
    pistas: ["El argumento de un seno siempre es adimensional (vale 1).", "[ω]·T = 1  →  [ω] = T⁻¹"],
    nota: "Lo de dentro de sen, cos o log es adimensional: en el platillo izquierdo va 1.",
  },
  arrastre: {
    id: "arrastre", contexto: "Fuerza de arrastre del aire",
    ecuacion: <><V>F</V><Op>=</Op><V>A</V><V>v</V><Op>+</Op><V>B</V><V>v</V><Sup>2</Sup></>,
    variables: [fuerza, vel], incognita: <V>B</V>,
    referencia: { etiqueta: <V>F</V>, dim: { M: 1, L: 1, T: -2 } },
    termino: { etiqueta: <><V>B</V><V>v</V><Sup>2</Sup></>, cofactor: { L: 2, T: -2 }, cofactorTxt: "L²T⁻²" },
    respuesta: { M: 1, L: -1 },
    pistas: ["B·v² debe medir lo mismo que una fuerza.", "[B]·L²T⁻² = MLT⁻²  →  [B] = ML⁻¹"],
  },
};

export const RONDAS_BALANZA: RondaDef<ProblemaPHD>[] = [
  { ronda: "guiado", items: [P.mruvA, P.vA, P.energiaA] },
  { ronda: "pista", items: [P.mruvB, P.vB, P.resorte] },
  { ronda: "solo", items: [P.presion, P.seno, P.arrastre] },
];
