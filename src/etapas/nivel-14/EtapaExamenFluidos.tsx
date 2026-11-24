// ══ Etapa 14.4 · Examen tipo admisión de hidrostática (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_FLUIDOS, type PreguntaFluidos } from "@/contenido/nivel-14/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaFluidos } from "./vista";

const META: MetaEtapa = {
  numero: "14.4",
  titulo: "Examen tipo admisión",
  nivel: "Hidrostática",
  nivelNum: 14,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: presión hidrostática y absoluta, paradoja hidrostática, prensa hidráulica, empuje y flotación. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenFluidos() {
  return (
    <Examen<PreguntaFluidos>
      meta={META}
      clave="n14-examen"
      rondas={RONDAS_EXAMEN_FLUIDOS}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaFluidos escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 7.8, h: 5.4 }}
      centro={[-0.4, 0.1]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
