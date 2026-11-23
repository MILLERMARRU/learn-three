// ══ Etapa 7.4 · Examen tipo admisión de estática (al responder, la escena se muestra en 3D) ───────
import { RONDAS_EXAMEN_ESTATICA, type PreguntaEstatica } from "@/contenido/nivel-07/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaEstatica } from "./vista";

const META: MetaEtapa = {
  numero: "7.4",
  titulo: "Examen tipo admisión",
  nivel: "Estática",
  nivelNum: 7,
  intro: (
    <>
      Diez preguntas de estática como en un examen de admisión: tensiones, planos inclinados, cuerdas a 37° y 53°, rozamiento, poleas y momentos. <b>45 segundos</b> por pregunta; al responder, la escena se muestra en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenEstatica() {
  return (
    <Examen<PreguntaEstatica>
      meta={META}
      clave="n7-examen"
      rondas={RONDAS_EXAMEN_ESTATICA}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaEstatica escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 9.2, h: 6.9 }}
      centro={[-0.6, 0.35]}
      paso={8.2}
      ancho={7.6}
      pie="Al responder, la escena se muestra en 3D"
    />
  );
}
