// ══ Etapa 12.4 · Examen tipo admisión de oscilaciones (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_OSCILACION, type PreguntaOscilacion } from "@/contenido/nivel-12/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaOscilacion } from "./vista";

const META: MetaEtapa = {
  numero: "12.4",
  titulo: "Examen tipo admisión",
  nivel: "Oscilaciones (MAS)",
  nivelNum: 12,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: sistema masa-resorte, péndulo simple, velocidad y aceleración máximas, rapidez en un punto y energía del oscilador. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenOscilacion() {
  return (
    <Examen<PreguntaOscilacion>
      meta={META}
      clave="n12-examen"
      rondas={RONDAS_EXAMEN_OSCILACION}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaOscilacion escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 8.2, h: 4.8 }}
      centro={[-0.7, 1.1]}
      paso={8.6}
      ancho={7.4}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
