// ══ Etapa 21.4 · Examen tipo admisión de ondas electromagnéticas (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_ONDAS_EM, type PreguntaOndasEM } from "@/contenido/nivel-21/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaOndasEM } from "./vista";

const META: MetaEtapa = {
  numero: "21.4",
  titulo: "Examen tipo admisión",
  nivel: "Ondas electromagnéticas",
  nivelNum: 21,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: c = λ·f y el espectro electromagnético, polarización y ley de Malus, y el radar. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenOndasEM() {
  return (
    <Examen<PreguntaOndasEM>
      meta={META}
      clave="n21-examen"
      rondas={RONDAS_EXAMEN_ONDAS_EM}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaOndasEM escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 7.8, h: 4.4 }}
      centro={[0.2, -0.1]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
