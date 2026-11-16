// ══ Etapa 2.4 · Examen tipo admisión de vectores (examen genérico + vectores de cada pregunta en 3D) ───────
import { COLOR } from "@/contenido/nivel-02/vectores";
import { RONDAS_EXAMEN_VEC, type PreguntaVec } from "@/contenido/nivel-02/examen";
import { Flecha } from "@/three/vectores/Flecha";
import type { MetaEtapa } from "@/ui/CascaronEtapa";
import { V } from "@/ui/Formula";
import { Examen } from "../Examen";
import type { Vec } from "@/lib/vec";

const META: MetaEtapa = {
  numero: "2.4",
  titulo: "Examen tipo admisión",
  nivel: "Análisis vectorial",
  nivelNum: 2,
  intro: (
    <>
      Diez preguntas de vectores como en un examen de admisión: resultantes máxima y mínima, componentes, ley de cosenos, vector unitario y producto escalar. <b>45 segundos</b> por pregunta, una sola oportunidad.
    </>
  ),
  como: [
    { teclas: ["A", "B", "C", "D", "E"], texto: "responde (o 1–5)" },
    { teclas: ["mouse"], texto: "elige una opción" },
  ],
};

const colores = [COLOR.A, COLOR.B, COLOR.C];

/** Dibuja los vectores de la pregunta, escalados para caber; al responder aparece la resultante. */
function VectoresPregunta({ q, respondida }: { q: PreguntaVec; respondida: boolean }) {
  const vs = q.vectores ?? [];
  const origen: Vec = [0, 0];
  const puntos: Vec[] = [origen];
  for (const x of vs) {
    const d: Vec = x.desde ?? origen;
    puntos.push(d, [d[0] + x.v[0], d[1] + x.v[1]]);
  }
  if (q.resultado) puntos.push(q.resultado);
  const xs = puntos.map((p) => p[0]);
  const ys = puntos.map((p) => p[1]);
  const ancho = Math.max(...xs) - Math.min(...xs);
  const alto = Math.max(...ys) - Math.min(...ys);
  const k = Math.min(3.6 / Math.max(ancho, 1), 2.6 / Math.max(alto, 1), 0.6);
  const cx = -((Math.max(...xs) + Math.min(...xs)) / 2) * k;
  const cy = -((Math.max(...ys) + Math.min(...ys)) / 2) * k;
  const esc = (p: Vec): Vec => [p[0] * k, p[1] * k];
  if (!vs.length && !q.resultado) return null;
  return (
    <group position={[cx, cy, 0]}>
      {vs.map((x, i) => (
        <Flecha key={`${q.id}-${i}`} desde={x.desde ? esc(x.desde) : [0, 0]} hasta={esc([(x.desde?.[0] ?? 0) + x.v[0], (x.desde?.[1] ?? 0) + x.v[1]])} color={colores[i % 3]} etiqueta={<V>{x.n}</V>} grosor={0.8} z={i * 0.01} />
      ))}
      {q.resultado && <Flecha key={`${q.id}-r`} hasta={esc(q.resultado)} color={COLOR.R} variante={respondida ? "solida" : "fantasma"} etiqueta={respondida ? <V>R</V> : undefined} grosor={0.9} z={0.05} />}
    </group>
  );
}

export default function EtapaExamenVectores() {
  return (
    <Examen<PreguntaVec>
      meta={META}
      clave="n2-examen"
      rondas={RONDAS_EXAMEN_VEC}
      vista3D={(q, _op, respondida) => <VectoresPregunta q={q} respondida={respondida} />}
      encuadre={{ w: 5, h: 3.4 }}
      paso={5}
      pie="Los vectores de la pregunta en 3D"
    />
  );
}
