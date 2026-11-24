// ══ Etapa 19.4 · Examen tipo admisión de condensadores (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_CONDENSADORES, type PreguntaCondensadores } from "@/contenido/nivel-19/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaCondensadores } from "./vista";

const META: MetaEtapa = {
  numero: "19.4",
  titulo: "Examen tipo admisión",
  nivel: "Condensadores",
  nivelNum: 19,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: carga y capacidad, dieléctricos, condensadores en serie y en paralelo, y energía almacenada. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenCondensadores() {
  return (
    <Examen<PreguntaCondensadores>
      meta={META}
      clave="n19-examen"
      rondas={RONDAS_EXAMEN_CONDENSADORES}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaCondensadores escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 7.6, h: 4.6 }}
      centro={[0.15, -0.1]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
