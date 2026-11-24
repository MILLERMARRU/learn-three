// ══ Etapa 16.4 · Examen tipo admisión de termodinámica (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_TERMO, type PreguntaTermo } from "@/contenido/nivel-16/examen";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";
import { VistaTermo } from "./vista";

const META: MetaEtapa = {
  numero: "16.4",
  titulo: "Examen tipo admisión",
  nivel: "Termodinámica",
  nivelNum: 16,
  intro: (
    <>
      Diez preguntas como en un examen de admisión: leyes de Boyle y Charles, temperatura absoluta, trabajo de un gas, primera ley, eficiencia, Carnot y segunda ley. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenTermo() {
  return (
    <Examen<PreguntaTermo>
      meta={META}
      clave="n16-examen"
      rondas={RONDAS_EXAMEN_TERMO}
      vista3D={(q, _op, respondida) => (q.escena ? <VistaTermo escena={q.escena} id={q.id} corre={respondida} /> : null)}
      encuadre={{ w: 8.2, h: 5 }}
      centro={[-0.2, -0.15]}
      paso={9}
      ancho={7.6}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
