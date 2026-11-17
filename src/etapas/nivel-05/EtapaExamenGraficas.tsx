// ══ Etapa 5.4 · Examen tipo admisión de gráficas del movimiento (al responder, el cursor recorre la gráfica) ───────
import { RONDAS_EXAMEN_GRAFICA, type PreguntaGrafica } from "@/contenido/nivel-05/examen";
import { EscenaGrafica } from "@/three/grafica/EscenaGrafica";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";

const META: MetaEtapa = {
  numero: "5.4",
  titulo: "Examen tipo admisión",
  nivel: "Gráficas del movimiento",
  nivelNum: 5,
  intro: (
    <>
      Diez preguntas de gráficas x–t, v–t y a–t como en un examen de admisión: pendientes, áreas, reposo, MRUV y desplazamiento nulo. <b>45 segundos</b> por pregunta; al responder, el cursor recorre la gráfica y el auto se mueve.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenGraficas() {
  return (
    <Examen<PreguntaGrafica>
      meta={META}
      clave="n5-examen"
      rondas={RONDAS_EXAMEN_GRAFICA}
      vista3D={(q, _op, respondida) => {
        const e = q.escena;
        if (!e) return null;
        return <EscenaGrafica key={q.id} T={e.T} paneles={[e.panel]} pista={e.pista ?? null} corrida={respondida ? { id: 1 } : null} />;
      }}
      encuadre={{ w: 10.4, h: 7.6 }}
      centro={[-0.75, 0.3]}
      paso={8.2}
      ancho={9}
      pie="Al responder, el cursor recorre la gráfica"
    />
  );
}
