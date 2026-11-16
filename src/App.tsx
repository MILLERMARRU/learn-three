// ══ Rutas de la app: #/nivel/{n}/{etapa} ───────
import type { JSX } from "react";
import EtapaBalanza from "@/etapas/EtapaBalanza";
import EtapaExamen from "@/etapas/EtapaExamen";
import EtapaLaboratorio from "@/etapas/EtapaLaboratorio";
import EtapaMoleculas from "@/etapas/EtapaMoleculas";
import EtapaComponentes from "@/etapas/nivel-02/EtapaComponentes";
import EtapaExamenVectores from "@/etapas/nivel-02/EtapaExamenVectores";
import EtapaParalelogramo from "@/etapas/nivel-02/EtapaParalelogramo";
import EtapaSuma from "@/etapas/nivel-02/EtapaSuma";
import EtapaEncuentro from "@/etapas/nivel-03/EtapaEncuentro";
import EtapaExamenCinematica from "@/etapas/nivel-03/EtapaExamenCinematica";
import EtapaFrenado from "@/etapas/nivel-03/EtapaFrenado";
import EtapaPrediccion from "@/etapas/nivel-03/EtapaPrediccion";
import { useRuta } from "@/lib/ruta";
import { Mapa } from "@/paginas/Mapa";

const NIVELES: Record<string, Record<string, () => JSX.Element>> = {
  "1": { moleculas: EtapaMoleculas, balanza: EtapaBalanza, laboratorio: EtapaLaboratorio, examen: EtapaExamen },
  "2": { componentes: EtapaComponentes, suma: EtapaSuma, paralelogramo: EtapaParalelogramo, examen: EtapaExamenVectores },
  "3": { prediccion: EtapaPrediccion, encuentro: EtapaEncuentro, frenado: EtapaFrenado, examen: EtapaExamenCinematica },
};

export default function App() {
  const [a, nivel, etapa] = useRuta();
  const Etapa = a === "nivel" && nivel && etapa ? NIVELES[nivel]?.[etapa] : undefined;
  // key: al cambiar de etapa se monta de cero (estado y escena nuevos)
  if (Etapa) return <Etapa key={`${nivel}-${etapa}`} />;
  return <Mapa />;
}
