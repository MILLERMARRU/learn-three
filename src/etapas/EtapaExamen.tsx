// ══ Etapa 1.4 · Examen tipo admisión (usa el examen genérico con vista previa de moléculas) ───────
import { RONDAS_EXAMEN, type Pregunta } from "@/contenido/nivel-01/examen";
import { Molecula } from "@/three/Molecula";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { Examen } from "./Examen";

const META: MetaEtapa = {
  numero: "1.4",
  titulo: "Examen tipo admisión",
  nivel: "Análisis dimensional",
  nivelNum: 1,
  intro: (
    <>
      Diez preguntas de opción múltiple, como en un examen de admisión. Tienes <b>45 segundos</b> por pregunta y una sola oportunidad. Pasa el mouse por las opciones para ver su molécula en 3D.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "vista previa de cada opción" },
  ],
};

export default function EtapaExamen() {
  return (
    <Examen<Pregunta>
      meta={META}
      clave="n1-examen"
      rondas={RONDAS_EXAMEN}
      vista3D={(q, op, respondida, fase, faseId) => {
        const o = op !== null ? q.opciones[op] : null;
        if (!o || !(o.dim || o.unidad)) return null;
        return <Molecula key={`${q.id}-${op}-${respondida}`} dim={o.dim ?? {}} unidad={o.unidad} variante={respondida ? "solida" : "fantasma"} fase={fase} faseId={faseId} tips={respondida} />;
      }}
    />
  );
}
