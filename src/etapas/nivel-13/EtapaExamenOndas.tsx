// ══ Etapa 13.4 · Examen tipo admisión de ondas mecánicas (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_ONDAS, type PreguntaOndas } from "@/contenido/nivel-13/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaOndas } from "./vista";

const META: MetaEtapa = {
  numero: "13.4",
  titulo: "Examen tipo admisión",
  nivel: "Ondas mecánicas",
  nivelNum: 13,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: v = λ·f, período, sonido, velocidad en cuerdas, armónicos, nodos y qué transporta una onda. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenOndas() {
  return (
    <Examen<PreguntaOndas>
      meta={META}
      clave="n13-examen"
      rondas={RONDAS_EXAMEN_ONDAS}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaOndas escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 8.6, h: 3.9 }}
      centro={[-0.5, 0]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
