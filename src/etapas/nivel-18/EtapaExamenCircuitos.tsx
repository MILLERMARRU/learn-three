// ══ Etapa 18.4 · Examen tipo admisión de electrodinámica (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_CIRCUITOS, type PreguntaCircuitos } from "@/contenido/nivel-18/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaCircuitos } from "./vista";

const META: MetaEtapa = {
  numero: "18.4",
  titulo: "Examen tipo admisión",
  nivel: "Electrodinámica",
  nivelNum: 18,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: ley de Ohm, resistencias en serie y en paralelo, potencia eléctrica y energía consumida. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenCircuitos() {
  return (
    <Examen<PreguntaCircuitos>
      meta={META}
      clave="n18-examen"
      rondas={RONDAS_EXAMEN_CIRCUITOS}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaCircuitos escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 7.8, h: 4.6 }}
      centro={[-0.1, 0]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
