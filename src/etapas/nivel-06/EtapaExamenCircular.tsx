// ══ Etapa 6.4 · Examen tipo admisión de movimiento circunferencial (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_CIRCULAR, type PreguntaCircular } from "@/contenido/nivel-06/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaCircular } from "./vista";

const META: MetaEtapa = {
  numero: "6.4",
  titulo: "Examen tipo admisión",
  nivel: "Movimiento circunferencial",
  nivelNum: 6,
  intro: (
    <>
      Diez preguntas de movimiento circunferencial como en un examen de admisión: ángulo, periodo y rpm, rapidez tangencial, fajas, engranajes, ejes y aceleración centrípeta. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenCircular() {
  return (
    <Examen<PreguntaCircular>
      meta={META}
      clave="n6-examen"
      rondas={RONDAS_EXAMEN_CIRCULAR}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaCircular escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 9.2, h: 7 }}
      centro={[-0.8, 0.15]}
      paso={8.2}
      ancho={8.4}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
