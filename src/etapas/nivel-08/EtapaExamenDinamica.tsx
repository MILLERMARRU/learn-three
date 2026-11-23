// ══ Etapa 8.4 · Examen tipo admisión de dinámica (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_DINAMICA, type PreguntaDinamica } from "@/contenido/nivel-08/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaDinamica } from "./vista";

const META: MetaEtapa = {
  numero: "8.4",
  titulo: "Examen tipo admisión",
  nivel: "Dinámica",
  nivelNum: 8,
  intro: (
    <>
      Diez preguntas de dinámica como en un examen de admisión: segunda ley, rozamiento, plano inclinado, máquina de Atwood, bloque en la mesa, tensión y primera ley. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenDinamica() {
  return (
    <Examen<PreguntaDinamica>
      meta={META}
      clave="n8-examen"
      rondas={RONDAS_EXAMEN_DINAMICA}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaDinamica escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 9.4, h: 6.6 }}
      centro={[-0.6, 0.2]}
      paso={8.2}
      ancho={8.4}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
