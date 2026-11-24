// ══ Etapa 15.4 · Examen tipo admisión de calor (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_CALOR, type PreguntaCalor } from "@/contenido/nivel-15/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaCalor } from "./vista";

const META: MetaEtapa = {
  numero: "15.4",
  titulo: "Examen tipo admisión",
  nivel: "Calor",
  nivelNum: 15,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: dilatación térmica, calor sensible, calor específico, capacidad calorífica y equilibrio térmico. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenCalor() {
  return (
    <Examen<PreguntaCalor>
      meta={META}
      clave="n15-examen"
      rondas={RONDAS_EXAMEN_CALOR}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaCalor escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 8.2, h: 5 }}
      centro={[0.1, 0]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
