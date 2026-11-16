// ══ Etapa 3.4 · Examen tipo admisión de cinemática (al responder, la escena corre en 3D) ───────
import { RONDAS_EXAMEN_CIN, type PreguntaCin } from "@/contenido/nivel-03/examen";
import { EscenaPista } from "@/three/pista/EscenaPista";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";

const META: MetaEtapa = {
  numero: "3.4",
  titulo: "Examen tipo admisión",
  nivel: "Cinemática I",
  nivelNum: 3,
  intro: (
    <>
      Diez preguntas de MRU y MRUV como en un examen de admisión: conversión de unidades, encuentro, alcance, frenado y los números de Galileo. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenCinematica() {
  return (
    <Examen<PreguntaCin>
      meta={META}
      clave="n3-examen"
      rondas={RONDAS_EXAMEN_CIN}
      vista3D={(q, _op, respondida) =>
        q.escena ? (
          <EscenaPista key={q.id} L={q.escena.L} cada={q.escena.cada ?? (q.escena.L > 100 ? 50 : 10)} moviles={q.escena.moviles} marcas={q.escena.marcas} corrida={respondida ? { id: 1, tFin: q.escena.tFin } : null} />
        ) : null
      }
      encuadre={{ w: 10.5, h: 6.4 }}
      centro={[-1, 0.1]}
      paso={8.2}
      pie="Al responder, la escena corre en 3D"
    />
  );
}
