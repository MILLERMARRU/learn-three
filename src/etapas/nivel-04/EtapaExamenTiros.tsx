// ══ Etapa 4.4 · Examen tipo admisión de caída libre y tiro parabólico (al responder, la escena se reproduce en 3D) ───────
import { RONDAS_EXAMEN_TIRO, type PreguntaTiro } from "@/contenido/nivel-04/examen";
import { tSuelo } from "@/lib/tiro";
import { EscenaTiro } from "@/three/tiro/EscenaTiro";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "../Examen";

const META: MetaEtapa = {
  numero: "4.4",
  titulo: "Examen tipo admisión",
  nivel: "Cinemática II",
  nivelNum: 4,
  intro: (
    <>
      Diez preguntas de caída libre y tiro parabólico como en un examen de admisión: rapidez y altura, tiempos simétricos, números de Galileo, lanzamiento horizontal y alcance. <b>45 segundos</b> por pregunta; al responder, la escena se reproduce en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

export default function EtapaExamenTiros() {
  return (
    <Examen<PreguntaTiro>
      meta={META}
      clave="n4-examen"
      rondas={RONDAS_EXAMEN_TIRO}
      vista3D={(q, _op, respondida) => {
        const e = q.escena;
        if (!e) return null;
        return (
          <EscenaTiro
            key={q.id}
            W={e.W}
            H={e.H}
            lanz={e.lanz}
            torre={e.torre ?? 0}
            canasta={e.canasta ?? null}
            reglaX={e.reglaX ?? true}
            corrida={respondida ? { id: 1, tFin: e.tFin ?? tSuelo(e.lanz) } : null}
          />
        );
      }}
      encuadre={{ w: 10.6, h: 7 }}
      centro={[-0.9, 0.15]}
      paso={8.2}
      pie="Al responder, la escena se reproduce en 3D"
    />
  );
}
