// ══ Etapa 9.4 · Examen tipo admisión de gravitación universal (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_GRAVITACION, type PreguntaGravitacion } from "@/contenido/nivel-09/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaGravitacion } from "./vista";

const META: MetaEtapa = {
  numero: "9.4",
  titulo: "Examen tipo admisión",
  nivel: "Gravitación universal",
  nivelNum: 9,
  intro: (
    <>
      Diez preguntas de gravitación como en un examen de admisión: ley de Newton, gravedad en la altura y en otros planetas, tercera ley de Kepler, velocidad orbital y la diferencia entre masa y peso. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenGravitacion() {
  return (
    <Examen<PreguntaGravitacion>
      meta={META}
      clave="n9-examen"
      rondas={RONDAS_EXAMEN_GRAVITACION}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaGravitacion escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 9.6, h: 6.8 }}
      centro={[-0.6, 0.05]}
      paso={8.2}
      ancho={8.4}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
