// ══ Etapa 20.4 · Examen tipo admisión de electromagnetismo (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_MAGNETISMO, type PreguntaMagnetismo } from "@/contenido/nivel-20/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaMagnetismo } from "./vista";

const META: MetaEtapa = {
  numero: "20.4",
  titulo: "Examen tipo admisión",
  nivel: "Electromagnetismo",
  nivelNum: 20,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: fuerza sobre un conductor, campo de un cable recto y su superposición, fem por movimiento, ley de Faraday y ley de Lenz. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenMagnetismo() {
  return (
    <Examen<PreguntaMagnetismo>
      meta={META}
      clave="n20-examen"
      rondas={RONDAS_EXAMEN_MAGNETISMO}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaMagnetismo escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 7.8, h: 4.6 }}
      centro={[0.2, 0.05]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
