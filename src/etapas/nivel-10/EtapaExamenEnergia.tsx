// ══ Etapa 10.4 · Examen tipo admisión de trabajo, energía y potencia (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_ENERGIA, type PreguntaEnergia } from "@/contenido/nivel-10/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaEnergia } from "./vista";

const META: MetaEtapa = {
  numero: "10.4",
  titulo: "Examen tipo admisión",
  nivel: "Trabajo, energía y potencia",
  nivelNum: 10,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: trabajo de una fuerza, teorema del trabajo y la energía, conservación de la energía mecánica, potencia y rendimiento. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenEnergia() {
  return (
    <Examen<PreguntaEnergia>
      meta={META}
      clave="n10-examen"
      rondas={RONDAS_EXAMEN_ENERGIA}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaEnergia escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 9.8, h: 5.8 }}
      centro={[-0.4, 1.0]}
      paso={9.6}
      ancho={8.8}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
