// ══ Etapa 17.4 · Examen tipo admisión de electrostática (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_ELECTRO, type PreguntaElectro } from "@/contenido/nivel-17/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaElectro } from "./vista";

const META: MetaEtapa = {
  numero: "17.4",
  titulo: "Examen tipo admisión",
  nivel: "Electrostática",
  nivelNum: 17,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: ley de Coulomb, signos de las cargas, campo eléctrico y su superposición, potencial y trabajo del campo. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenElectro() {
  return (
    <Examen<PreguntaElectro>
      meta={META}
      clave="n17-examen"
      rondas={RONDAS_EXAMEN_ELECTRO}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaElectro escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 8.6, h: 5 }}
      centro={[0.1, -0.1]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
