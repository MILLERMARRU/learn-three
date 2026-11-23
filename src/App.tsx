// ══ Rutas de la app: #/nivel/{n}/{etapa} (cada etapa se descarga solo al entrar) ───────
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { useRuta } from "@/lib/ruta";
import { Mapa } from "@/paginas/Mapa";

type Etapa = LazyExoticComponent<ComponentType>;

const NIVELES: Record<string, Record<string, Etapa>> = {
  "1": {
    moleculas: lazy(() => import("@/etapas/EtapaMoleculas")),
    balanza: lazy(() => import("@/etapas/EtapaBalanza")),
    laboratorio: lazy(() => import("@/etapas/EtapaLaboratorio")),
    examen: lazy(() => import("@/etapas/EtapaExamen")),
  },
  "2": {
    componentes: lazy(() => import("@/etapas/nivel-02/EtapaComponentes")),
    suma: lazy(() => import("@/etapas/nivel-02/EtapaSuma")),
    paralelogramo: lazy(() => import("@/etapas/nivel-02/EtapaParalelogramo")),
    examen: lazy(() => import("@/etapas/nivel-02/EtapaExamenVectores")),
  },
  "3": {
    prediccion: lazy(() => import("@/etapas/nivel-03/EtapaPrediccion")),
    encuentro: lazy(() => import("@/etapas/nivel-03/EtapaEncuentro")),
    frenado: lazy(() => import("@/etapas/nivel-03/EtapaFrenado")),
    examen: lazy(() => import("@/etapas/nivel-03/EtapaExamenCinematica")),
  },
  "4": {
    caida: lazy(() => import("@/etapas/nivel-04/EtapaCaida")),
    horizontal: lazy(() => import("@/etapas/nivel-04/EtapaHorizontal")),
    parabolico: lazy(() => import("@/etapas/nivel-04/EtapaParabolico")),
    examen: lazy(() => import("@/etapas/nivel-04/EtapaExamenTiros")),
  },
  "5": {
    dibuja: lazy(() => import("@/etapas/nivel-05/EtapaDibujaXT")),
    velocidad: lazy(() => import("@/etapas/nivel-05/EtapaVelocidadVT")),
    area: lazy(() => import("@/etapas/nivel-05/EtapaArea")),
    examen: lazy(() => import("@/etapas/nivel-05/EtapaExamenGraficas")),
  },
  "6": {
    angular: lazy(() => import("@/etapas/nivel-06/EtapaAngular")),
    poleas: lazy(() => import("@/etapas/nivel-06/EtapaPoleas")),
    curva: lazy(() => import("@/etapas/nivel-06/EtapaCurva")),
    examen: lazy(() => import("@/etapas/nivel-06/EtapaExamenCircular")),
  },
  "7": {
    equilibrio: lazy(() => import("@/etapas/nivel-07/EtapaEquilibrio")),
    aparejo: lazy(() => import("@/etapas/nivel-07/EtapaAparejo")),
  },
};

/** Pantalla breve mientras se descarga la etapa. */
function Cargando() {
  return (
    <div className="cargando" role="status" aria-live="polite">
      <span className="cargando-punto" />
      Cargando etapa…
    </div>
  );
}

export default function App() {
  const [a, nivel, etapa] = useRuta();
  const Etapa = a === "nivel" && nivel && etapa ? NIVELES[nivel]?.[etapa] : undefined;
  if (!Etapa) return <Mapa />;
  // key: al cambiar de etapa se monta de cero (estado y escena nuevos)
  return (
    <Suspense fallback={<Cargando />}>
      <Etapa key={`${nivel}-${etapa}`} />
    </Suspense>
  );
}
