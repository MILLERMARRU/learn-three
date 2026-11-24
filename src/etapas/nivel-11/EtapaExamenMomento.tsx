// ══ Etapa 11.4 · Examen tipo admisión de cantidad de movimiento y choques (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_MOMENTO, type PreguntaMomento } from "@/contenido/nivel-11/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaMomento } from "./vista";

const META: MetaEtapa = {
  numero: "11.4",
  titulo: "Examen tipo admisión",
  nivel: "Cantidad de movimiento y choques",
  nivelNum: 11,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: impulso, cantidad de movimiento, choques plásticos, elásticos e inelásticos, explosiones y retroceso. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenMomento() {
  return (
    <Examen<PreguntaMomento>
      meta={META}
      clave="n11-examen"
      rondas={RONDAS_EXAMEN_MOMENTO}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaMomento escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 9.8, h: 4.8 }}
      centro={[-0.6, 0.9]}
      paso={9.6}
      ancho={8.8}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
